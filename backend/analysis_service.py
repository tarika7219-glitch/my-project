import json
import re
from groq import Groq
from typing import Dict, List

class AnalysisService:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"  # Free stable model on Groq
    
    def _extract_json(self, text: str) -> Dict:
        """Extract and parse JSON from response, handling markdown formatting"""
        if not text or not text.strip():
            raise ValueError("Empty response from API")
        
        # Remove markdown code blocks if present
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()
        
        # Try direct parsing first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON object in the text
        try:
            # Find content between first { and last }
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1 and start < end:
                json_str = text[start:end+1]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        raise ValueError(f"Could not parse JSON from response: {text[:200]}")
    
    def analyze_skills_match(self, resume_text: str, job_description: str) -> Dict:
        """Analyze how well resume skills match job description"""
        prompt = f"""Analyze the following resume and job description. Return ONLY a JSON object with these exact fields:
{{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "skills_to_learn": ["skill1", "skill2"],
  "match_percentage": 75,
  "summary": "Brief summary",
  "resume_improvements": {{
    "quantified_achievements": ["specific suggestion 1", "specific suggestion 2"],
    "summary_section": "How to improve the professional summary/objective",
    "keywords": ["keyword1 to add", "keyword2 to add"],
    "ats_compatibility": "Specific suggestions to improve ATS compatibility"
  }}
}}

Resume:
{resume_text}

Job Description:
{job_description}

For resume_improvements:
- quantified_achievements: List specific ways to add metrics/numbers to achievements
- summary_section: Advice on improving the professional summary
- keywords: Missing technical keywords that should be added
- ats_compatibility: Tips for ATS-friendly formatting

Return ONLY the JSON object, no markdown, no extra text."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,  # Lower temp for more consistent JSON
                max_tokens=2500
            )
            
            response_text = response.choices[0].message.content
            analysis = self._extract_json(response_text)
            return analysis
        except Exception as e:
            raise Exception(f"Error analyzing skills: {str(e)}")
    
    def chat_response(self, user_question: str, context: str = "") -> str:
        """Generate chatbot response to user questions with analysis context awareness"""
        # Parse context if available
        analysis_info = ""
        if context:
            try:
                context_data = json.loads(context)
                # Build readable analysis summary
                matching = context_data.get('matching_skills', [])
                missing = context_data.get('missing_skills', [])
                to_learn = context_data.get('skills_to_learn', [])
                match_pct = context_data.get('match_percentage', 0)
                improvements = context_data.get('resume_improvements', {})
                
                analysis_info = f"""
USER'S RESUME ANALYSIS:
- Match Score: {match_pct}%
- Matching Skills: {', '.join(matching) if matching else 'None'}
- Missing Skills: {', '.join(missing) if missing else 'None'}
- Skills to Learn: {', '.join(to_learn) if to_learn else 'None'}

RESUME IMPROVEMENTS NEEDED:
- Quantified Achievements: {', '.join(improvements.get('quantified_achievements', [])) if improvements.get('quantified_achievements') else 'Add metrics to achievements'}
- Keywords to Add: {', '.join(improvements.get('keywords', [])) if improvements.get('keywords') else 'No specific keywords'}
- Summary Suggestion: {improvements.get('summary_section', 'Enhance your professional summary')}
- ATS Tips: {improvements.get('ats_compatibility', 'Improve document formatting')}
"""
            except (json.JSONDecodeError, TypeError):
                analysis_info = f"\nAnalysis context provided but couldn't parse it fully."
        
        system_prompt = f"""You are an expert AI career assistant and technical mentor. Your role is to help users:
1. Understand their skill gaps and strengths
2. Learn how to improve specific technical skills  
3. Craft better resume content
4. Prepare for job roles they're targeting

CORE BEHAVIORS:
- When users ask about specific skills (e.g., "How can I improve my React skills?"), give practical, actionable advice
- When users ask about missing skills, reference the analysis data provided
- When users ask to "Rewrite my summary", provide concrete suggestions based on their analysis
- When users ask "What skills am I missing?", reference the specific missing skills in their analysis
- Answer conceptual questions with clear examples and learning paths
- Be encouraging and focus on growth opportunities

FORMATTING INSTRUCTIONS:
- Use **bold** for important terms and technical concepts
- Use *italics* for emphasis and highlights
- Use ### for main topic headers
- Use #### for subtopics
- Use numbered lists (1. 2. 3.) for steps and processes
- Use bullet points (-) for characteristics and options
- Use code blocks for code examples and syntax
- Include resources and learning recommendations when relevant
- Break responses into clear sections for readability

ANALYSIS CONTEXT ABOUT THE USER:{analysis_info if analysis_info else "No recent analysis available. User can still ask general questions."}

