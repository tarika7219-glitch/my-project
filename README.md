# Resume AI Analyzer

A comprehensive AI-powered application that analyzes resumes against job descriptions, identifies skill gaps, and provides an interactive chatbot for learning and clarification.

## Features

✨ **Resume-Job Match Analysis**
- Upload resume and job description (PDF or TXT)
- AI-powered skill matching analysis
- Match percentage calculation
- Visual skill comparison

📊 **Skill Analysis**
- Matching skills identification
- Missing skills detection
- Prioritized learning path for missing skills
- Detailed analysis summary

💬 **AI Chatbot**
- Ask questions about skills and concepts
- Get explanations for technical terms
- Personalized learning assistance
- Context-aware responses

## Project Structure

```
ResumeAINew/
├── backend/                    # Flask Python backend
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── analysis_service.py    # AI analysis logic
│   ├── utils.py               # File processing utilities
│   ├── requirements.txt        # Python dependencies
│   └── .env.example           # Environment variables template
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── FileUpload.js
│   │   │   ├── AnalysisResults.js
│   │   │   └── Chatbot.js
│   │   ├── styles/            # CSS styles
│   │   ├── api.js             # API utility functions
│   │   └── App.js             # Main app component
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .gitignore
└── README.md                  # This file
```

## Technology Stack

**Backend:**
- Flask - Web framework
- OpenAI API - AI analysis and chatbot
- PyPDF2 - PDF text extraction
- Python-dotenv - Environment management

**Frontend:**
- React 18 - UI framework
- Vite - Build tool
- Axios - HTTP client
- React Icons - Icon library

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

5. **Run Flask server:**
   ```bash
   python app.py
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:3000`

## Usage

1. **Start the backend server** (if not already running)
   - Make sure Flask is running on port 5000
   - Ensure your OpenAI API key is configured

2. **Start the frontend development server**
   - Navigate to http://localhost:3000

3. **Upload Files:**
   - Upload your resume (PDF or TXT)
   - Upload job description (PDF or TXT)
   - Click "Analyze Skills Match"

4. **View Results:**
   - See your match percentage
   - Review matching skills
   - Identify missing skills
   - Check prioritized learning path

5. **Use Chatbot:**
   - Ask questions about any skill or concept
   - Get AI-powered explanations
   - Request learning recommendations

## API Endpoints

### `/api/analyze` (POST)
Analyzes resume against job description

**Request:**
- `resume` (file) - Resume file (PDF/TXT)
- `job_description` (file) - Job description file (PDF/TXT)

**Response:**
```json
{
  "success": true,
  "analysis": {
    "matching_skills": [...],
    "missing_skills": [...],
    "skills_to_learn": [...],
    "match_percentage": 75,
    "summary": "..."
  }
}
```

### `/api/chat` (POST)
Chatbot conversation endpoint

**Request:**
```json
{
  "message": "What is Docker?",
  "context": "..."
}
```

**Response:**
```json
{
  "success": true,
  "response": "Docker is a containerization platform..."
}
```

### `/api/health` (GET)
Health check endpoint

## Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_api_key_here
FLASK_ENV=development
```

## File Format Guidelines

### Supported Formats
- PDF (.pdf)
- Text files (.txt)
- Maximum size: 16MB

### Resume Format Tips
- Include all technical skills
- List technologies and tools used
- Mention certifications and courses
- Include relevant experience

### Job Description Format Tips
- Include all required skills
- List desired qualifications
- Mention specific technologies
- Include experience level

## Error Handling

The application handles various error scenarios:
- Invalid file formats
- File size exceeding limits
- API connection issues
- Missing required fields

## Performance Considerations

- Large files are processed efficiently
- API calls are rate-limited appropriately
- Frontend optimizations for smooth UI
- Backend caching for repeated analyses (can be added)

## Future Enhancements

- [ ] User authentication and history
- [ ] Resumé improvement suggestions
- [ ] Learning resource recommendations
- [ ] Skill proficiency tracking
- [ ] Interview preparation mode
- [ ] Batch resume analysis
- [ ] Export analysis as PDF

## Troubleshooting

### Backend Issues
```bash
# If Flask won't start
python -m flask run

# If OpenAI API errors occur
# Check your API key in .env
# Ensure you have sufficient credits
```

### Frontend Issues
```bash
# If modules not found
npm install

# If port 3000 is in use
npm run dev -- --port 3001
```

### API Connection Issues
- Ensure backend is running on port 5000
- Check CORS settings in Flask
- Verify API URLs in frontend config

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs for error details

## Created By

Resume AI Analyzer - 2024

---

**Note:** This application requires a valid OpenAI API key to function. Some features may incur API usage costs.
