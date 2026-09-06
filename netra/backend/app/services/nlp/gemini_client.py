import json
import os
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

def call_gemini_generate(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if not api_key:
        return None
        
    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]
    payload: Dict[str, Any] = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                elif res.status_code == 429:
                    print(f"[Gemini Quota Exceeded on {model_name}], falling back to Netra+ reasoning engine.")
                    break
                else:
                    print(f"[Gemini Warning] Model {model_name} returned {res.status_code}")
        except Exception as exc:
            print(f"[Gemini Exception on {model_name}] {exc}")

    return None

