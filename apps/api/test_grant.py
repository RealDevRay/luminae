import os
from dotenv import load_dotenv
load_dotenv()
os.environ["MISTRAL_API_KEY"] = os.environ.get("LUMINAE_MISTRAL_API_KEY", "")

import asyncio
import json
from src.services.reasoning_service import reasoning_service

async def test_grant():
    synthesis = {"key_insights": ["Insight 1"], "unified_assessment": "Test", "conflicts_resolved": []}
    experiments = [{"title": "Exp 1", "hypothesis": "H1", "method": "M1", "expected_outcome": "O1", "feasibility_score": 5, "estimated_budget": "100"}]
    
    grant = await reasoning_service.generate_grant(synthesis, experiments)
    print("PARSED JSON OUTLINE:")
    print(json.dumps(grant, indent=2))

asyncio.run(test_grant())
