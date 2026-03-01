import uuid
import base64
import hashlib
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models.schemas import AnalysisRequest, AnalysisJob, BudgetInfo
from ..services.agent_orchestrator import agent_orchestrator
from ..middleware.budget_guard import budget_protection
from ..config import get_settings
from ..utils.supabase_client import supabase
import asyncio

settings = get_settings()

router = APIRouter(prefix="/api/v1", tags=["analysis"])
security = HTTPBearer(auto_error=False)

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
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
    except Exception as e:
        return "guest_user"

analysis_jobs: dict[str, AnalysisJob] = {}
job_results: dict[str, dict] = {}


async def run_analysis(job_id: str, request: AnalysisRequest, user_id: str):
    try:
        if request.file_base64:
            try:
                # CPU Bound: offload hex/base64 processing
                def decode_payload():
                    try:
                        return bytes.fromhex(request.file_base64)
                    except ValueError:
                        return base64.b64decode(request.file_base64)
                file_content = await asyncio.to_thread(decode_payload)
            except Exception as e:
                # Stop if badly formatted
                return
        else:
            return

        file_hash = hashlib.sha256(file_content).hexdigest()
        options = request.options.model_dump() if request.options else {}

        analysis_jobs[job_id] = AnalysisJob(
            job_id=job_id,
            status="uploaded",
            check_status_url=f"/api/v1/status/{job_id}",
        )

        if supabase:
            try:
                def save_initial():
                    supabase.table("papers").insert({
                        "id": job_id,
                        "user_id": user_id,
                        "filename": request.filename,
                        "file_hash": file_hash,
                        "status": "processing_ocr",
                        "total_cost_usd": 0
                    }).execute()
                await asyncio.to_thread(save_initial)
            except Exception as e:
                pass

        result = await agent_orchestrator.analyze_paper(
            file_content=file_content,
            filename=request.filename,
            extract_figures=options.get("extract_figures", True),
            generate_grant=options.get("generate_grant", True),
        )

        job_results[job_id] = result
        analysis_jobs[job_id] = AnalysisJob(
            job_id=job_id,
            status="complete",
            check_status_url=f"/api/v1/status/{job_id}",
            analysis=result,
            economics=result.get("economics"),
        )
        if supabase:
            try:
                def save_completion():
                    supabase.table("papers").update({
                        "status": "complete",
                        "title": result.get("metadata", {}).get("title"),
                        "total_cost_usd": result.get("economics", {}).get("estimated_cost_usd", 0)
                    }).eq("id", job_id).execute()
                    
                    supabase.table("analyses").insert({
                        "paper_id": job_id,
                        "methodology_critique": result.get("critique", {}).get("methodology", {}),
                        "dataset_audit": result.get("critique", {}).get("dataset", {}),
                        "experiment_proposals": result.get("improvements", {}).get("experiments", []),
                        "synthesis": {"key_insights": result.get("improvements", {}).get("key_insights", [])},
                        "grant_outline": result.get("grant_outline", {}),
                        "overall_confidence": result.get("critique", {}).get("methodology", {}).get("confidence", 0.8),
                        "processing_time_ms": result.get("metadata", {}).get("processing_duration_ms", 0),
                    }).execute()

                await asyncio.to_thread(save_completion)
            except Exception as e:
                print("Failed saving completion to supabase", e)

    except Exception as e:
        error_msg = str(e)
        analysis_jobs[job_id] = AnalysisJob(
            job_id=job_id,
            status="error",
            error_message=error_msg,
        )
        if supabase:
            try:
                await asyncio.to_thread(
                    lambda: supabase.table("papers").update({
                        "status": "error",
                        "error_message": error_msg
                    }).eq("id", job_id).execute()
                )
            except Exception:
                pass


@router.post("/analyze", response_model=AnalysisJob)
async def analyze_paper(request: AnalysisRequest, background_tasks: BackgroundTasks, user_id: str = Depends(get_current_user_id)):
    if not await budget_protection.check_global_budget():
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable. Budget threshold reached. Try demo mode.",
        )

    if not request.file_base64 and not request.file_url:
        raise HTTPException(status_code=400, detail="Either file_base64 or file_url required")

    estimated_cost = 0.05
    if not await budget_protection.check_request_budget(estimated_cost):
        raise HTTPException(
            status_code=402,
            detail=f"Estimated cost ${estimated_cost} exceeds max request limit",
        )

    job_id = str(uuid.uuid4())

    # Completely decouple processing so the API instantly returns
    background_tasks.add_task(run_analysis, job_id, request, user_id)

    return AnalysisJob(
        job_id=job_id,
        status="processing_ocr",
        estimated_cost_usd=estimated_cost,
        estimated_time_seconds=45,
        check_status_url=f"/api/v1/status/{job_id}",
        paper={"id": job_id, "filename": request.filename},
    )


