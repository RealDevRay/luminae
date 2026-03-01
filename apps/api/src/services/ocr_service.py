import hashlib
import json
import base64
import os
import tempfile
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
        self.api_key = settings.mistral_api_key
        # We must use the asynchronous client methods to avoid blocking the event loop
        self.client = Mistral(api_key=self.api_key)

    def compute_hash(self, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    async def process_pdf(
        self, file_content: bytes, filename: str
    ) -> dict:
        file_hash = self.compute_hash(file_content)
        temp_file_path = None
        uploaded_pdf = None

        try:
            # Mistral client.files.upload takes a file-like object or a path.
            # We'll write the bytes to a secure tempfile to stream it reliably
            fd, temp_file_path = tempfile.mkstemp(suffix=".pdf")
            with os.fdopen(fd, "wb") as f:
                f.write(file_content)

            # Step 1: Upload the file to Mistral Cloud
            with open(temp_file_path, "rb") as f:
                uploaded_pdf = await self.client.files.upload_async(
                    file={
                        "file_name": filename,
                        "content": f,
                    },
                    purpose="ocr"
                )

            # Step 2: Get a Signed URL
            signed_url = await self.client.files.get_signed_url_async(file_id=uploaded_pdf.id)

            # Step 3: Trigger OCR using the Signed URL
            ocr_response = await self.client.ocr.process_async(
                model=self.config["model"],
                document={
                    "type": "document_url",
                    "document_url": signed_url.url,
                },
                table_format=self.config["table_format"],
                include_image_base64=self.config["include_image_base64"]
            )
            
            # Convert SDK response to dict for legacy parsing
            result = ocr_response.model_dump()

        finally:
            # Step 4: Always clean up the Cloud file and local tempfile
            if uploaded_pdf:
                try:
                    await self.client.files.delete_async(file_id=uploaded_pdf.id)
                except Exception:
                    pass
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass

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
