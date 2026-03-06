# Quick Reference Guide

## 🚀 Start the Application (30 seconds)

### Terminal 1: Backend
```bash
cd backend
.\venv\Scripts\Activate.ps1
python app.py
# Server runs on: http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# App runs on: http://localhost:3000
```

**Then open: http://localhost:3000 in your browser**

---

## 📋 Project File Reference

### Backend Files & What They Do

| File | Purpose |
|------|---------|
| `app.py` | Main Flask server with API endpoints |
| `analysis_service.py` | AI analysis logic using OpenAI |
| `utils.py` | File processing (PDF/TXT extraction) |
| `config.py` | Configuration and settings |
| `requirements.txt` | Python package dependencies |
| `.env` | API keys and secrets (CREATE THIS) |

### Frontend Files & What They Do

| File | Purpose |
|------|---------|
| `App.js` | Main React component & state |
| `components/FileUpload.js` | Resume/job upload interface |
| `components/AnalysisResults.js` | Results display with charts |
| `components/Chatbot.js` | AI chatbot interface |
| `api.js` | Functions to call backend APIs |
| `styles/*.css` | All styling for components |
| `package.json` | Node.js dependencies |

---

## 🔑 Key Concepts

### Backend Flow
```
User Upload Files → Flask receives files → Extract text → 
Send to OpenAI → Get analysis → Return JSON → Browser displays
```

### Frontend Flow
```
User selects files → Upload via Axios → Wait for response → 
Display results → User chats → Send message → Show response
```

---

## 🐛 Common Commands

### Python/Backend

```bash
# Create virtual environment
python -m venv venv

# Activate environment (Windows)
.\venv\Scripts\Activate.ps1

# Deactivate environment
deactivate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py

# Install a new package
pip install package-name

# Create requirements.txt
pip freeze > requirements.txt
```

### Node.js/Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install a new package
npm install package-name
```

---

## 🔧 Configuration Checklist

### Before Running

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] OpenAI API key obtained
- [ ] Created `/backend/.env` file
- [ ] Added API key to `.env`
- [ ] Installed Python dependencies
- [ ] Installed Node dependencies

### To Create .env file

```bash
cd backend
Copy-Item .env.example .env
# Edit .env in notepad and add your API key
```

---

## 📊 API Quick Reference

### Endpoints at a Glance

```
GET    /api/health                    ← Check if API is running
POST   /api/analyze                   ← Upload files for analysis
POST   /api/chat                      ← Send chat message
GET    /api/file-type-help           ← Get file format info
```

Example with JavaScript:
```javascript
// Analysis
const formData = new FormData();
formData.append('resume', resumeFile);
formData.append('job_description', jobFile);
const result = await fetch('/api/analyze', {method: 'POST', body: formData});

// Chat
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: "What is Docker?"})
});
```

---

## 📁 File Structure at a Glance

```
ResumeAINew/
├── backend/              ← Python Flask server
│   ├── app.py           (Main API)
│   ├── analysis_service.py
│   ├── utils.py
│   └── requirements.txt
├── frontend/            ← React web app
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── styles/
│   └── package.json
├── README.md            (Full documentation)
├── SETUP.md             (Quick start)
├── DEPLOYMENT.md        (Production guide)
└── API_DOCS.md          (API reference)
```

---

## 🎨 Color & Design

### Color Scheme
- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Darker Purple)
- **Success**: #27ae60 (Green) - Matching skills
- **Warning**: #e74c3c (Red) - Missing skills
- **Info**: #f39c12 (Orange) - Skills to learn
- **Background**: Gradient purple to pink

### Responsive Breakpoints
- Desktop: > 768px
- Tablet: 480px - 768px
- Mobile: < 480px

---

## 🆘 Troubleshooting Quick Fixes

### Python Error: Module not found
```bash
# Solution: Install requirements
pip install -r requirements.txt
```

### Node Error: Module not found
```bash
# Solution: Install dependencies
npm install
```

### Port 5000 already in use
```bash
# Run on different port
python app.py  # Change in config.py
```

### Port 3000 already in use
```bash
# Run on different port
npm run dev -- --port 3001
```

### OpenAI API Error
```
Check:
1. Is .env file created?
2. Is API key correct?
3. Do you have enough credits?
4. Is internet connected?
```

### Files not uploading
```
Check:
1. Is backend running on port 5000?
2. Are files PDF or TXT?
3. Are files under 16MB?
4. Check browser console for errors
```

---

## 📱 Test the App

### Using Sample Files
```bash
# Files are ready to use:
# - SAMPLE_RESUME.txt
# - SAMPLE_JOB_DESCRIPTION.txt

