# Setup Guide for Resume AI Analyzer

## Quick Start (Windows)

### Step 1: Backend Setup

1. Open PowerShell and navigate to the backend folder:
   ```powershell
   cd c:\MSCIT SEM4\Project\ResumeAINew\backend
   ```

2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   (If you get an error, you may need to run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)

4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Copy the environment example file:
   ```powershell
   Copy-Item .env.example .env
   ```

6. Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

7. Run the Flask server:
   ```powershell
   python app.py
   ```
   You should see: `Running on http://localhost:5000`

### Step 2: Frontend Setup (New PowerShell Terminal)

1. Open a new PowerShell terminal

2. Navigate to the frontend folder:
   ```powershell
   cd c:\MSCIT SEM4\Project\ResumeAINew\frontend
   ```

3. Install dependencies:
   ```powershell
   npm install
   ```

4. Start the development server:
   ```powershell
   npm run dev
   ```
   You should see: `Local: http://localhost:3000`

### Step 3: Use the Application

1. Open your browser and go to: `http://localhost:3000`

2. Upload your resume and job description

3. Click "Analyze Skills Match"

4. Review the results and chat with the AI assistant

## Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file
5. Never share your API key publicly

## Troubleshooting

### Python not found
- Make sure Python 3.8+ is installed
- Add Python to your PATH environment variable

### npm not found
- Make sure Node.js is installed
- Restart PowerShell after installation

### Port already in use
- Backend: `python app.py --port 5001`
- Frontend: `npm run dev -- --port 3001`

### OpenAI API Error
- Check your API key is correct in `.env`
- Ensure you have sufficient API credits
- Check your internet connection

## Project Features

✅ Resume-Job Description Analysis
✅ Skill Matching with AI
✅ Missing Skills Identification
✅ Prioritized Learning Path
✅ Interactive AI Chatbot
✅ Beautiful Modern UI
✅ PDF and TXT Support

## Support Files

- `app.py` - Main Flask application
- `analysis_service.py` - AI analysis logic
- `config.py` - Configuration
- `utils.py` - File utilities
- `App.js` - Main React component
- `FileUpload.js` - File upload component
- `AnalysisResults.js` - Results display
- `Chatbot.js` - Chat interface

---

**Everything is set up! Start the backend and frontend, then open http://localhost:3000**
