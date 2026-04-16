import asyncio
import base64
import hashlib
import json
import os

from mistralai import Mistral

from ..config import get_settings
from ..middleware.budget_guard import budget_protection

settings = get_settings()

OCR_CONFIG = {
    "model": "mistral-ocr-latest",
    "table_format": "markdown",
    "include_image_base64": True,
}

# Supported file extensions
DOCUMENT_EXTENSIONS = {".pdf", ".docx", ".pptx"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".avif", ".webp", ".gif", ".bmp", ".tiff"}


def get_document_type(filename: str) -> str:
    """Determine Mistral OCR document type from filename extension."""
    ext = os.path.splitext(filename.lower())[1]
    if ext in IMAGE_EXTENSIONS:
        return "image"
    return "document"  # Default to document for PDF, DOCX, PPTX, and unknown


class OCRService:
    def __init__(self):
        self.config = OCR_CONFIG

    def compute_hash(self, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    def _get_client(self) -> Mistral:
        api_key = os.getenv("LUMINAE_MISTRAL_API_KEY") or get_settings().mistral_api_key
        return Mistral(api_key=api_key)

    async def process_url(self, url: str, filename: str) -> dict:
        """Process a document or image via public URL — no upload needed."""
        client = self._get_client()
        doc_type = get_document_type(filename or url)

        if doc_type == "image":
            document = {"type": "image_url", "image_url": url}
        else:
            document = {"type": "document_url", "document_url": url}

        # Generate hash from URL for deduplication
        url_hash = hashlib.sha256(url.encode()).hexdigest()

        cached_ocr = await self._get_cached_ocr(url_hash)
        if cached_ocr:
            return cached_ocr

        ocr_response = await client.ocr.process_async(
            model=self.config["model"],
            document=document,
            include_image_base64=self.config["include_image_base64"],
        )

        result = ocr_response.model_dump()
        extracted_text = self._extract_text(result)
        figures = self._extract_figures(result)
        tables = self._extract_tables(result)

        final_result = {
            "hash": url_hash,
            "text": extracted_text,
            "figures": figures,
            "tables": tables,
            "page_count": len(result.get("pages", [])),
            "model": self.config["model"],
        }
        await self._cache_ocr(url_hash, final_result)
        return final_result

    async def process_pdf(self, file_content: bytes, filename: str) -> dict:
        client = self._get_client()
        file_hash = self.compute_hash(file_content)

        cached_ocr = await self._get_cached_ocr(file_hash)
        if cached_ocr:
            return cached_ocr

        b64_encoded = base64.b64encode(file_content).decode("utf-8")

        ocr_response = await client.ocr.process_async(
            model=self.config["model"],
            document={
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{b64_encoded}",
            },
            include_image_base64=self.config["include_image_base64"],
        )

        result = ocr_response.model_dump()
        extracted_text = self._extract_text(result)
        figures = self._extract_figures(result)
        tables = self._extract_tables(result)

        final_result = {
            "hash": file_hash,
            "text": extracted_text,
            "figures": figures,
            "tables": tables,
            "page_count": len(result.get("pages", [])),
            "model": self.config["model"],
        }
        await self._cache_ocr(file_hash, final_result)
        return final_result

    async def process_image(self, file_content: bytes, filename: str) -> dict:
        """Process an uploaded image file via base64."""
        client = self._get_client()
        file_hash = self.compute_hash(file_content)

        cached_ocr = await self._get_cached_ocr(file_hash)
        if cached_ocr:
            return cached_ocr

        ext = os.path.splitext(filename.lower())[1]
        mime_types = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".avif": "image/avif",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
        }
        mime = mime_types.get(ext, "image/png")
        b64_encoded = base64.b64encode(file_content).decode("utf-8")

        ocr_response = await client.ocr.process_async(
            model=self.config["model"],
            document={
                "type": "image_url",
                "image_url": f"data:{mime};base64,{b64_encoded}",
            },
            include_image_base64=self.config["include_image_base64"],
        )

        result = ocr_response.model_dump()
        extracted_text = self._extract_text(result)
        figures = self._extract_figures(result)
        tables = self._extract_tables(result)

        final_result = {
            "hash": file_hash,
            "text": extracted_text,
            "figures": figures,
            "tables": tables,
            "page_count": len(result.get("pages", [])),
            "model": self.config["model"],
        }
        await self._cache_ocr(file_hash, final_result)
        return final_result

    def _extract_text(self, ocr_result: dict) -> str:
        pages = ocr_result.get("pages", [])
        texts = []
        for page in pages:
            if "markdown" in page:
                texts.append(page["markdown"])
        return "\n\n".join(texts)

    def _extract_figures(self, ocr_result: dict) -> list[dict]:
        figures = []
        pages = ocr_result.get("pages", [])
        figure_id = 0

        for page in pages:
            images = page.get("images", [])
            for img in images:
                if "image_base64" in img:
                    figure_id += 1
                    figures.append(
                        {
                            "id": f"fig-{figure_id}",
                            "type": "image",
                            "base64": img["image_base64"],
                            "page": page.get("index", 0),
                        }
                    )

        return figures

    def _extract_tables(self, ocr_result: dict) -> list[dict]:
        tables = []
        pages = ocr_result.get("pages", [])
        table_id = 0

        for page in pages:
            page_tables = page.get("tables", [])
            if page_tables:
                for tbl in page_tables:
                    table_id += 1
                    tables.append(
                        {
                            "id": f"table-{table_id}",
                            "caption": tbl.get("caption", ""),
                            "data": tbl.get("data", []),
                            "rows": len(tbl.get("data", [])),
                            "columns": len(tbl.get("data", [[]])[0]) if tbl.get("data") else 0,
                        }
                    )

        return tables

    async def _get_cached_ocr(self, file_hash: str) -> dict | None:
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                data = await redis_client.get(f"ocr:{file_hash}")
                if data:
                    return json.loads(data)
        except Exception:
            pass
        return None

    async def _cache_ocr(self, file_hash: str, result: dict) -> None:
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                # Cache for 30 days
                await redis_client.set(f"ocr:{file_hash}", json.dumps(result), ex=86400 * 30)
        except Exception:
            pass


ocr_service = OCRService()
