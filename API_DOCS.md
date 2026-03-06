# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check
**Endpoint:** `GET /api/health`

**Description:** Check if the API is running and healthy.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### 2. Analyze Resume
**Endpoint:** `POST /api/analyze`

**Description:** Analyze resume against job description for skill matching.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `resume` (file, required): Resume file in PDF or TXT format
  - `job_description` (file, required): Job description file in PDF or TXT format

**Example:**
```javascript
const formData = new FormData();
formData.append('resume', resumeFile);
formData.append('job_description', jobDescriptionFile);

const response = await fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  body: formData
});
```

**Response (Success - 200):**
```json
{
  "success": true,
  "analysis": {
    "matching_skills": [
      "Python",
      "JavaScript",
      "React",
      "SQL"
    ],
    "missing_skills": [
      "Docker",
      "Kubernetes",
      "AWS"
    ],
    "skills_to_learn": [
      {
        "priority": 1,
        "skill": "Docker",
        "importance": "High"
      },
      {
        "priority": 2,
        "skill": "Kubernetes",
        "importance": "High"
      },
      {
        "priority": 3,
        "skill": "AWS",
        "importance": "Medium"
      }
    ],
    "match_percentage": 75,
    "summary": "You have a strong foundation with 75% of the required skills. Focus on Docker and Kubernetes for containerization."
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Resume and job description files are required"
}
```

**Error Cases:**
- 400: Missing files or empty files
- 400: Unsupported file format
- 413: File size exceeds 16MB
- 500: Server error or API error

---

### 3. Chat
**Endpoint:** `POST /api/chat`

**Description:** Get AI-powered responses to questions about skills and concepts.

**Request:**
- Method: POST
- Content-Type: application/json
- Body:
  ```json
  {
    "message": "What is Docker and why is it important?",
    "context": "Optional context from analysis results"
  }
  ```

**Example:**
```javascript
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "message": "How do I learn Docker?",
    "context": "User is missing Docker skill"
  })
});

const data = await response.json();
console.log(data.response);
```

**Response (Success - 200):**
```json
{
  "success": true,
  "response": "Docker is a containerization platform that allows you to package applications with all their dependencies into isolated containers. Here's how to learn it:\n\n1. **Understand the basics**: Learn about containers, images, and how Docker works\n2. **Installation**: Download Docker Desktop\n3. **Practice**: Start with simple containers\n4. **Build images**: Learn Dockerfile syntax\n5. **Compose**: Use Docker Compose for multi-container applications\n\nRecommended resources:\n- Official Docker documentation\n- Docker official tutorial\n- YouTube courses on containerization"
}
```

**Response (Error - 400):**
```json
{
  "error": "Message is required"
}
```

---

### 4. File Type Help
**Endpoint:** `GET /api/file-type-help`

**Description:** Get information about supported file types and formats.

**Response:**
```json
{
  "supported_formats": ["pdf", "txt"],
  "max_file_size": "16MB",
  "tips": {
    "resume": "Upload your complete resume in PDF or TXT format",
    "job_description": "Upload or paste the job description in PDF or TXT format"
  }
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200  | Request successful | Analysis completed |
| 400  | Bad request | Missing required fields |
| 404  | Not found | Invalid endpoint |
| 413  | Payload too large | File exceeds 16MB |
| 500  | Server error | API or processing error |

### Error Response Format
```json
{
  "error": "Description of what went wrong"
}
```

---

## Rate Limiting

- OpenAI API calls are rate-limited by your API plan
- No additional rate limiting on these endpoints
- Be mindful of API usage costs

---

## File Format Specifications

### Supported Formats
- **PDF (.pdf)**: Text-based PDF files
- **TXT (.txt)**: Plain text files

### File Size Limits
- **Maximum**: 16MB per file
- **Recommended**: Under 5MB for optimal performance

### Resume Format Best Practices
```
TECHNICAL SKILLS
- Languages: Python, JavaScript, Java
- Frameworks: React, Django, Flask
- Tools: Git, Docker, AWS

EXPERIENCE
[List experience with technologies used]

EDUCATION
[Certifications and relevant courses]
```

### Job Description Format Best Practices
```
REQUIRED SKILLS
- Python
- React
- Docker
- AWS

NICE TO HAVE
- Kubernetes
- CI/CD

EXPERIENCE
[Required years and type of experience]
```

---

## Example Workflow

1. **Upload files**
   ```javascript
   POST /api/analyze
   ```

2. **Get analysis results**
   - View matching skills
   - Identify gaps
   - See learning priorities

3. **Ask chatbot questions**
   ```javascript
   POST /api/chat
   ```
   - "Explain Docker"
   - "How do I learn Kubernetes?"
   - "What is the job requirement for AWS?"

4. **Iterate and learn**
   - Review missing skills
   - Ask follow-up questions
   - Create learning plan

---

## CORS Configuration

The API is configured with CORS enabled for:
- `http://localhost:3000` (development)
- `http://localhost:*` (all localhost ports)

To modify CORS settings, edit the Flask configuration in `app.py`.

---

## Troubleshooting

### 500 Error on /api/analyze
- Check that resume and job description files are valid
- Ensure files are not corrupted
- Try with smaller files first

### Chatbot not responding appropriately
- Ensure OpenAI API key is valid
- Check your API rate limits
- Provide context for better responses

### CORS errors in browser console
- Ensure backend is running on port 5000
- Check that frontend is making requests to http://localhost:5000
- Verify CORS headers are being sent

---

## Version

API Version: 1.0.0
Last Updated: February 2024
