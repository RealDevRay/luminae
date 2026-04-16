from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AnalysisOptions(BaseModel):
    extract_figures: bool = True
    generate_grant: bool = True
    priority: Literal["normal", "fast"] = "normal"


class AnalysisRequest(BaseModel):
    file_base64: str | None = None
    file_url: str | None = None
    filename: str
    options: AnalysisOptions | None = None


class AnalysisJob(BaseModel):
    job_id: str
    status: Literal[
        "uploaded",
        "processing_ocr",
        "processing_vision",
        "analyzing",
        "synthesizing",
        "complete",
        "error",
    ] = "uploaded"
    estimated_cost_usd: float | None = None
    estimated_time_seconds: int | None = None
    check_status_url: str | None = None
    paper: dict | None = None
    analysis: dict | None = None
    error_message: str | None = None
    economics: dict | None = None


class CompareRequest(BaseModel):
    job_ids: list[str] = Field(..., min_length=2, max_length=5)


class BudgetInfo(BaseModel):
    remaining_usd: float
    total_budget_usd: float
    papers_remaining: int
    is_demo_mode: bool


class UsageLogCreate(BaseModel):
    paper_id: str | None = None
    endpoint: str
    model: str
    input_tokens: int
    output_tokens: int
    estimated_cost: float
    actual_cost: float


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
