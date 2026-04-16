import json

from .mistral_client import mistral_client

VISION_CONFIG = {
    "primary_model": "ministral-3b-2512",
    "fallback_model": "ministral-8b-2512",
    "confidence_threshold": 0.7,
    "batch_size": 5,
    "max_figures": 20,
    "cache_ttl": 86400,
}

VISION_PROMPT = """Analyze this research figure. Provide:
1. Figure type (chart, diagram, microscopy, etc.)
2. Key data trends or relationships shown
3. Statistical significance if indicated
4. Potential alternative interpretations
5. Confidence in your analysis (0-1)

Output strict JSON format:
{
  "figure_type": "...",
  "key_trends": "...",
  "statistical_significance": "...",
  "alternative_interpretations": ["..."],
  "confidence": 0.0-1.0
}"""


class VisionService:
    def __init__(self):
        self.config = VISION_CONFIG

    async def analyze_figures(self, figures: list[dict]) -> list[dict]:
        if not figures:
            return []

        results = []
        figures_to_analyze = figures[: self.config["max_figures"]]

        for i in range(0, len(figures_to_analyze), self.config["batch_size"]):
            batch = figures_to_analyze[i : i + self.config["batch_size"]]
            batch_results = await self._analyze_batch(batch)
            results.extend(batch_results)

        return results

    async def _analyze_batch(self, batch: list[dict]) -> list[dict]:
        try:
            images = [fig.get("base64", "") for fig in batch if fig.get("base64")]

            if not images:
                return []

            response = await mistral_client.vision_analyze(
                model=self.config["primary_model"],
                images=images,
                prompt=VISION_PROMPT,
                max_tokens=1000,
            )

            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

            parsed = self._parse_json_response(content, len(batch))

            results = []
            for i, fig in enumerate(batch):
                analysis = parsed[i] if i < len(parsed) else {}
                results.append(
                    {
                        "id": fig.get("id", f"fig-{i}"),
                        "type": analysis.get("figure_type", "unknown"),
                        "description": analysis.get("key_trends", ""),
                        "key_data_trends": analysis.get("key_trends", ""),
                        "statistical_significance": analysis.get("statistical_significance", ""),
                        "alternative_interpretations": analysis.get(
                            "alternative_interpretations", []
                        ),
                        "confidence": analysis.get("confidence", 0.5),
                        "base64_image": fig.get("base64", ""),
                    }
                )

            return results

        except Exception as e:
            return [
                {
                    "id": fig.get("id", f"fig-{i}"),
                    "type": "unknown",
                    "description": f"Analysis failed: {str(e)}",
                    "confidence": 0.0,
                }
                for i, fig in enumerate(batch)
            ]

    def _parse_json_response(self, content: str, expected_count: int) -> list[dict]:
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            data = json.loads(content.strip())

            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "figures" in data:
                return data["figures"]
            else:
                return [data] * expected_count

        except json.JSONDecodeError:
            return [{"figure_type": "unknown", "confidence": 0.0}] * expected_count


vision_service = VisionService()
