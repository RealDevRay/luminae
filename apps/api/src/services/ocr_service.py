import hashlib
import json
import base64
from typing import Optional
from .mistral_client import mistral_client

OCR_CONFIG = {
    "model": "mistral-ocr-latest",
    "table_format": "markdown",
    "include_image_base64": True,
    "max_pages": 50,
    "timeout_seconds": 60,
    "cache_ttl": 86400,
}


class OCRService:
    def __init__(self):
        self.config = OCR_CONFIG

    def compute_hash(self, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    async def process_pdf(
        self, file_content: bytes, filename: str
    ) -> dict:
        file_hash = self.compute_hash(file_content)
        file_base64 = base64.b64encode(file_content).decode("utf-8")

        document = [
            {
                "type": "document_base64",
                "document": file_base64,
            }
        ]

        result = await mistral_client.ocr_document(
            document=document,
            include_image_base64=self.config["include_image_base64"],
            table_format=self.config["table_format"],
        )

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
                if "base64" in img:
                    figure_id += 1
                    figures.append({
                        "id": f"fig-{figure_id}",
                        "type": "image",
                        "base64": img["base64"],
                        "page": page.get("index", 1),
                    })

        return figures

    def _extract_tables(self, ocr_result: dict) -> list[dict]:
        tables = []
        pages = ocr_result.get("pages", [])
        table_id = 0

        for page in pages:
            if "tables" in page:
                for tbl in page["tables"]:
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
