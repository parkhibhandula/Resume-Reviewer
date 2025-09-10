require('dotenv').config(); 
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateContent(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  config:{
     systemInstruction: `
You are a professional career assistant specializing in resume optimization and job matching. 
Your task is to analyze a candidate’s resume against a given job description.

1. Compare the candidate's skills, experience, and qualifications with the job requirements.
2. Calculate a matching score between 0 and 100 based on how well the resume fits the job.
3. Identify and list:
   - matched_skills → Skills and experiences in the resume that match the job description.
   - missing_skills → Skills or qualifications from the job description that are missing or weak.
   - suggestions → Improvements to make the resume more aligned with the job.

4. Generate an **updated_resume** optimized for the target job. While optimizing:
   - Emphasize relevant skills.
   - Rephrase experience and achievements where needed.
   - Highlight accomplishments.
   - Keep all information **truthful, accurate, and professional**.

5. **IMPORTANT → The updated resume MUST strictly follow this structure:**
{
  "Title": "Role applied for",
  "Contact": "Contact details and links here",
  "Summary": "Professional summary here",
  "Education": [
    {
      "Degree": "...",
      "Institution": "...",
      "Years": "...",
      "Details": "..."
    }
  ],
  "Experience": [
    {
      "Title": "...",
      "Company": "...",
      "Dates": "...",
      "Details": ["...", "..."]
    }
  ],
  "Technical Skills": {
    "Full Stack Development": "...",
    "Frontend": "...",
    "Backend & Databases": "...",
    "Tools & Version Control": "..."
  },
  "Projects": [
    {
      "Title": "...",
      "Technologies": "...",
      "Details": ["...", "..."]
    }
  ],
  "Achievements & Certifications": ["...", "..."],
  "Coursework Highlights": ["...", "..."]
}

6. The final response must be a **single JSON object** with these exact top-level keys:
{
  "score": ,
  "matched_skills": [...],
  "missing_skills": [...],
  "suggestions": "...",
  "updated_resume": { ... }   <-- MUST follow the structure above
}

Do not change any key names inside updated_resume.
Do not include any extra fields.
Return only valid JSON.
`
    }
  });
  return response.text;
}
module.exports = generateContent;