@router.get("/status/{job_id}", response_model=AnalysisJob)
async def get_status(job_id: str, user_id: str = Depends(get_current_user_id)):
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return analysis_jobs[job_id]


@router.get("/results/{job_id}", response_model=AnalysisJob)
async def get_results(job_id: str, user_id: str = Depends(get_current_user_id)):
    if supabase:
        try:
            paper_res = supabase.table("papers").select("*").eq("id", job_id).execute()
            if paper_res.data:
                paper = paper_res.data[0]
                if paper["status"] == "complete":
                    analysis_res = supabase.table("analyses").select("*").eq("paper_id", job_id).execute()
                    if analysis_res.data:
                        analysis_data = analysis_res.data[0]
                        result = {
                            "metadata": {
                                "title": paper.get("title"),
                                "processing_duration_ms": analysis_data.get("processing_time_ms")
                            },
                            "critique": {
                                "methodology": analysis_data.get("methodology_critique"),
                                "dataset": analysis_data.get("dataset_audit")
                            },
                            "improvements": {
                                "experiments": analysis_data.get("experiment_proposals"),
                                "key_insights": analysis_data.get("synthesis", {}).get("key_insights", [])
                            },
                            "grant_outline": analysis_data.get("grant_outline"),
                            "economics": {
                                "estimated_cost_usd": paper.get("total_cost_usd")
                            }
                        }
                        return AnalysisJob(
                            job_id=job_id,
                            status="complete",
                            check_status_url=f"/api/v1/status/{job_id}",
                            analysis=result,
                            economics=result["economics"],
                            paper={"id": job_id, "filename": paper.get("filename")}
                        )
                else:
                    return AnalysisJob(
                        job_id=job_id,
                        status=paper["status"],
                        error_message=paper.get("error_message"),
                        check_status_url=f"/api/v1/status/{job_id}",
                        paper={"id": job_id, "filename": paper.get("filename")}
                    )
        except Exception as e:
            print("Failed fetching from supabase, falling back to memory", e)

    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = analysis_jobs[job_id]
    if job.status != "complete":
        return job

    result = job_results.get(job_id, {})

    return AnalysisJob(
        job_id=job_id,
        status="complete",
        check_status_url=f"/api/v1/status/{job_id}",
        analysis=result,
        economics=result.get("economics"),
        paper={"id": job_id, "filename": job.paper.get("filename") if job.paper else ""},
    )


@router.post("/reanalyze", response_model=AnalysisJob)
async def reanalyze(job_id: str, user_id: str = Depends(get_current_user_id)):
    if job_id not in job_results:
        raise HTTPException(status_code=404, detail="Original analysis not found")

    original = job_results[job_id]
    new_job_id = str(uuid.uuid4())

    if original.get("extraction", {}).get("ocr_text"):
        paper_text = original["extraction"]["ocr_text"]
        figures = original["extraction"].get("figures", [])
        tables = original["extraction"].get("tables", [])

        from services.reasoning_service import reasoning_service

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
        result["improvements"] = {"experiments": experiments, "key_insights": synthesis.get("key_insights", [])}
        result["grant_outline"] = grant_outline

        job_results[new_job_id] = result

        return AnalysisJob(
            job_id=new_job_id,
            status="complete",
            analysis=result,
            economics=result.get("economics"),
        )

    raise HTTPException(status_code=400, detail="Cannot reanalyze - missing original data")


@router.get("/budget", response_model=BudgetInfo)
async def get_budget():
    remaining = await budget_protection.get_remaining_budget()
    is_demo = remaining < 2.00

    papers_remaining = int(remaining / 0.82) if remaining > 0 else 0

    return BudgetInfo(
        remaining_usd=remaining,
        total_budget_usd=settings.mistral_budget_usd,
        papers_remaining=papers_remaining,
        is_demo_mode=is_demo,
    )
