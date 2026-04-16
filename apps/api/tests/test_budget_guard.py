import pytest
from src.middleware.budget_guard import BudgetProtection

@pytest.fixture
def budget_guard():
    return BudgetProtection()

@pytest.mark.asyncio
async def test_calculate_actual_cost(budget_guard):
    # Test minstral-8b actual cost (input: 0.0002, output: 0.0002)
    cost = budget_guard.calculate_actual_cost("ministral-8b-2512", 1000, 1000)
    assert cost == 0.0004
    
    # Test mistral-large actual cost (input: 0.002, output: 0.006)
    cost = budget_guard.calculate_actual_cost("mistral-large-latest", 1000, 2000)
    assert cost == 0.014

@pytest.mark.asyncio
async def test_check_request_budget(budget_guard):
    assert await budget_guard.check_request_budget(0.05) is True
    assert await budget_guard.check_request_budget(1.50) is False

@pytest.mark.asyncio
async def test_estimate_cost(budget_guard):
    input_text = "A" * 4000  # 1000 tokens
    cost = budget_guard.estimate_cost("ministral-8b-2512", input_text, 1000)
    assert cost == 0.0004
