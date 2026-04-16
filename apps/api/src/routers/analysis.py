import asyncio
import base64
import hashlib
import json
import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..config import get_settings
from ..middleware.budget_guard import budget_protection
from ..models.schemas import AnalysisJob, AnalysisRequest, BudgetInfo, CompareRequest
from ..services.agent_orchestrator import agent_orchestrator
from ..services.job_store import job_store
from ..utils.supabase_client import supabase
from ..utils.validators import validate_file_size, validate_url

logger = logging.getLogger("luminae.analysis")
settings = get_settings()

router = APIRouter(prefix="/api/v1", tags=["analysis"])
security = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> str:
    if not credentials:
        return "guest_user"

    token = credentials.credentials
    if not supabase:
        return "development_user"
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            return "guest_user"
        return user_res.user.id
    except Exception:
        return "guest_user"


async def run_analysis(job_id: str, request: AnalysisRequest, user_id: str):
    try:
        options = request.options.model_dump() if request.options else {}
        is_url_mode = bool(request.file_url and not request.file_base64)

        if is_url_mode:
            # URL mode: pass URL directly to Mistral OCR — no upload needed
            file_hash = hashlib.sha256(request.file_url.encode()).hexdigest()
        else:
            # File upload mode: decode base64/hex payload
            if request.file_base64:
                try:

                    def decode_payload():
                        try:
                            return bytes.fromhex(request.file_base64)
                        except ValueError:
                            return base64.b64decode(request.file_base64)

                    file_content = await asyncio.to_thread(decode_payload)
                    # Cache the PDF for the viewer
                    redis_client = await budget_protection.get_redis()
                    if redis_client:
                        await redis_client.setex(
                            f"job:{job_id}:pdf_payload", 86400 * 7, file_content
                        )
                except Exception as e:
                    logger.error(f"File decode failed for job {job_id}: {e}")
                    await job_store.save_job(
                        job_id,
                        {
                            "job_id": job_id,
                            "status": "error",
                            "error_message": f"File decode failed: {e}",
                        },
                    )
                    return
            else:
                logger.error(f"No file payload for job {job_id}")
                await job_store.save_job(
                    job_id,
                    {"job_id": job_id, "status": "error", "error_message": "No file data provided"},
                )
                return
            file_hash = hashlib.sha256(file_content).hexdigest()

        await job_store.save_job(
            job_id,
            AnalysisJob(
                job_id=job_id,
                status="uploaded",
                check_status_url=f"/api/v1/status/{job_id}",
            ).model_dump(),
        )

        if supabase:
            try:

                def save_initial():
                    supabase.table("papers").insert(
                        {
                            "id": job_id,
                            "user_id": user_id,
                            "filename": request.filename,
                            "file_hash": file_hash,
                            "status": "processing_ocr",
                            "total_cost_usd": 0,
                        }
                    ).execute()

                await asyncio.to_thread(save_initial)
            except Exception:
                pass

        if is_url_mode:
            result = await agent_orchestrator.analyze_paper_url(
                url=request.file_url,
                filename=request.filename,
                extract_figures=options.get("extract_figures", True),
                generate_grant=options.get("generate_grant", True),
            )
        else:
            result = await agent_orchestrator.analyze_paper(
                file_content=file_content,
                filename=request.filename,
                extract_figures=options.get("extract_figures", True),
                generate_grant=options.get("generate_grant", True),
            )

        await job_store.save_result(job_id, result)
        await job_store.save_job(
            job_id,
            AnalysisJob(
                job_id=job_id,
                status="complete",
                check_status_url=f"/api/v1/status/{job_id}",
                analysis=result,
                economics=result.get("economics"),
            ).model_dump(),
        )
        if supabase:
            try:

                def save_completion():
                    supabase.table("papers").update(
                        {
                            "status": "complete",
                            "title": result.get("metadata", {}).get("title"),
                            "total_cost_usd": result.get("economics", {}).get(
                                "estimated_cost_usd", 0
                            ),
                        }
                    ).eq("id", job_id).execute()

                    supabase.table("analyses").insert(
                        {
                            "paper_id": job_id,
                            "methodology_critique": result.get("critique", {}).get(
                                "methodology", {}
                            ),
                            "dataset_audit": result.get("critique", {}).get("dataset", {}),
                            "experiment_proposals": result.get("improvements", {}).get(
                                "experiments", []
                            ),
                            "synthesis": {
                                "key_insights": result.get("improvements", {}).get(
                                    "key_insights", []
                                )
                            },
                            "grant_outline": result.get("grant_outline", {}),
                            "overall_confidence": result.get("critique", {})
                            .get("methodology", {})
                            .get("confidence", 0.8),
                            "processing_time_ms": result.get("metadata", {}).get(
                                "processing_duration_ms", 0
                            ),
                        }
                    ).execute()

                await asyncio.to_thread(save_completion)
            except Exception as e:
                logger.warning(f"Failed saving completion to supabase: {e}")

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Analysis failed for {job_id}: {error_msg}")
        await job_store.save_job(
            job_id,
            AnalysisJob(
                job_id=job_id,
                status="error",
                error_message=error_msg,
            ).model_dump(),
        )
        if supabase:
            try:
                await asyncio.to_thread(
                    lambda: (
                        supabase.table("papers")
                        .update({"status": "error", "error_message": error_msg})
                        .eq("id", job_id)
                        .execute()
                    )
                )
            except Exception:
                pass


