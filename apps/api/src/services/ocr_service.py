import hashlib
import json
import os
import base64
from typing import Optional
from mistralai import Mistral
from ..config import get_settings

settings = get_settings()

OCR_CONFIG = {
    "model": "mistral-ocr-latest",
    "table_format": "markdown",
    "include_image_base64": True,
}


class OCRService:
    def __init__(self):
        self.config = OCR_CONFIG

    def compute_hash(self, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    async def process_pdf(
        self, file_content: bytes, filename: str
    ) -> dict:
        api_key = os.getenv("LUMINAE_MISTRAL_API_KEY") or get_settings().mistral_api_key
        client = Mistral(api_key=api_key)

        file_hash = self.compute_hash(file_content)

        # Encode the raw PDF bytes to base64 and use Mistral's inline base64 method.
        # This is the simplest OCR approach per the official docs:
        # https://docs.mistral.ai/capabilities/document_ai/basic_ocr
        b64_encoded = base64.b64encode(file_content).decode("utf-8")

        ocr_response = await client.ocr.process_async(
            model=self.config["model"],
            document={
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{b64_encoded}",
            },
            include_image_base64=self.config["include_image_base64"],
        )

        # The SDK returns a Pydantic model — convert to a plain dict
        result = ocr_response.model_dump()

        extracted_text = self._extract_text(result)
        figures = self._extract_figures(result)
        tables = self._extract_tables(result)

        return {
            "hash": file_hash,
            "text": extracted_text,
            "figures": figures,
            "tables": tables,
            "page_count": len(result.get("pages", [])),
            "model": self.config["model"],
        }

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
                    figures.append({
                        "id": f"fig-{figure_id}",
                        "type": "image",
                        "base64": img["image_base64"],
                        "page": page.get("index", 0),
                    })

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
                    tables.append({
                        "id": f"table-{table_id}",
                        "caption": tbl.get("caption", ""),
                        "data": tbl.get("data", []),
                        "rows": len(tbl.get("data", [])),
                        "columns": len(tbl.get("data", [[]])[0]) if tbl.get("data") else 0,
                    })

        return tables


ocr_service = OCRService()
