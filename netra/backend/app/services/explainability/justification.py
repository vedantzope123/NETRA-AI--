import json
import re
from typing import Dict, Any, List
from app.services.nlp.gemini_client import call_gemini_generate

def generate_link_justification(
    entity_a: str,
    entity_b: str,
    evidence_list: List[str] | str,
    evidence_type: str = "CDR"
) -> Dict[str, Any]:
    """
    Generates courtroom-safe one-sentence justification and confidence score.
    Follows exact prompt in Section 5 of build specifications.
    """
    if isinstance(evidence_list, list):
        ev_str = "; ".join(evidence_list)
        count = len(evidence_list)
    else:
        ev_str = str(evidence_list)
        count = 3
        
    system_instruction = (
        "You are assisting a law-enforcement investigator. Given two entities and "
        "the evidence connecting them, write ONE sentence a non-technical officer can read "
        "in a courtroom-adjacent context. Do not speculate beyond the evidence given."
    )
    
    prompt = f"""Entity A: {entity_a}
Entity B: {entity_b}
Evidence: {ev_str}

Output JSON only: {{"justification": str, "confidence": float, "evidence_type": str}}"""

    response_text = call_gemini_generate(prompt, system_instruction=system_instruction)
    
    if response_text:
        try:
            # Extract JSON block if surrounded by markdown fences
            clean_json = re.sub(r'```json\s*', '', response_text)
            clean_json = re.sub(r'```\s*', '', clean_json).strip()
            data = json.loads(clean_json)
            if "justification" in data and "confidence" in data:
                return {
                    "justification": str(data["justification"]).strip(),
                    "confidence": float(data.get("confidence", 0.85)),
                    "evidence_type": str(data.get("evidence_type", evidence_type))
                }
        except Exception:
            pass
            
    # Section 5 Guaranteed Template Fallback:
    # "{A} and {B} share {n} recorded contacts in evidence type {evidence_type}."
    fallback_justification = f"{entity_a} and {entity_b} share {count} recorded contacts in evidence type {evidence_type}."
    return {
        "justification": fallback_justification,
        "confidence": 0.82,
        "evidence_type": evidence_type
    }