async def run_comparison(comparison_id: str, request: CompareRequest, user_id: str):
    try:
        from ..services.reasoning_service import reasoning_service

        await job_store.save_job(
            comparison_id,
            AnalysisJob(
                job_id=comparison_id,
                status="synthesizing",
                check_status_url=f"/api/v1/status/{comparison_id}",
            ).model_dump(),
        )

        papers_data = {}
        for j_id in request.job_ids:
            res = await job_store.get_result(j_id)
            if res:
                papers_data[j_id] = {
                    "title": res.get("metadata", {}).get("title"),
                    "methodology": res.get("critique", {}).get("methodology"),
                    "dataset": res.get("critique", {}).get("dataset"),
                    "experiments": res.get("improvements", {}).get("experiments"),
                }

        if len(papers_data) < 2:
            raise ValueError("Could not retrieve enough valid analyses for comparison.")

        comparison_result = await reasoning_service.compare_papers(papers_data)

        result_payload = {
            "metadata": {
                "title": "Multi-Paper Comparison",
                "source_job_ids": list(papers_data.keys()),
            },
            "comparison": comparison_result,
        }

        await job_store.save_result(comparison_id, result_payload)
        await job_store.save_job(
            comparison_id,
            AnalysisJob(
                job_id=comparison_id,
                status="complete",
                check_status_url=f"/api/v1/status/{comparison_id}",
                analysis=result_payload,
            ).model_dump(),
        )

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Comparison failed for {comparison_id}: {error_msg}")
        await job_store.save_job(
            comparison_id,
            AnalysisJob(
                job_id=comparison_id,
                status="error",
                error_message=error_msg,
            ).model_dump(),
        )


@router.post("/analyze", response_model=AnalysisJob)
async def analyze_paper(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    if not await budget_protection.check_global_budget():
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable. Budget threshold reached. Try demo mode.",
        )

    if not request.file_base64 and not request.file_url:
        raise HTTPException(status_code=400, detail="Either file_base64 or file_url required")

    # SSRF protection: validate URL before passing to OCR
    if request.file_url:
        is_valid, error_msg = validate_url(request.file_url)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid URL: {error_msg}")

    # Server-side file size enforcement
    if request.file_base64:
        is_valid, error_msg = validate_file_size(request.file_base64)
        if not is_valid:
            raise HTTPException(status_code=413, detail=error_msg)

    estimated_cost = 0.05
    if not await budget_protection.check_request_budget(estimated_cost):
        raise HTTPException(
            status_code=402,
            detail=f"Estimated cost ${estimated_cost} exceeds max request limit",
        )

    job_id = str(uuid.uuid4())

    # Save initial job status so polling never hits a 404 gap
    initial_job = AnalysisJob(
        job_id=job_id,
        status="processing_ocr",
        estimated_cost_usd=estimated_cost,
        estimated_time_seconds=45,
        check_status_url=f"/api/v1/status/{job_id}",
        paper={"id": job_id, "filename": request.filename},
    )
    await job_store.save_job(job_id, initial_job.model_dump())

    background_tasks.add_task(run_analysis, job_id, request, user_id)

    return initial_job


@router.get("/status/{job_id}", response_model=AnalysisJob)
async def get_status(job_id: str, user_id: str = Depends(get_current_user_id)):
    # Try Redis first (survives restarts)
    job_data = await job_store.get_job(job_id)
    if job_data:
        return AnalysisJob(**job_data)
    # Fall back to Supabase for historical jobs
    if supabase:
        try:
            paper_res = (
                supabase.table("papers")
                .select("id, status, filename, error_message")
                .eq("id", job_id)
                .execute()
            )
            if paper_res.data:
                paper = paper_res.data[0]
                return AnalysisJob(
                    job_id=job_id,
                    status=paper["status"],
                    error_message=paper.get("error_message"),
                    check_status_url=f"/api/v1/status/{job_id}",
                    paper={"id": job_id, "filename": paper.get("filename")},
                )
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Job not found")


