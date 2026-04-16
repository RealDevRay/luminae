import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from ..services.mistral_client import mistral_client
from ..services.job_store import job_store
from ..middleware.budget_guard import budget_protection
from ..config import get_settings

logger = logging.getLogger("luminae.chat")
settings = get_settings()

router = APIRouter(prefix="/api/v1", tags=["chat"])
security = HTTPBearer(auto_error=False)


class ChatRequest(BaseModel):
    message: str
    paper_id: Optional[str] = None
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    tokens_used: Optional[int] = None


SYSTEM_PROMPT_WITH_PAPER = """You are Luminae's AI research assistant. You have deep expertise in academic research methodology, statistics, and scientific writing.

You are currently helping a researcher analyze a specific paper. The full text of the paper is provided below.

IMPORTANT INSTRUCTIONS:
- Answer questions specifically about THIS paper when asked
- Be precise and cite specific sections, figures, or data from the paper
- If asked about something not in the paper, say so clearly
- Keep responses concise but thorough
- Use markdown formatting for clarity (bold, lists, etc.)

--- PAPER TEXT ---
{paper_text}
--- END PAPER TEXT ---"""

SYSTEM_PROMPT_GENERAL = """You are Luminae's AI research assistant. You have deep expertise in academic research methodology, statistics, and scientific writing.

You can help with:
- Understanding research methodologies and statistical approaches
- Explaining analysis results from Luminae's multi-agent review system
- Advising on experiment design, dataset quality, and grant writing
- General academic research questions

About Luminae:
- Luminae uses 5 specialized AI agents to analyze research papers
- Agents: Methodology Critic, Dataset Auditor, Experiment Designer, Synthesis Agent, Grant Generator
- Powered by Mistral AI models (OCR, Vision, Reasoning)
- Each analysis costs ~$0.05 using optimized ministral models
- Supports PDF, DOCX, PPTX, and image uploads, plus public URLs

Keep responses concise, helpful, and focused on research quality."""


async def _get_paper_context(paper_id: str) -> Optional[str]:
    """Load the paper's OCR text from the job store for context-aware chat."""
    if not paper_id:
        return None
    try:
        result = await job_store.get_result(paper_id)
        if result and result.get("extraction", {}).get("ocr_text"):
            text = result["extraction"]["ocr_text"]
            # Limit context to ~8000 chars to stay within token limits
            return text[:8000] if len(text) > 8000 else text
    except Exception as e:
        logger.warning(f"Failed to load paper context for {paper_id}: {e}")
    return None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_paper(request: ChatRequest):
    """AI-powered chat endpoint. If paper_id is provided, answers are context-aware."""

    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > 2000:
        raise HTTPException(status_code=400, detail="Message too long (max 2000 characters)")

    # Budget check for chat (cheap — ~$0.002 per message)
    if not await budget_protection.check_request_budget(0.005):
        raise HTTPException(
            status_code=402,
            detail="Budget limit reached for chat. Try again later.",
        )

    # Build context-aware system prompt
    paper_text = await _get_paper_context(request.paper_id)
    if paper_text:
        system_prompt = SYSTEM_PROMPT_WITH_PAPER.format(paper_text=paper_text)
    else:
        system_prompt = SYSTEM_PROMPT_GENERAL

    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 messages to stay within context)
    for msg in request.conversation_history[-10:]:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            messages.append({
                "role": msg["role"],
                "content": msg["content"][:1000],  # Truncate long history messages
            })

    # Add current message
    messages.append({"role": "user", "content": request.message})

    try:
        response = await mistral_client.chat_complete(
            model="ministral-8b-2512",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )

        reply = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        tokens_used = response.get("usage", {}).get("total_tokens")

        if not reply:
            reply = "I'm sorry, I couldn't generate a response. Please try rephrasing your question."

        # Track cost
        await budget_protection.deduct_budget(0.002)

        return ChatResponse(reply=reply, tokens_used=tokens_used)

    except Exception as e:
        logger.error(f"Chat API error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate response. Please try again.",
        )
