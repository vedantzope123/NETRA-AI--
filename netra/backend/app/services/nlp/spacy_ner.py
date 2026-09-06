import re
from typing import Dict, List, Any

# Pattern helpers
PHONE_REGEX = re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{9}')
VEHICLE_REGEX = re.compile(r'\b[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}\b')

def get_spacy_nlp():
    try:
        import spacy
        try:
            return spacy.load("en_core_web_sm")
        except Exception:
            # Create a blank English pipeline with entity ruler / sentencizer
            nlp = spacy.blank("en")
            if "sentencizer" not in nlp.pipe_names:
                nlp.add_pipe("sentencizer")
            return nlp
    except Exception:
        return None

nlp = get_spacy_nlp()

def extract_entities_from_text(text: str) -> Dict[str, List[Dict[str, Any]]]:
    results = {
        "people": [],
        "phones": [],
        "vehicles": [],
        "locations": [],
        "organizations": []
    }
    
    # 1. Regex extractions (Phone numbers and Indian vehicle plates)
    found_phones = set(PHONE_REGEX.findall(text))
    for p in found_phones:
        results["phones"].append({
            "identifier": p,
            "context": f"Identified mobile number {p} in case documentation"
        })
        
    found_vehicles = set(VEHICLE_REGEX.findall(text))
    for v in found_vehicles:
        results["vehicles"].append({
            "identifier": v,
            "context": f"Identified vehicle registration plate {v}"
        })
        
    # 2. spaCy NER
    if nlp:
        doc = nlp(text)
        if doc.ents:
            for ent in doc.ents:
                clean_text = ent.text.strip()
                if len(clean_text) < 2:
                    continue
                if ent.label_ == "PERSON":
                    if not any(p["name"].lower() == clean_text.lower() for p in results["people"]):
                        results["people"].append({
                            "name": clean_text,
                            "context": ent.sent.text if hasattr(ent, "sent") else text[:100]
                        })
                elif ent.label_ in ["GPE", "LOC"]:
                    if not any(loc["name"].lower() == clean_text.lower() for loc in results["locations"]):
                        results["locations"].append({
                            "name": clean_text,
                            "context": ent.sent.text if hasattr(ent, "sent") else text[:100]
                        })
                elif ent.label_ == "ORG":
                    if not any(org["name"].lower() == clean_text.lower() for org in results["organizations"]):
                        results["organizations"].append({
                            "name": clean_text,
                            "context": ent.sent.text if hasattr(ent, "sent") else text[:100]
                        })
                        
    # 3. Rule-based heuristic fallback for common FIR terms if spaCy was blank or missed
    if not results["people"]:
        # Match capitalized suspect names after words like 'accused', 'suspect', 'identified as', 'alias'
        name_matches = re.findall(r'(?:accused|suspect|identified as|driver|handler|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text, re.IGNORECASE)
        for nm in name_matches:
            if not any(p["name"].lower() == nm.lower() for p in results["people"]):
                results["people"].append({"name": nm, "context": f"Accused mentioned in FIR narrative"})
                
    if not results["locations"]:
        loc_matches = re.findall(r'(?:in|at|near|towards|district|area of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text)
        for loc in loc_matches:
            if loc.lower() not in ["the", "a", "an", "this", "court", "station"] and not any(l["name"].lower() == loc.lower() for l in results["locations"]):
                results["locations"].append({"name": loc, "context": "Location cited in incident timeline"})
                
    return results