@router.get("/results/{job_id}", response_model=AnalysisJob)
async def get_results(job_id: str, user_id: str = Depends(get_current_user_id)):
    # Try Redis first (consistent with get_status)
    job_data = await job_store.get_job(job_id)
    if job_data:
        job = AnalysisJob(**job_data)
        if job.status == "complete":
            result = await job_store.get_result(job_id) or {}
            return AnalysisJob(
                job_id=job_id,
                status="complete",
                check_status_url=f"/api/v1/status/{job_id}",
                analysis=result,
                economics=result.get("economics"),
                paper={"id": job_id, "filename": job.paper.get("filename") if job.paper else ""},
            )
        return job

    # Fall back to Supabase for historical jobs
    if supabase:
        try:
            paper_res = supabase.table("papers").select("*").eq("id", job_id).execute()
            if paper_res.data:
                paper = paper_res.data[0]
                if paper["status"] == "complete":
                    analysis_res = (
                        supabase.table("analyses").select("*").eq("paper_id", job_id).execute()
                    )
                    if analysis_res.data:
                        analysis_data = analysis_res.data[0]
                        result = {
                            "metadata": {
                                "title": paper.get("title"),
                                "processing_duration_ms": analysis_data.get("processing_time_ms"),
                            },
                            "critique": {
                                "methodology": analysis_data.get("methodology_critique"),
                                "dataset": analysis_data.get("dataset_audit"),
                            },
                            "improvements": {
                                "experiments": analysis_data.get("experiment_proposals"),
                                "key_insights": analysis_data.get("synthesis", {}).get(
                                    "key_insights", []
                                ),
                            },
                            "grant_outline": analysis_data.get("grant_outline"),
                            "economics": {"estimated_cost_usd": paper.get("total_cost_usd")},
                        }
                        return AnalysisJob(
                            job_id=job_id,
                            status="complete",
                            check_status_url=f"/api/v1/status/{job_id}",
                            analysis=result,
                            economics=result["economics"],
                            paper={"id": job_id, "filename": paper.get("filename")},
                        )
                else:
                    return AnalysisJob(
                        job_id=job_id,
                        status=paper["status"],
                        error_message=paper.get("error_message"),
                        check_status_url=f"/api/v1/status/{job_id}",
                        paper={"id": job_id, "filename": paper.get("filename")},
                    )
        except Exception as e:
            logger.warning(f"Failed fetching from supabase, falling back: {e}")

    raise HTTPException(status_code=404, detail="Job not found")


@router.get("/stream/{job_id}")
async def stream_status(job_id: str, request: Request):
    """Server-Sent Events endpoint for real-time job progress."""

    async def event_generator():
        last_status = None
        max_stream_seconds = 180
        poll_interval_seconds = 2.0
        heartbeat_interval_seconds = 10.0
        started_at = asyncio.get_event_loop().time()
        next_heartbeat_at = started_at + heartbeat_interval_seconds

        while True:
            if await request.is_disconnected():
                logger.info(f"SSE client disconnected for job {job_id}")
                break

            now = asyncio.get_event_loop().time()
            if now - started_at >= max_stream_seconds:
                # Explicit timeout event prevents clients from hanging indefinitely.
                yield "event: timeout\n"
                yield f"data: {json.dumps({'status': 'timeout', 'job_id': job_id, 'message': 'Stream timed out; reconnect to continue.'})}\n\n"
                break

            try:
                job_data = await job_store.get_job(job_id)
            except Exception as e:
                logger.warning(f"SSE job lookup failed for {job_id}: {e}")
                yield "event: error\n"
                yield f"data: {json.dumps({'status': 'error', 'job_id': job_id, 'error_message': 'Failed to read job status'})}\n\n"
                break

            if not job_data:
                # If job not found in redis, it might be in supabase (or doesn't exist).
                if supabase:
                    try:
                        res = supabase.table("papers").select("status").eq("id", job_id).execute()
                        if res.data:
                            status = res.data[0]["status"]
                            if status != last_status:
                                last_status = status
                                payload = {"status": status, "job_id": job_id}
                                yield f"data: {json.dumps(payload)}\n\n"

                            if status in ("complete", "error"):
                                # Send explicit terminal event then close.
                                event_name = "complete" if status == "complete" else "error"
                                yield f"event: {event_name}\n"
                                yield f"data: {json.dumps({'status': status, 'job_id': job_id})}\n\n"
                                break
                        else:
                            # Deterministic not-found signal for frontend fallback logic.
                            yield "event: error\n"
                            yield f"data: {json.dumps({'status': 'error', 'job_id': job_id, 'error': 'Job not found'})}\n\n"
                            break
                    except Exception as e:
                        logger.warning(f"SSE supabase lookup failed for {job_id}: {e}")
                        yield "event: error\n"
                        yield f"data: {json.dumps({'status': 'error', 'job_id': job_id, 'error_message': 'Status lookup failed'})}\n\n"
                        break
                else:
                    yield "event: error\n"
                    yield f"data: {json.dumps({'status': 'error', 'job_id': job_id, 'error': 'Job not found'})}\n\n"
                    break
            else:
                status = job_data.get("status")
                # Send update if status changed.
                if status != last_status:
                    last_status = status
                    yield f"data: {json.dumps(job_data)}\n\n"

                if status in ("complete", "error"):
                    # Send explicit terminal event and terminal payload.
                    event_name = "complete" if status == "complete" else "error"
                    yield f"event: {event_name}\n"
                    yield f"data: {json.dumps(job_data)}\n\n"
                    break

            # Heartbeat to keep proxy/load balancer connections alive.
            now = asyncio.get_event_loop().time()
            if now >= next_heartbeat_at:
                yield ": heartbeat\n\n"
                next_heartbeat_at = now + heartbeat_interval_seconds

            await asyncio.sleep(poll_interval_seconds)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/reanalyze", response_model=AnalysisJob)
