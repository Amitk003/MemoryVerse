from typing import Optional

from app.core.gemini import gemini_client


CATEGORIES = [
    "project",
    "skill",
    "certification",
    "internship",
    "achievement",
    "academics",
    "other",
]


class Classifier:
    def __init__(self):
        self.categories = CATEGORIES

    def classify(self, title: str, text: str) -> dict:
        prompt = f"""
You are a document classifier. Given the document title and content below,
classify it into EXACTLY ONE of these categories: {', '.join(self.categories)}.

Return ONLY a JSON object with these fields:
- "category": one of the categories above
- "reason": a short reason for the classification (max 20 words)

Document Title: {title}
Document Content: {text[:2000]}
"""

        try:
            response = gemini_client.generate_text(prompt)
            import json
            cleaned = response.strip().strip("```json").strip("```").strip()
            result = json.loads(cleaned)
            if result["category"] not in self.categories:
                result["category"] = "other"
            return result
        except Exception:
            return {"category": "other", "reason": "Classification failed, defaulted to other"}


classifier = Classifier()
