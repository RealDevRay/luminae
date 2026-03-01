import asyncio, os  
from src.services.mistral_client import mistral_client  
from mistralai import Mistral  
api_key = os.getenv('LUMINAE_MISTRAL_API_KEY')  
client = Mistral(api_key=api_key)  
async def test():  
    try:  
        with open('test.pdf', 'wb') as f: f.write(b'%%PDF-1.4...')  
        with open('test.pdf', 'rb') as f:  
            print('Uploading...')  
            uploaded_pdf = await client.files.upload_async(file={'file_name': 'test.pdf', 'content': f.read()}, purpose='ocr')  
            print(uploaded_pdf)  
    except Exception as e:  
        import traceback; traceback.print_exc()  
asyncio.run(test()) 
