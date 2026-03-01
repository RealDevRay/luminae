import httpx
import base64
from typing import Optional
from ..config import get_settings
from ..middleware.budget_guard import budget_protection, MODEL_PRICING

settings = get_settings()


class MistralClient:
    def __init__(self):
        self.api_key = settings.mistral_api_key
        self.base_url = "https://api.mistral.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def chat_complete(
        self,
        model: str,
        messages: list[dict],
        max_tokens: int = 2000,
        temperature: float = 0.7,
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            return response.json()

    async def ocr_document(
        self,
        document: list[dict],
        include_image_base64: bool = True,
        table_format: str = "markdown",
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/ocr",
                headers=self.headers,
                json={
                    "model": "mistral-ocr-latest",
                    "document": document,
                    "include_image_base64": include_image_base64,
                    "table_format": table_format,
                },
                timeout=120.0,
            )
            response.raise_for_status()
            return response.json()

    async def vision_analyze(
        self,
        model: str,
        images: list[str],
        prompt: str,
        max_tokens: int = 1000,
    ) -> dict:
        messages = [
            {
                "role": "user",
                "content": [
                    *[
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}}
                        for img in images
                    ],
                    {"type": "text", "text": prompt},
                ],
            }
        ]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            return response.json()


mistral_client = MistralClient()
