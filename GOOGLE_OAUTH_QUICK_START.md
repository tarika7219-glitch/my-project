# Google OAuth Setup - Quick Start Guide

Complete these steps to enable Google OAuth login in your ResumeAI application.

## Pre-requisites
- Node.js and npm installed
- Python 3.8+ installed with pip
- A Google account

## Quick Setup (5 minutes)

### Step 1: Get Google Client ID (3 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project (if you don't have one):
   - Click "Select a Project" → "New Project"
   - Enter project name (e.g., "ResumeAI")
   - Click "Create"
3. Create OAuth Credentials:
   - Go to "Credentials" (left sidebar)
   - Click "Create Credentials" → "OAuth Client ID"
   - If prompted, configure OAuth consent screen first:
     - Choose "External" user type
     - Click "Create"
     - Fill in app name: "ResumeAI"
     - Add your email and click "Save and Continue"
     - For scopes, just click "Save and Continue"
     - Click "Save and Continue" again on the summary
   - Back on credentials page:
     - Select "Web application"
     - Add authorized redirect URIs:
       - `http://localhost:3000`
       - `http://localhost:5173`
       - `http://localhost:5000`
   - Click "Create"
   - **COPY YOUR CLIENT ID** (you'll need this)

### Step 2: Configure Frontend (1 minute)

1. Open `frontend/.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here
   ```
   Replace `paste_your_client_id_here` with your actual Client ID from Step 1

2. Ensure npm dependencies are installed:
   ```bash
   cd frontend
   npm install
   ```

### Step 3: Configure Backend (1 minute)

1. Open `backend/.env`:
   ```bash
   GROQ_API_KEY=your_groq_api_key
   FLASK_ENV=development
   GOOGLE_CLIENT_ID=paste_your_client_id_here
   ```
   Replace `paste_your_client_id_here` with your actual Client ID

2. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## Running the Application

### Terminal 1: Start Backend
```bash
cd c:\MSCIT SEM4\Project\ResumeAINew\backend
python app.py
```

You should see: "Running on http://127.0.0.1:5000"

### Terminal 2: Start Frontend
```bash
cd c:\MSCIT SEM4\Project\ResumeAINew\frontend
npm run dev
```

You should see: "Local: http://localhost:5173"

## Testing Google OAuth

1. Open http://localhost:5173 in your browser
2. Click the "Login" button (top right)
3. Click "Continue with Google" button
4. Sign in with your Google account
5. You should see your name in the top right (logged in)

## Features Unlocked

Once Google OAuth is working:

✅ **Login with Google** - Click "Continue with Google" to sign in
✅ **Local Login** - Email/password login still works
✅ **Save Progress** - Interview history is saved to database
✅ **User Profile** - Click your name to see logout option
✅ **Progress Tracking** - See all past interviews and statistics

## Troubleshooting

### Issue: Button shows "Continue with Google" but doesn't work

**Check 1**: Did you paste the Client ID in `frontend/.env`?
```bash
# Open frontend/.env and verify:
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE  # Should NOT say "paste_your_client_id_here"
```

**Check 2**: Is the frontend dev server restarted after changing `.env`?
```bash
# If you changed .env, stop and restart:
npm run dev
```

**Check 3**: Did you click "Create" on OAuth consent screen setup?
- If you get a blank screen after clicking "Create Credentials", you need to set up OAuth consent screen first
- Go to "OAuth consent screen" tab and click "Create"

### Issue: Backend shows CORS error

**Check**: Is backend running?
```bash
# Terminal 1: Start backend
python app.py  # Should show "Running on http://127.0.0.1:5000"
```

### Issue: "Invalid Client ID" error

**Check**: Did you paste the correct Client ID in both files?
```bash
# These should match each other:
frontend/.env:        VITE_GOOGLE_CLIENT_ID=xyz123
backend/.env:         GOOGLE_CLIENT_ID=xyz123
Google Cloud Console: Client ID field = xyz123
```

## Common Mistakes

❌ **Mistake 1**: Using localhost:3000 when app runs on localhost:5173
- Add http://localhost:5173 to authorized redirect URIs in Google Cloud Console

❌ **Mistake 2**: Not restarting frontend after changing .env
- Stop `npm run dev` and run it again

❌ **Mistake 3**: Installing @react-oauth/google but not Google Client ID
- Frontend already has @react-oauth/google installed
- Just need to set GOOGLE_CLIENT_ID in .env

❌ **Mistake 4**: Trying to enable Google+ API (it's deprecated)
- You don't need to enable any API anymore
- Just create OAuth 2.0 Client ID directly in Credentials

## Files Modified/Created

**New Files**:
- `frontend/.env.example` - Template for frontend config
- `backend/.env.example` - Template for backend config  
- `backend/models.py` - Database models
- `backend/auth_service.py` - Authentication utilities
- `frontend/src/components/Auth.jsx` - Login/signup component
- `GOOGLE_OAUTH_INTEGRATION.md` - Comprehensive guide (you're reading related info)

**Modified Files**:
- `frontend/src/index.jsx` - Added GoogleOAuthProvider
- `frontend/src/App.jsx` - Added user authentication state
- `frontend/package.json` - Added @react-oauth/google package
- `backend/app.py` - Added auth routes
- `backend/requirements.txt` - Added google-auth, PyJWT, bcrypt, SQLAlchemy

## Next Steps

1. ✅ Get Google Client ID (3 minutes)
2. ✅ Set VITE_GOOGLE_CLIENT_ID in frontend/.env (30 seconds)
3. ✅ Set GOOGLE_CLIENT_ID in backend/.env (30 seconds)
4. ✅ Run backend: `python app.py`
5. ✅ Run frontend: `npm run dev`
6. ✅ Test by signing in with Google

## Need More Help?

- Full technical details: See `GOOGLE_OAUTH_INTEGRATION.md`
- API documentation: See `API_DOCS.md`
- Backend setup: See `FREE_SETUP_SUMMARY.txt`
- Deployment: See `DEPLOYMENT.md`

---

**That's it!** You now have Google OAuth authentication working in your ResumeAI app! 🎉
