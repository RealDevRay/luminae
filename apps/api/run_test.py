"""Full end-to-end test: OCR + all 5 reasoning agents."""
import asyncio
import base64
import time
import os
import dotenv
dotenv.load_dotenv('../../.env')

from src.services.agent_orchestrator import agent_orchestrator

# Valid minimal PDF containing "1"
b64_pdf = "JVBERi0xLjEKJcKlwrHDqwoxIDAgb2JqCiAgPDwgL1R5cGUgL0NhdGFsb2cKICAgICAvUGFnZXMgMiAwIFIKICA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcwogICAgIC9LaWRzIFszIDAgUl0KICAgICAvQ291bnQgMQogICAgIC9NZWRpYUJveCBbMCAwIDMwMCAxNDRdCiAgPj4KZW5kb2JqCjMgMCBvYmoKICA8PCAvVHlwZSAvUGFnZQogICAgIC9QYXJlbnQgMiAwIFIKICAgICAvUmVzb3VyY2VzCiAgICAgIDw8IC9Gb250CiAgICAgICAgICAgPDwgL0YxCiAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgL1N1YnR5cGUgL1R5cGUxCiAgICAgICAgICAgICAgICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCiAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgID4+CiAgICAgL0NvbnRlbnRzIDQgMCBSCgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCA1NSA+PgpzdHJlYW0KICBCVAogICAgL0YxIDE4IFRmCiAgICAwIDAgVGQKICAgICgxKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNzcgMDAwMDAgbiAKMDAwMDAwMDE3OCAwMDAwMCBuIAowMDAwMDAwNDU3IDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvUm9vdCAxIDAgUgogICAgIC9TaXplIDUKICA+PgpzdGFydHhyZWYKNTEyCiUlRU9GCg=="


async def test():
    start = time.time()
    try:
        pdf_bytes = base64.b64decode(b64_pdf)
        print(f"PDF size: {len(pdf_bytes)} bytes")
        print(f"[{time.time()-start:.1f}s] Starting full pipeline...")
        
        result = await agent_orchestrator.analyze_paper(pdf_bytes, "test.pdf")
        
        elapsed = time.time() - start
        print(f"\n[{elapsed:.1f}s] FULL PIPELINE COMPLETE!")
        print(f"  Keys: {list(result.keys())}")
        print(f"  Title: {result.get('metadata', {}).get('title')}")
        print(f"  OCR text: {repr(result.get('extraction', {}).get('ocr_text', '')[:100])}")
        print(f"  Methodology: {bool(result.get('critique', {}).get('methodology'))}")
        print(f"  Dataset audit: {bool(result.get('critique', {}).get('dataset'))}")
        print(f"  Experiments: {len(result.get('improvements', {}).get('experiments', []))}")
        print(f"  Grant: {bool(result.get('grant_outline'))}")
        print(f"  Processing time: {result.get('economics', {}).get('processing_time_seconds')}s")
    except Exception:
        import traceback
        traceback.print_exc()
        print(f"\nCRASHED after {time.time()-start:.1f}s")

asyncio.run(test())