# Upload both files without editing
# Expected result: ~75% match with 4 missing skills
```

### Sample Chat Questions
```
"What is Docker?"
"How do I learn Kubernetes?"
"Explain microservices architecture"
"What's the difference between Docker and Kubernetes?"
```

---

## 📚 Documentation Map

```
Want to...                      → Read this file
├── Get started quickly         → SETUP.md
├── Understand the project      → README.md
├── Know about the API          → API_DOCS.md
├── Deploy to production        → DEPLOYMENT.md
├── Understand architecture     → PROJECT_SUMMARY.md
└── Quick reference             → This file (QUICK_REFERENCE.md)
```

---

## 🎯 Development Workflow

### Making Changes

1. **Backend Changes**
   ```bash
   # 1. Edit file in backend/
   # 2. Flask auto-reloads
   # 3. Test with Postman or curl
   # 4. Check terminal for errors
   ```

2. **Frontend Changes**
   ```bash
   # 1. Edit file in frontend/src/
   # 2. Browser auto-updates (hot reload)
   # 3. Check browser console
   # 4. Test functionality
   ```

3. **Testing**
   ```bash
   # Use the sample files provided
   # Watch browser console for errors
   # Monitor backend console for logs
   # Test different file types/sizes
   ```

---

## 🚀 Deployment Quick Steps

### For Heroku (Backend)
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set OPENAI_API_KEY=your_key
```

### For Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel
```

---

## 💡 Useful Terminal Commands

```bash
# Check Python version
python --version

# Check Node version
node --version

# Check npm version
npm --version

# View running processes (Windows)
Get-Process | grep python
Get-Process | grep node

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.8 | 3.10+ |
| Node.js | 16 | 18+ |
| RAM | 2GB | 4GB+ |
| Disk | 500MB | 2GB |

---

## 📞 Need Help?

1. **Check the docs** - Most questions answered in README.md
2. **Check the API docs** - API details in API_DOCS.md
3. **Check the setup guide** - SETUP.md for installation
4. **Monitor logs** - Check terminal/console for errors
5. **Test with samples** - Use SAMPLE_RESUME.txt and SAMPLE_JOB_DESCRIPTION.txt

---

## ✅ Checklist Before You Start

```
Setup Checklist:
☐ Python installed (python --version)
☐ Node.js installed (node --version)
☐ OpenAI API key obtained
☐ backend/.env file created
☐ API key added to .env
☐ pip install -r requirements.txt (in backend)
☐ npm install (in frontend)

Running Checklist:
☐ Backend running on port 5000
☐ Frontend running on port 3000
☐ Browser showing http://localhost:3000
☐ No errors in terminal/console
☐ Sample files ready for testing

Success Indicators:
✓ Can upload files without errors
✓ Analysis appears on screen
✓ Chatbot responds to messages
✓ Can view matching/missing skills
✓ Results display match percentage
```

---

## 🎓 Learning Resources

### For Understanding the Code
- **Backend**: Look at `app.py` to understand Flask routes
- **Frontend**: Look at `App.js` to understand React state
- **API**: Check `analysis_service.py` for OpenAI integration
- **Styling**: Check `styles/*.css` for modern CSS patterns

### Online Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [OpenAI Documentation](https://platform.openai.com/docs/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated**: February 2024
**Version**: 1.0.0

**Ready to use! 🎉**
