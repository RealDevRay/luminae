import base64
from typing import Optional
from mistralai import Mistral
from ..config import get_settings
from ..middleware.budget_guard import budget_protection, MODEL_PRICING

settings = get_settings()


class MistralClient:
    def __init__(self):
        self.api_key = settings.mistral_api_key
        self.client = Mistral(api_key=self.api_key)

    async def chat_complete(
        self,
        model: str,
        messages: list[dict],
        max_tokens: int = 2000,
        temperature: float = 0.7,
    ) -> dict:
        response = await self.client.chat.complete_async(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.model_dump()

    async def ocr_document(
        self,
        document: dict,
        include_image_base64: bool = True,
        table_format: str = "markdown",
    ) -> dict:
        response = await self.client.ocr.process_async(
            model="mistral-ocr-latest",
            document=document,
            include_image_base64=include_image_base64,
            table_format=table_format,
        )
        return response.model_dump()

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
                        {"type": "image_url", "image_url": f"data:image/jpeg;base64,{img}"}
                        for img in images
                    ],
                    {"type": "text", "text": prompt},
                ],
            }
        ]

        response = await self.client.chat.complete_async(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )
        return response.model_dump()


mistral_client = MistralClient()
