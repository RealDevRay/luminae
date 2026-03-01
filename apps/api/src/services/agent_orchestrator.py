import uuid
import time
import asyncio
from typing import Optional
from .ocr_service import ocr_service
from .vision_service import vision_service
from .reasoning_service import reasoning_service
from ..middleware.budget_guard import budget_protection

COST_ESTIMATES = {
    "ocr": 0.05,
    "vision": 0.02,
    "methodology_critic": 0.15,
    "dataset_auditor": 0.10,
    "experiment_designer": 0.15,
    "synthesis_agent": 0.20,
    "grant_generator": 0.15,
}


class AgentOrchestrator:
    async def analyze_paper(
        self,
        file_content: bytes,
        filename: str,
        extract_figures: bool = True,
        generate_grant: bool = True,
    ) -> dict:
        start_time = time.time()
        paper_id = str(uuid.uuid4())
        total_tokens = 0
        cache_hits = 0

        ocr_result = await ocr_service.process_pdf(file_content, filename)
        ocr_time = time.time() - start_time

        paper_text = ocr_result.get("text", "")
        figures = ocr_result.get("figures", [])
        tables = ocr_result.get("tables", [])

        vision_analyses = []
        if extract_figures and figures:
            vision_analyses = await vision_service.analyze_figures(figures)

        methodology_critique = await reasoning_service.analyze_methodology(
            paper_text, vision_analyses
        )

        dataset_audit = await reasoning_service.audit_dataset(paper_text)

        experiments = await reasoning_service.design_experiments(
            paper_text, methodology_critique, dataset_audit
        )

        synthesis = await reasoning_service.synthesize(
            methodology_critique, dataset_audit, experiments
        )

        grant_outline = {}
        if generate_grant:
            grant_outline = await reasoning_service.generate_grant(
                synthesis, experiments
            )

        processing_time = time.time() - start_time

        return {
            "paper_id": paper_id,
            "metadata": {
                "title": self._extract_title(paper_text) or filename,
                "authors": [],
                "abstract": self._extract_abstract(paper_text),
                "upload_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "processing_duration_ms": int(processing_time * 1000),
            },
            "extraction": {
                "ocr_text": paper_text,
                "figures": vision_analyses,
                "tables": tables,
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
                "total_tokens_used": total_tokens,
                "estimated_cost_usd": sum(COST_ESTIMATES.values()),
                "cache_hits": cache_hits,
                "processing_time_seconds": int(processing_time),
            },
        }

    def _extract_title(self, text: str) -> Optional[str]:
        lines = text.strip().split("\n")
        for line in lines[:5]:
            line = line.strip()
            if line and len(line) > 10 and len(line) < 200:
                if not line.startswith("#"):
                    return line
        return None

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