Answer questions as a knowledgeable mentor. If context is available, leverage it to give personalized advice.
Format all responses in Markdown for better readability."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating chat response: {str(e)}")
    
    def generate_learning_roadmap(self, missing_skills: List[str], skills_to_learn: List[str], 
                                  match_percentage: int) -> Dict:
        """Generate a detailed week-by-week learning roadmap"""
        skills_list = ', '.join(skills_to_learn[:5])  # Focus on top 5 skills to learn
        
        prompt = f"""Create a detailed, personalized learning roadmap for someone with:
- Current Match: {match_percentage}%
- Skills to Focus On: {skills_list}

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{{
  "title": "Your {match_percentage}% → 90% Roadmap",
  "duration_weeks": X,
  "overview": "Brief overview of the learning path",
  "weeks": [
    {{
      "week": 1,
      "title": "Week Title",
      "topics": ["Topic 1", "Topic 2"],
      "learnings": ["What you'll learn 1", "What you'll learn 2"],
      "resources": ["Resource 1", "Resource 2"],
      "time_commitment": "X hours/week"
    }},
    ...more weeks...
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Brief description",
      "skills_practiced": ["skill1", "skill2"],
      "timeline": "After week X"
    }},
    ...more projects...
  ],
  "milestones": [
    {{
      "week": X,
      "milestone": "Achievement name"
    }}
  ],
  "estimated_final_match": "X%"
}}

Create a realistic, practical roadmap that:
- Takes 8-12 weeks to complete
- Starts with fundamentals and builds to advanced topics
- Includes hands-on projects every 2-3 weeks
- Focuses on: {', '.join(skills_to_learn)}
- Is achievable with 15-20 hours/week of study
- Includes industry best practices
- Has clear milestones for motivation

Make it specific, actionable, and achievable."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=3000
            )
            
            response_text = response.choices[0].message.content
            roadmap = self._extract_json(response_text)
            return roadmap
        except Exception as e:
            raise Exception(f"Error generating learning roadmap: {str(e)}")

    def generate_interview_questions(self, resume_text: str, job_description: str, missing_skills: List[str]) -> Dict:
        """Generate technical, behavioral, and role-based interview questions"""
        
        # Truncate texts if too long for API
        resume_summary = resume_text[:1500] if resume_text else "No resume provided"
        job_summary = job_description[:1500] if job_description else "No job description provided"
        skills_str = ", ".join(missing_skills[:10]) if missing_skills else "General skills"
        
        prompt = f"""Based on this resume, job description, and missing skills, generate interview questions. Return ONLY a JSON object:

{{
  "technical_questions": [
    {{"question": "Question here?", "focus_area": "Skill or concept", "tips": "How to answer well"}},
    ... 5-7 questions
  ],
  "behavioral_questions": [
    {{"question": "Question here?", "situation": "Context", "tips": "How to approach"}},
    ... 4-5 questions
  ],
  "role_based_questions": [
    {{"question": "Question here?", "role_context": "Why it matters", "tips": "Answer guidance"}},
    ... 4-5 questions
  ]
}}

Resume: {resume_summary}

Job Description: {job_summary}

Skills to focus on: {skills_str}

Create specific, realistic interview questions that:
- Target the exact skills and experience shown in the resume
- Align with the job requirements
- Help the candidate prepare for gaps (missing skills)
- Are commonly asked in this industry/role
- Can be answered with concrete examples
- Test both technical knowledge and soft skills"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            
            response_text = response.choices[0].message.content
            questions = self._extract_json(response_text)
            return questions
        except Exception as e:
            raise Exception(f"Error generating interview questions: {str(e)}")

    def evaluate_interview_answer(self, question: str, user_answer: str) -> Dict:
        """Evaluate user's interview answer and provide feedback"""
        
        if not user_answer or user_answer.strip() == "":
            return {
                "rating": 0,
                "feedback": "No answer provided",
                "strengths": [],
                "weaknesses": ["No response given"],
                "improvements": ["Please try to answer the question"]
            }
        
        prompt = f"""Evaluate this interview answer and return ONLY a JSON object:

{{
  "rating": 7,
  "feedback": "Brief overall assessment",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"]
}}

INTERVIEW QUESTION: {question}

CANDIDATE'S ANSWER: {user_answer}

Evaluate on:
1. **Rating (1-10)**: How well does this answer address the question?
2. **Strengths**: What did they do well? (2-3 points)
3. **Weaknesses**: What could be improved? (1-2 points)
4. **Improvements**: Actionable suggestions to make it better (2-3 suggestions)

Be constructive, specific, and encouraging. Look for:
- Relevance to the question
- Clear structure (situation, action, result if behavioral)
- Specific examples and metrics
- Confidence and clarity
- Technical accuracy (if applicable)
- Communication effectiveness"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content
            feedback = self._extract_json(response_text)
            return feedback
        except Exception as e:
            raise Exception(f"Error evaluating interview answer: {str(e)}")

    def rewrite_resume_bullets(self, bullets: List[str], job_description: str = "") -> Dict:
        """Rewrite resume bullets to be stronger, quantified, and ATS-friendly"""
        clean_bullets = [b.strip() for b in bullets if b and b.strip()]
        if not clean_bullets:
            raise ValueError("At least one bullet point is required")

        bullet_text = "\n".join([f"- {bullet}" for bullet in clean_bullets[:10]])
        job_context = (job_description or "").strip()[:2000]

        prompt = f"""Rewrite these resume bullet points to be stronger, quantified, and ATS-friendly.
Return ONLY valid JSON with this exact structure:
{{
  "rewrites": [
    {{
      "original": "Original bullet",
      "rewritten": "Improved bullet with impact and metrics",
      "improvement_reason": "Why this rewrite is stronger"
    }}
  ],
  "ats_keywords_added": ["keyword1", "keyword2"],
  "overall_tips": ["tip1", "tip2", "tip3"]
}}

INPUT BULLETS:
{bullet_text}

JOB DESCRIPTION CONTEXT (optional):
{job_context if job_context else "No job description provided."}

Rules:
1. Keep each rewritten bullet realistic and truthful.
2. Prioritize action verbs + measurable impact.
3. Keep each bullet concise (max 35 words).
4. Preserve core meaning of each original bullet.
5. Optimize language for ATS and recruiter clarity.
6. Return one rewrite for each input bullet in the same order.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=1800
            )

            response_text = response.choices[0].message.content
            rewritten = self._extract_json(response_text)
            return rewritten
        except Exception as e:
            raise Exception(f"Error rewriting resume bullets: {str(e)}")
