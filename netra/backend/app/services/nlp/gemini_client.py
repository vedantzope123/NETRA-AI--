import json
import os
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

def call_gemini_generate(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6I7kQz5DsYZ06LPxoFEIBD3pmNDcGGVoZ9v0qSYh_sPlw")
    if not api_key:
        return None
        
    # Primary: Direct REST call with Google Generative Language v1beta gemini-2.5-flash
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
            
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
            else:
                print(f"[Gemini REST Warning] Status {res.status_code}: {res.text[:150]}")
    except Exception as exc:
        print(f"[Gemini REST Exception] {exc}")

    return None
