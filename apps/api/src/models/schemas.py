from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class AnalysisOptions(BaseModel):
    extract_figures: bool = True
    generate_grant: bool = True
    priority: Literal["normal", "fast"] = "normal"


class AnalysisRequest(BaseModel):
    file_base64: Optional[str] = None
    file_url: Optional[str] = None
    filename: str
    options: Optional[AnalysisOptions] = None


class AnalysisJob(BaseModel):
    job_id: str
    status: Literal[
        "uploaded",
        "processing_ocr",
        "processing_vision",
        "analyzing",
        "complete",
        "error",
    ] = "uploaded"
    estimated_cost_usd: Optional[float] = None
    estimated_time_seconds: Optional[int] = None
    check_status_url: Optional[str] = None
    paper: Optional[dict] = None
    analysis: Optional[dict] = None
    error_message: Optional[str] = None
    economics: Optional[dict] = None


class BudgetInfo(BaseModel):
    remaining_usd: float
    total_budget_usd: float
    papers_remaining: int
    is_demo_mode: bool


class UsageLogCreate(BaseModel):
    paper_id: Optional[str] = None
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
