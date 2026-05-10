import re

CATEGORY_KEYWORDS = {
    'hackathon': ['hackathon', 'hack', 'coding contest', 'build', 'sprint'],
    'internship': ['internship', 'intern', 'apprenticeship', 'training'],
    'placement': ['placement', 'campus drive', 'recruitment', 'hiring', 'job', 'career'],
    'exam': ['exam', 'test', 'quiz', 'assessment', 'gate', 'gre', 'toefl'],
    'resource': ['resource', 'tutorial', 'guide', 'notes', 'material', 'study'],
    'tech': ['ai', 'ml', 'machine learning', 'deep learning', 'python', 'javascript', 'web', 'cloud', 'blockchain', 'react', 'node'],
    'event': ['event', 'workshop', 'seminar', 'conference', 'webinar', 'meetup', 'fest'],
}

CATEGORY_COLORS = {
    'hackathon': {'primary': '#7c3aed', 'secondary': '#a78bfa', 'bg': '#1e1b4b'},
    'internship': {'primary': '#059669', 'secondary': '#6ee7b7', 'bg': '#064e3b'},
    'placement': {'primary': '#d97706', 'secondary': '#fcd34d', 'bg': '#451a03'},
    'exam': {'primary': '#dc2626', 'secondary': '#fca5a5', 'bg': '#450a0a'},
    'resource': {'primary': '#0284c7', 'secondary': '#7dd3fc', 'bg': '#0c4a6e'},
    'tech': {'primary': '#0891b2', 'secondary': '#67e8f9', 'bg': '#083344'},
    'event': {'primary': '#9333ea', 'secondary': '#d8b4fe', 'bg': '#3b0764'},
    'general': {'primary': '#6366f1', 'secondary': '#a5b4fc', 'bg': '#1e1b4b'},
}


def parse_prompt(prompt: str) -> dict:
    text = prompt.lower().strip()

    category = 'general'
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            category = cat
            break

    words = re.findall(r'\b[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*\b', prompt)
    title_candidates = [w for w in words if len(w) > 3]
    title = title_candidates[0] if title_candidates else prompt.split('.')[0][:60]

    date_patterns = [
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b',
        r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:,?\s+\d{4})?\b',
        r'\b\d{4}-\d{2}-\d{2}\b',
    ]
    date = None
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date = match.group()
            break

    venue_match = re.search(r'(?:at|in|venue[:\s]+|location[:\s]+)\s+([A-Za-z\s,]+?)(?:\.|,|$)', prompt, re.IGNORECASE)
    venue = venue_match.group(1).strip() if venue_match else None

    stop_words = {'the', 'a', 'an', 'is', 'are', 'and', 'or', 'but', 'for', 'in', 'on', 'at', 'to', 'of', 'with', 'create', 'make', 'generate', 'poster', 'video', 'caption'}
    keywords = [w for w in re.findall(r'\b\w{4,}\b', text) if w not in stop_words][:10]

    audience_map = {
        'student': ['student', 'undergraduate', 'college', 'university', 'btech', 'mtech'],
        'developer': ['developer', 'programmer', 'coder', 'engineer'],
        'professional': ['professional', 'employee', 'corporate', 'industry'],
    }
    audience = 'students'
    for aud, kws in audience_map.items():
        if any(k in text for k in kws):
            audience = aud
            break

    return {
        'original': prompt,
        'category': category,
        'title': title.strip(),
        'date': date,
        'venue': venue,
        'keywords': keywords,
        'audience': audience,
        'colors': CATEGORY_COLORS.get(category, CATEGORY_COLORS['general']),
    }
