import logging
import os

from mistralai import Mistral

from ..config import get_settings
from ..middleware.budget_guard import budget_protection, current_job_cost, current_job_tokens
from ..utils.retry import retry_with_backoff

logger = logging.getLogger("luminae.mistral_client")

settings = get_settings()


class MistralClient:
    def _get_client(self):
        # Instantiate lazily to ensure pydantic loads the LUMINAE_ prefixed env vars
        # Fallback to direct OS environment for absolute safety
        api_key = os.getenv("LUMINAE_MISTRAL_API_KEY") or get_settings().mistral_api_key
        return Mistral(api_key=api_key)

    async def chat_complete(
        self,
        model: str,
        messages: list[dict],
        max_tokens: int = 2000,
        temperature: float = 0.7,
        response_format: dict | None = None,
    ) -> dict:
        async def _call():
            client = self._get_client()
            kwargs = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            if response_format:
                kwargs["response_format"] = response_format
            response = await client.chat.complete_async(**kwargs)

            # Tally actual tokens and cost
            if getattr(response, "usage", None):
                prompt_tokens = response.usage.prompt_tokens
                comp_tokens = response.usage.completion_tokens
                total_tokens = prompt_tokens + comp_tokens
                cost = budget_protection.calculate_actual_cost(model, prompt_tokens, comp_tokens)

                current_job_tokens.set(current_job_tokens.get() + total_tokens)
                current_job_cost.set(current_job_cost.get() + cost)

            return response.model_dump()

        return await retry_with_backoff(_call, max_retries=3, base_delay=1.0)

    async def ocr_document(
        self,
        document_base64: str,
        include_image_base64: bool = True,
        table_format: str = "markdown",
    ) -> dict:
        async def _call():
            client = self._get_client()
            document_dict = {
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{document_base64}",
            }
            response = await client.ocr.process_async(
                model="mistral-ocr-latest",
                document=document_dict,
                include_image_base64=include_image_base64,
                table_format=table_format,
            )

            # Tally actual tokens and cost for OCR (note: Mistral OCR might populate usage differently)
            if getattr(response, "usage", None) and getattr(response.usage, "prompt_tokens", None):
                prompt_tokens = response.usage.prompt_tokens
                comp_tokens = getattr(response.usage, "completion_tokens", 0)
                total_tokens = prompt_tokens + comp_tokens
                cost = budget_protection.calculate_actual_cost(
                    "mistral-ocr-latest", prompt_tokens, comp_tokens
                )
                current_job_tokens.set(current_job_tokens.get() + total_tokens)
                current_job_cost.set(current_job_cost.get() + cost)

            return response.model_dump()

        return await retry_with_backoff(_call, max_retries=3, base_delay=2.0)

    async def vision_analyze(
        self,
        model: str,
        images: list[str],
        prompt: str,
        max_tokens: int = 1000,
    ) -> dict:
        async def _call():
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
            client = self._get_client()
            response = await client.chat.complete_async(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
            )

            # Tally actual tokens and cost
            if getattr(response, "usage", None):
                prompt_tokens = response.usage.prompt_tokens
                comp_tokens = response.usage.completion_tokens
                total_tokens = prompt_tokens + comp_tokens
                cost = budget_protection.calculate_actual_cost(model, prompt_tokens, comp_tokens)

                current_job_tokens.set(current_job_tokens.get() + total_tokens)
                current_job_cost.set(current_job_cost.get() + cost)

            return response.model_dump()

        return await retry_with_backoff(_call, max_retries=3, base_delay=1.0)


mistral_client = MistralClient()
