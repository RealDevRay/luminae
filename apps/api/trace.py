import asyncio, os, dotenv  
from src.config import get_settings  
from src.services.agent_orchestrator import agent_orchestrator  
dotenv.load_dotenv('../../.env')  
async def test():  
    try:  
        print('Calling analyze_paper...')  
        res = await agent_orchestrator.analyze_paper(b'%%PDF-1.4...', 'test.pdf')  
        print('SUCCESS:', res.keys())  
    except Exception as e:  
        import traceback; traceback.print_exc()  
asyncio.run(test()) 
