import asyncio, os, dotenv  
from src.config import get_settings  
from src.services.mistral_client import mistral_client  
dotenv.load_dotenv('../../.env')  
async def test():  
    print('Key:', repr(os.getenv('LUMINAE_MISTRAL_API_KEY')))  
    try:  
        print(await mistral_client.chat_complete('ministral-8b-2512', [{'role': 'user', 'content': 'hi'}], 10))  
    except Exception as e:  
        print('ERR:', e)  
asyncio.run(test()) 