async def reanalyze(job_id: str, user_id: str = Depends(get_current_user_id)):
    original = await job_store.get_result(job_id)
    if not original:
        raise HTTPException(status_code=404, detail="Original analysis not found")

    new_job_id = str(uuid.uuid4())

    if original.get("extraction", {}).get("ocr_text"):
        paper_text = original["extraction"]["ocr_text"]
        figures = original["extraction"].get("figures", [])
        original["extraction"].get("tables", [])  # tables available but unused

        from ..services.reasoning_service import reasoning_service

        methodology_critique = await reasoning_service.analyze_methodology(paper_text, figures)
        dataset_audit = await reasoning_service.audit_dataset(paper_text)
        experiments = await reasoning_service.design_experiments(
            paper_text, methodology_critique, dataset_audit
        )
        synthesis = await reasoning_service.synthesize(
            methodology_critique, dataset_audit, experiments
        )
        grant_outline = await reasoning_service.generate_grant(synthesis, experiments)

        result = original.copy()
        result["paper_id"] = new_job_id
        result["critique"] = {"methodology": methodology_critique, "dataset": dataset_audit}
        result["improvements"] = {
            "experiments": experiments,
            "key_insights": synthesis.get("key_insights", []),
        }
        result["grant_outline"] = grant_outline

        await job_store.save_result(new_job_id, result)

        return AnalysisJob(
            job_id=new_job_id,
            status="complete",
            analysis=result,
            economics=result.get("economics"),
        )

    raise HTTPException(status_code=400, detail="Cannot reanalyze - missing original data")


@router.post("/compare", response_model=AnalysisJob)
async def compare_papers(
    request: CompareRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    if not await budget_protection.check_global_budget():
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable. Budget threshold reached.",
        )

    estimated_cost = len(request.job_ids) * 0.02
    if not await budget_protection.check_request_budget(estimated_cost):
        raise HTTPException(
            status_code=402,
            detail=f"Estimated cost ${estimated_cost} exceeds max request limit",
        )

    comparison_id = str(uuid.uuid4())
    background_tasks.add_task(run_comparison, comparison_id, request, user_id)

    return AnalysisJob(
        job_id=comparison_id,
        status="synthesizing",
        estimated_cost_usd=estimated_cost,
        estimated_time_seconds=15,
        check_status_url=f"/api/v1/status/{comparison_id}",
    )


@router.get("/pdf/{job_id}")
async def get_pdf(job_id: str):
    # Retrieve PDF binary for Side-by-Side viewer
    redis_client = await budget_protection.get_redis()
    if not redis_client:
        raise HTTPException(status_code=503, detail="PDF service unavailable")

    pdf_content = await redis_client.get(f"job:{job_id}:pdf_payload")

    if pdf_content:
        from fastapi.responses import Response

        return Response(content=pdf_content, media_type="application/pdf")

    raise HTTPException(status_code=404, detail="PDF not found or expired")


@router.get("/budget", response_model=BudgetInfo)
async def get_budget():
    remaining = await budget_protection.get_remaining_budget()
    is_demo = remaining < 2.00

    papers_remaining = int(remaining / 0.05) if remaining > 0 else 0

    return BudgetInfo(
        remaining_usd=remaining,
        total_budget_usd=settings.mistral_budget_usd,
        papers_remaining=papers_remaining,
        is_demo_mode=is_demo,
    )
