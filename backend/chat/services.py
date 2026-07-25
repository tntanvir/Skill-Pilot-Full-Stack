import os
import json
import re
import logging
import requests
from django.conf import settings
from course.models import Course

logger = logging.getLogger(__name__)


class GeminiCourseAdvisor:
    """
    AI Career Counselor & Course Recommendation Engine powered by Google Gemini API.
    Dynamically pulls published courses from the database and recommends the best matching courses
    based on the user's message.
    """

    @classmethod
    def get_api_key(cls):
        return getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY', os.getenv('GEMINI', '')))

    @classmethod
    def get_available_courses(cls):
        courses = Course.objects.filter(is_published=True).select_related('category')
        course_list = []
        for c in courses:
            course_list.append({
                "id": c.id,
                "title": c.title,
                "slug": c.slug,
                "description": c.description[:180] if c.description else "",
                "price": str(c.price),
                "level": c.level,
                "category": c.category.name if c.category else "General"
            })
        return course_list

    @classmethod
    def generate_recommendation(cls, user_message):
        api_key = cls.get_api_key()
        available_courses = cls.get_available_courses()
        
        course_catalog_json = json.dumps(available_courses, indent=2)

        system_instruction = f"""
You are SkillPilot AI, an expert career counselor and course advisor for SkillPilot e-learning platform.
Your goal is to analyze the user's message, identify their current background skills and learning goals, and recommend 1 to 3 best matching courses from our database.

OUR ACTIVE COURSE CATALOG:
{course_catalog_json}

CRITICAL RULES FOR RECOMMENDATION:
1. Carefully analyze the user's explicit request:
   - If user asks about **hosting, deployment, servers, cloud, Docker, Kubernetes, or AWS**, prioritize DevOps & Cloud courses (e.g. Docker & Kubernetes Mastery, AWS Cloud Solutions Architect).
   - If user asks about **mobile apps, Flutter, Kotlin, Android, iOS**, prioritize Mobile App Development courses.
   - If user asks about **cybersecurity, networking, CCNA, ethical hacking**, prioritize Networking & Security courses.
   - If user asks about **AI, Machine Learning, PyTorch, LLMs**, prioritize Artificial Intelligence courses.
   - If user asks about **backend development (Django, FastAPI, Node.js)**, prioritize Backend Development courses.
2. Be encouraging, clear, friendly, and structured. Explain why each recommended course matches their request.
3. CRITICAL METADATA REQUIREMENT:
   You MUST end your response with these exact 3 metadata lines. Make sure the RECOMMENDED_COURSE_IDS array contains the exact numeric IDs of the courses you recommended in your text:
   DETECTED_SKILLS: <skills detected or None>
   DETECTED_GOAL: <target career goal or topic>
   RECOMMENDED_COURSE_IDS: [<id1>, <id2>]
"""

        user_prompt = f"User Message: {user_message}\n\nPlease analyze my request and recommend the best matching course(s) from the catalog!"

        # REST API Call to Gemini with model fallbacks
        import time
        models_to_try = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.5-pro"
        ]

        ai_response_text = ""
        recommended_course_ids = []
        detected_skills = ""
        detected_goal = ""

        if not api_key:
            return cls._rule_based_fallback(user_message, available_courses)

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{system_instruction}\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 2048
                }
            }
            headers = {"Content-Type": "application/json"}

            for attempt in range(2):
                try:
                    res = requests.post(url, json=payload, headers=headers, timeout=14)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                ai_response_text = parts[0].get("text", "")
                                break
                    elif res.status_code in [429, 503] and attempt == 0:
                        time.sleep(1.5)
                        continue
                    else:
                        logger.warning(f"Gemini API model {model_name} status {res.status_code}: {res.text}")
                except Exception as ex:
                    logger.error(f"Error calling Gemini model {model_name}: {ex}")

            if ai_response_text:
                break

        if not ai_response_text:
            return cls._rule_based_fallback(user_message, available_courses)

        # Extract metadata from response text
        try:
            if "DETECTED_SKILLS:" in ai_response_text:
                parts = ai_response_text.split("DETECTED_SKILLS:")
                clean_response = parts[0].strip()
                meta_block = parts[1]

                if "DETECTED_GOAL:" in meta_block:
                    s_parts = meta_block.split("DETECTED_GOAL:")
                    detected_skills = s_parts[0].strip()
                    g_block = s_parts[1]

                    if "RECOMMENDED_COURSE_IDS:" in g_block:
                        g_parts = g_block.split("RECOMMENDED_COURSE_IDS:")
                        detected_goal = g_parts[0].strip()
                        ids_str = g_parts[1].strip().split("\n")[0].strip()
                        found = re.findall(r'\d+', ids_str)
                        if found:
                            recommended_course_ids = [int(x) for x in found]
                    else:
                        detected_goal = g_block.strip()
                ai_response_text = clean_response
            elif "RECOMMENDED_COURSE_IDS:" in ai_response_text:
                parts = ai_response_text.split("RECOMMENDED_COURSE_IDS:")
                ai_response_text = parts[0].strip()
                ids_str = parts[1].strip().split("\n")[0].strip()
                found = re.findall(r'\d+', ids_str)
                if found:
                    recommended_course_ids = [int(x) for x in found]
        except Exception as ex:
            logger.warning(f"Could not parse metadata block: {ex}")

        # Scan text directly for mentioned course titles or IDs if metadata list is empty
        if not recommended_course_ids:
            recommended_course_ids = cls._extract_course_ids_from_text(ai_response_text, available_courses)

        # Domain Keyword Fallback matching if still empty or mismatched
        if not recommended_course_ids:
            recommended_course_ids, fallback_skills, fallback_goal = cls._find_matching_course_ids(user_message, available_courses)
            if not detected_skills:
                detected_skills = fallback_skills
            if not detected_goal:
                detected_goal = fallback_goal

        return ai_response_text, recommended_course_ids, detected_skills, detected_goal

    @classmethod
    def _extract_course_ids_from_text(cls, response_text, available_courses):
        """Scans the AI text response to extract course IDs explicitly mentioned or titled in text."""
        extracted_ids = []
        
        # 1. Match explicit ID markers like "ID: 5" or "(ID: 5)" or "Course ID: 5"
        id_matches = re.findall(r'(?:Course\s*ID|ID)[:\s]*(\d+)', response_text, re.IGNORECASE)
        for m in id_matches:
            extracted_ids.append(int(m))

        # 2. Match course titles mentioned in text
        text_lower = response_text.lower()
        for c in available_courses:
            title_lower = c["title"].lower()
            # If main part of title is in text (e.g. "docker & kubernetes mastery" or "aws cloud solutions")
            title_words = [w for w in title_lower.split() if len(w) > 3 and w not in ["development", "mastery", "bootcamp"]]
            if title_lower in text_lower or (len(title_words) >= 2 and all(w in text_lower for w in title_words[:2])):
                extracted_ids.append(c["id"])

        return list(dict.fromkeys(extracted_ids))

    @classmethod
    def _find_matching_course_ids(cls, user_message, available_courses):
        """Intelligent keyword matcher for all domains."""
        msg_lower = user_message.lower()
        matched = []
        skills = []
        goal = ""

        # Domain 1: Hosting, DevOps, Deployment, Cloud, Docker, Kubernetes, AWS
        if any(w in msg_lower for w in ["host", "hosting", "deploy", "deployment", "devops", "cloud", "docker", "kubernetes", "aws", "server"]):
            goal = "DevOps & Hosting"
            for c in available_courses:
                cat_lower = c["category"].lower()
                title_lower = c["title"].lower()
                desc_lower = c["description"].lower()
                if "devops" in cat_lower or "docker" in title_lower or "kubernetes" in title_lower or "aws" in title_lower or "deploy" in desc_lower:
                    matched.append(c["id"])

        # Domain 2: Networking & Security
        elif any(w in msg_lower for w in ["network", "networking", "security", "cybersecurity", "ccna", "cisco", "hacking", "ethical"]):
            goal = "Networking & Cybersecurity"
            for c in available_courses:
                cat_lower = c["category"].lower()
                title_lower = c["title"].lower()
                if "security" in cat_lower or "networking" in cat_lower or "ccna" in title_lower or "hacking" in title_lower:
                    matched.append(c["id"])

        # Domain 3: Mobile App Development
        elif any(w in msg_lower for w in ["mobile", "flutter", "dart", "kotlin", "android", "ios", "react native"]):
            goal = "Mobile App Developer"
            for c in available_courses:
                cat_lower = c["category"].lower()
                title_lower = c["title"].lower()
                if "mobile" in cat_lower or "flutter" in title_lower or "android" in title_lower or "kotlin" in title_lower:
                    matched.append(c["id"])

        # Domain 4: AI & Data Science
        elif any(w in msg_lower for w in ["ai", "artificial intelligence", "machine learning", "data science", "pytorch", "llm", "deep learning"]):
            goal = "AI & Data Science"
            for c in available_courses:
                cat_lower = c["category"].lower()
                title_lower = c["title"].lower()
                if "intelligence" in cat_lower or "ai" in title_lower or "data science" in title_lower or "pytorch" in title_lower:
                    matched.append(c["id"])

        # Domain 5: Backend Development
        elif any(w in msg_lower for w in ["backend", "django", "fastapi", "node", "express", "rest api"]):
            goal = "Backend Developer"
            for c in available_courses:
                cat_lower = c["category"].lower()
                title_lower = c["title"].lower()
                if "backend" in cat_lower or "django" in title_lower or "fastapi" in title_lower or "node" in title_lower:
                    matched.append(c["id"])

        if "python" in msg_lower:
            skills.append("Python")
        if "javascript" in msg_lower or "js" in msg_lower:
            skills.append("JavaScript")
        if "html" in msg_lower:
            skills.append("HTML")

        if not matched and available_courses:
            matched = [available_courses[0]["id"]]

        return list(dict.fromkeys(matched)), ", ".join(skills), goal

    @classmethod
    def _rule_based_fallback(cls, user_message, available_courses):
        matched_ids, detected_skills, detected_goal = cls._find_matching_course_ids(user_message, available_courses)
        matched_courses = [c for c in available_courses if c["id"] in matched_ids]
        courses_str = "\n".join([f"- **{c['title']}** (Level: {c['level']}, Price: ${c['price']})" for c in matched_courses])

        msg_lower = user_message.lower()
        if any(w in msg_lower for w in ["host", "hosting", "deploy", "deployment", "devops", "cloud", "docker", "kubernetes", "aws"]):
            response = (
                "Hosting and application deployment are essential skills for any modern developer! "
                "To master hosting, containerization, and cloud infrastructure, here are the top recommended courses from our catalog:\n\n"
                f"{courses_str}\n\n"
                "These courses cover Docker, Kubernetes, CI/CD pipelines, and AWS cloud hosting!"
            )
        else:
            response = (
                "Based on your request, here are the best matching courses from our catalog to help you achieve your goals:\n\n"
                f"{courses_str}\n\n"
                "Keep building real-world projects!"
            )

        return response, matched_ids, detected_skills, detected_goal
