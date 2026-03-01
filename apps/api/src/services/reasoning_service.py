import json
from typing import Optional
from .mistral_client import mistral_client

AGENT_SYSTEM_PROMPTS = {
    "methodology_critic": """You are Dr. Elena Vasquez, a senior research methodologist with 20 years in peer review. Analyze the methodology section for:
1. DESIGN FLAWS: Confounding variables, selection bias, lack of controls
2. STATISTICAL POWER: Sample size adequacy, effect size calculations, p-hacking signs
3. REPRODUCIBILITY: Protocol clarity, code/data availability, preregistration
4. VALIDITY: Internal, external, construct validity threats

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON, no markdown, no commentary before or after the JSON.
- Do NOT use markdown formatting (**, *, _, __, etc.) inside any JSON string values. Use plain text only.
- All string values must be plain text without any formatting markers.

Output this exact JSON schema:
{"flaws": [{"severity": "critical|warning|note", "category": "...", "description": "...", "section_reference": "...", "suggested_fix": "...", "impact": "..."}], "overall_score": 0-100, "reproducibility_rating": "high|medium|low", "confidence": 0.0-1.0, "key_strengths": ["..."], "critical_gaps": ["..."]}

Rules: Cite specific sections, if info missing state "Not mentioned", never hallucinate.""",

    "dataset_auditor": """You are Dr. James Chen, data governance expert. Audit the dataset for:
1. SIZE: Adequacy for claimed effects, power analysis mention
2. BIAS: Selection bias, measurement bias, confirmation bias sources
3. MISSING_DATA: Handling strategy, MAR/MCAR/MNAR assessment
4. ETHICS: IRB approval, consent, privacy safeguards
5. REPRESENTATION: Demographic coverage, geographic limits

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON, no markdown, no commentary before or after the JSON.
- Do NOT use markdown formatting (**, *, _, __, etc.) inside any JSON string values. Use plain text only.

Output this exact JSON schema:
{"size_assessment": "adequate|underpowered|excessive|not_applicable", "bias_sources": ["plain text description of each bias source"], "ethical_concerns": ["plain text concern"], "recommendations": ["plain text actionable recommendation"], "missing_data_handling": "plain text assessment", "representation_issues": ["plain text issue"]}""",

    "experiment_designer": """You are Dr. Sarah Okonkwo, creative experimentalist. Design 3 follow-up experiments addressing paper limitations.
Be bold but grounded. Address exact flaws found.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON, no markdown, no commentary before or after the JSON.
- Do NOT use markdown formatting (**, *, _, __, etc.) inside any JSON string values. Use plain text only.

Output this exact JSON schema (array of 3 objects):
[{"title": "plain text title", "hypothesis": "plain text falsifiable hypothesis", "method": "plain text method description (2-3 sentences)", "expected_outcome": "plain text expected outcome", "feasibility_score": 1-10, "estimated_budget": "plain text budget estimate"}]""",

    "synthesis_agent": """Synthesize parallel agent outputs into a unified assessment. Resolve conflicts by confidence weighting. Generate 3 key insights that would surprise the original authors.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON, no markdown, no commentary before or after the JSON.
- Do NOT use markdown formatting (**, *, _, __, etc.) inside any JSON string values. Use plain text only.

Output this exact JSON schema:
{"key_insights": ["plain text insight 1", "plain text insight 2", "plain text insight 3"], "unified_assessment": "plain text overall assessment paragraph", "conflicts_resolved": ["plain text description of any conflicts between agents and how they were resolved"]}""",

    "grant_generator": """Generate an NSF-style grant proposal outline based on the synthesis and proposed experiments.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON, no markdown, no commentary before or after the JSON.
- Do NOT use markdown formatting (**, *, _, __, etc.) inside any JSON string values. Use plain text only.

Output this exact JSON schema:
{"title": "plain text grant title", "specific_aims": ["plain text aim 1", "plain text aim 2", "plain text aim 3"], "research_strategy": "plain text research strategy paragraph", "expected_outcomes": "plain text expected outcomes paragraph", "timeline": "plain text timeline (e.g. 3 years)", "budget_estimate": "plain text budget estimate"}""",
}


class ReasoningService:
    def __init__(self):
        self.model = "ministral-8b-2512"
        self.max_tokens_map = {
            "methodology_critic": 2000,
            "dataset_auditor": 1500,
            "experiment_designer": 2500,
            "synthesis_agent": 2000,
            "grant_generator": 2500,
        }

    async def analyze_methodology(self, paper_text, figure_analyses):
        context = self._build_context(paper_text, figure_analyses)
        response = await self._call_agent(
            "methodology_critic",
            [{"role": "user", "content": context}],
        )
        return self._parse_json(response)

    async def audit_dataset(self, paper_text):
        prompt = f"Analyze the dataset description in this paper:\n\n{paper_text[:8000]}"
        response = await self._call_agent(
            "dataset_auditor",
            [{"role": "user", "content": prompt}],
        )
        return self._parse_json(response)

    async def design_experiments(self, paper_text, methodology_critique, dataset_audit):
        context = f"""Paper text:\n{paper_text[:5000]}\n\n
Methodology critique:\n{json.dumps(methodology_critique)}\n\n
Dataset audit:\n{json.dumps(dataset_audit)}"""

        response = await self._call_agent(
            "experiment_designer",
            [{"role": "user", "content": context}],
        )
        return self._parse_json_list(response)

    async def synthesize(self, methodology_critique, dataset_audit, experiments):
        context = f"""Methodology: {json.dumps(methodology_critique)}
Dataset: {json.dumps(dataset_audit)}
Experiments: {json.dumps(experiments)}"""

        response = await self._call_agent(
            "synthesis_agent",
            [{"role": "user", "content": context}],
        )
        return self._parse_json(response)

    async def generate_grant(self, synthesis, experiments):
        context = f"""Synthesis: {json.dumps(synthesis)}
Proposed experiments: {json.dumps(experiments)}"""

        response = await self._call_agent(
            "grant_generator",
            [{"role": "user", "content": context}],
        )
        return self._parse_json(response)

    async def _call_agent(self, agent_name, messages):
        system_prompt = AGENT_SYSTEM_PROMPTS.get(agent_name, "")
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        max_tokens = self.max_tokens_map.get(agent_name, 2000)

        response = await mistral_client.chat_complete(
            model=self.model,
            messages=full_messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )

        return response.get("choices", [{}])[0].get("message", {}).get("content", "")

    def _build_context(self, paper_text, figure_analyses):
        figures_context = ""
        if figure_analyses:
            figures_summary = "\n".join(
                f"- {fig.get('id')}: {fig.get('description', 'N/A')}"
                for fig in figure_analyses[:5]
            )
            figures_context = f"\n\nFigure analyses:\n{figures_summary}"

        return f"Analyze this paper's methodology:\n\n{paper_text[:10000]}{figures_context}"

    def _parse_json(self, content):
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except (json.JSONDecodeError, Exception):
            return {}

    def _parse_json_list(self, content):
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except (json.JSONDecodeError, Exception):
            return []


reasoning_service = ReasoningService()
