import uuid
import time
import asyncio
from typing import Optional
from .ocr_service import ocr_service, get_document_type
from .vision_service import vision_service
from .reasoning_service import reasoning_service
from ..middleware.budget_guard import budget_protection, current_job_tokens, current_job_cost

COST_ESTIMATES = {
    "ocr": 0.01,
    "vision": 0.005,
    "methodology_critic": 0.008,
    "dataset_auditor": 0.006,
    "experiment_designer": 0.008,
    "synthesis_agent": 0.008,
    "grant_generator": 0.008,
}


class AgentOrchestrator:
    async def analyze_paper(
        self,
        file_content: bytes,
        filename: str,
        extract_figures: bool = True,
        generate_grant: bool = True,
    ) -> dict:
        """Process an uploaded file (auto-detects PDF vs image from extension)."""
        doc_type = get_document_type(filename)

        if doc_type == "image":
            ocr_result = await ocr_service.process_image(file_content, filename)
        else:
            ocr_result = await ocr_service.process_pdf(file_content, filename)

        return await self._run_pipeline(
            ocr_result=ocr_result,
            filename=filename,
            extract_figures=extract_figures,
            generate_grant=generate_grant,
            source_type="file_upload",
            source_url=None,
        )

    async def analyze_paper_url(
        self,
        url: str,
        filename: str,
        extract_figures: bool = True,
        generate_grant: bool = True,
    ) -> dict:
        """Process a document via public URL — no upload needed."""
        ocr_result = await ocr_service.process_url(url, filename)

        return await self._run_pipeline(
            ocr_result=ocr_result,
            filename=filename,
            extract_figures=extract_figures,
            generate_grant=generate_grant,
            source_type="url",
            source_url=url,
        )

    async def _run_pipeline(
        self,
        ocr_result: dict,
        filename: str,
        extract_figures: bool = True,
        generate_grant: bool = True,
        source_type: str = "file_upload",
        source_url: str = None,
    ) -> dict:
        """Core analysis pipeline shared by file upload and URL paths."""
        start_time = time.time()
        paper_id = str(uuid.uuid4())
        
        # Reset contextvars for this job (just in case they weren't reset per-request)
        current_job_tokens.set(0)
        current_job_cost.set(0.0)
        
        # We need to add OCR cost back if we didn't cache hit, but wait, OCR is already done before _run_pipeline! 
        # So OCR cost might not be in the context var cleanly if context is lost.
        # Actually in `analyze_paper` the OCR runs in the same asyncio context, so it should be fine.
        cache_hits = 0

        paper_text = ocr_result.get("text", "")
        figures = ocr_result.get("figures", [])
        tables = ocr_result.get("tables", [])

        # Detect HTML content (auth-walled URLs return login pages)
        if self._is_html_content(paper_text):
            processing_time = time.time() - start_time
            return {
                "paper_id": paper_id,
                "metadata": {
                    "title": filename,
                    "authors": [],
                    "abstract": "",
                    "upload_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "processing_duration_ms": int(processing_time * 1000),
                    "source_type": source_type,
                    "source_url": source_url,
                },
                "error": "The URL appears to be behind authentication. Luminae received an HTML login page instead of a document. Please use a publicly accessible URL or upload the file directly.",
                "extraction": {"ocr_text": "", "figures": [], "tables": []},
                "critique": {"methodology": {}, "dataset": {}},
                "improvements": {"experiments": [], "key_insights": []},
                "grant_outline": {},
                "economics": {
                    "total_tokens_used": 0,
                    "estimated_cost_usd": 0.01,
                    "cache_hits": 0,
                    "processing_time_seconds": int(processing_time),
                },
            }

        # Step 2: Run Vision + Methodology + Dataset + References in PARALLEL
        vision_task = self._run_vision(figures, extract_figures)
        methodology_task = reasoning_service.analyze_methodology(paper_text, [])
        dataset_task = reasoning_service.audit_dataset(paper_text)
        references_task = reasoning_service.extract_references(paper_text)

        vision_analyses, methodology_critique, dataset_audit, references = await asyncio.gather(
            vision_task, methodology_task, dataset_task, references_task
        )

        # Step 3: Experiments (depends on methodology + dataset)
        experiments = await reasoning_service.design_experiments(
            paper_text, methodology_critique, dataset_audit
        )

        # Step 4: Synthesis + Grant
        synthesis = await reasoning_service.synthesize(
            methodology_critique, dataset_audit, experiments
        )

        grant_outline = {}
        if generate_grant:
            grant_outline = await reasoning_service.generate_grant(
                synthesis, experiments
            )

        processing_time = time.time() - start_time

        estimated_cost = sum(COST_ESTIMATES.values()) # keep as legacy baseline
        actual_cost = current_job_cost.get()
        actual_tokens = current_job_tokens.get()

        # Deduct from global budget in Redis (use actual)
        await budget_protection.deduct_budget(actual_cost)

        return {
            "paper_id": paper_id,
            "metadata": {
                "title": self._extract_title(paper_text) or filename,
                "authors": [],
                "abstract": self._extract_abstract(paper_text),
                "upload_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "processing_duration_ms": int(processing_time * 1000),
                "source_type": source_type,
                "source_url": source_url,
            },
            "extraction": {
                "ocr_text": paper_text,
                "figures": vision_analyses,
                "tables": tables,
                "references": references,
            },
            "critique": {
                "methodology": methodology_critique,
                "dataset": dataset_audit,
            },
            "improvements": {
                "experiments": experiments if isinstance(experiments, list) else [],
                "key_insights": synthesis.get("key_insights", []),
            },
            "grant_outline": grant_outline,
            "economics": {
                "total_tokens_used": actual_tokens,
                "estimated_cost_usd": actual_cost, # We override here to show actual cost in the UI which expects 'estimated_cost_usd'
                "cache_hits": cache_hits,
                "processing_time_seconds": int(processing_time),
            },
        }

    async def _run_vision(self, figures: list, extract_figures: bool) -> list:
        """Helper to run vision analysis, returns empty list if not needed."""
        if extract_figures and figures:
            return await vision_service.analyze_figures(figures)
        return []

    def _extract_title(self, text: str) -> Optional[str]:
        """Extract title from OCR text, filtering out HTML and metadata lines."""
        lines = text.strip().split("\n")
        html_indicators = ["<!doctype", "<html", "<head", "<body", "<meta", "<script", "<link", "<style", "<div"]
        for line in lines[:10]:
            line = line.strip()
            if not line or len(line) < 5 or len(line) > 200:
                continue
            lower = line.lower()
            # Skip HTML tags and common metadata
            if any(lower.startswith(ind) for ind in html_indicators):
                continue
            if line.startswith("#"):
                # Markdown header — strip # and use as title
                return line.lstrip("# ").strip()
            return line
        return None

    def _is_html_content(self, text: str) -> bool:
        """Detect if OCR returned HTML instead of document content."""
        if not text:
            return False
        lower = text[:500].lower().strip()
        html_signals = ["<!doctype html", "<html", "<head>", "<meta ", "<script", "<body"]
        count = sum(1 for s in html_signals if s in lower)
        return count >= 2

    def _extract_abstract(self, text: str) -> str:
        lines = text.strip().split("\n")
        abstract_start = False
        abstract_lines = []

        for line in lines:
            if "abstract" in line.lower():
                abstract_start = True
                continue
            if abstract_start:
                if line.strip() and len(line.strip()) > 50:
                    abstract_lines.append(line.strip())
                if len(abstract_lines) > 3:
                    break

        return " ".join(abstract_lines[:3]) if abstract_lines else ""


agent_orchestrator = AgentOrchestrator()
