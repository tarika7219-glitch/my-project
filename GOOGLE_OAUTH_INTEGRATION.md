# Google OAuth Integration Guide

This guide explains how to set up and use Google OAuth authentication in the ResumeAI application.

## Overview

The application now supports authentication through:
1. **Email/Password Authentication** - Local account creation and login
2. **Google OAuth** - Sign up/login using Google account
3. **Progress Persistence** - Interview history saved to database (logged-in users) or localStorage (guests)

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Auth.jsx │  ◄── GoogleLogin component from @react-oauth/google
    └────┬────┘
         │ (Send Google ID Token)
         │
┌────────▼────────────┐
│  /api/auth/google   │
│  (Flask Backend)    │
└────────┬────────────┘
         │ (Verify token with Google API)
         │
    ┌────▼──────┐
    │  Google   │
    │   OAuth   │
    └───────────┘
```

## Step-by-Step Setup

### Step 1: Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Create OAuth Credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000`
     - For production: Your actual domain
   - Copy your **Client ID**

### Step 2: Frontend Configuration

1. **Install Dependencies** (if not already installed):
   ```bash
   cd frontend
   npm install @react-oauth/google
   ```

2. **Create `.env` file** in the `frontend` directory:
   ```bash
   cp .env.example .env
   ```

3. **Edit `frontend/.env`**:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_from_step_1
   ```

   Replace `your_client_id_from_step_1` with your actual Google Client ID.

4. **Verify `frontend/src/index.jsx`** includes:
   ```jsx
   import { GoogleOAuthProvider } from '@react-oauth/google';
   
   const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
   
   <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
     <App />
   </GoogleOAuthProvider>
   ```

### Step 3: Backend Configuration

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create `.env` file** in the `backend` directory:
   ```bash
   cp .env.example .env
   ```

3. **Edit `backend/.env`**:
   ```env
   GROQ_API_KEY=your_groq_api_key
   FLASK_ENV=development
   GOOGLE_CLIENT_ID=your_client_id_from_step_1
   ```

### Step 4: Run the Application

**Terminal 1 - Start Backend**:
```bash
cd backend
python app.py
```

Backend will run on: `http://localhost:5000`

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173` (or similar)

### Step 5: Test Google OAuth

1. Open the frontend in your browser
2. Click the "Login" button in the header
3. Click "Continue with Google" button
4. Sign in with your Google account
5. You should be authenticated and see your username in the header

## File Changes Summary

### New Files
- `frontend/.env.example` - Frontend environment variables template
- `backend/.env.example` - Updated with GOOGLE_CLIENT_ID
- `frontend/src/components/Auth.jsx` - Authentication component with GoogleLogin
- `frontend/src/styles/Auth.css` - Authentication UI styling
- `backend/models.py` - User and InterviewSession database models
- `backend/auth_service.py` - Authentication utilities (JWT, passwords, decorators)

### Modified Files
- `frontend/src/index.jsx` - Added GoogleOAuthProvider wrapper
- `frontend/src/App.jsx` - Added user state management and auth modal
- `frontend/package.json` - Added @react-oauth/google
- `backend/app.py` - Added authentication routes and Google OAuth handling
- `backend/requirements.txt` - Added google-auth, PyJWT, bcrypt, SQLAlchemy
- `backend/models.py` - User and InterviewSession models with SQLAlchemy ORM

### New API Routes

#### Authentication Routes
- `POST /api/auth/signup` - Create new account with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Authenticate with Google ID token
- `GET /api/auth/user` - Get current user info (requires JWT token)
- `POST /api/auth/logout` - Logout (clears client-side token)

#### Interview Progress Routes
- `POST /api/interview/save-session` - Save interview session data
- `GET /api/interview/history` - Get user's interview history (requires JWT token)

## Token-Based Authentication

The application uses JWT (JSON Web Tokens) for secure API requests:

1. **User logs in** → Backend returns JWT token
2. **Token is stored** in `localStorage` (key: `auth_token`)
3. **API requests** include token in Authorization header:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
4. **Backend validates** token using `@token_required` decorator
5. **Token expires** after 24 hours (configurable)

## Fallback for Missing Google Client ID

If Google OAuth is not configured, the application will:
- Show a "Continue with Google" button
- Display a hint: "Google Sign-in not working? See setup guide"
- Allow normal email/password login to work

## Troubleshooting

### Error: "The `clientId` should be a valid google clientId"
**Solution**: Make sure your Google Client ID is correctly set in:
- `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`
- Google Cloud Console credentials settings

### Error: "Google OAuth requires Google API key in .env"
**Solution**: Follow Step 1 and Step 3 to set up your Google credentials

### Error: "Unauthorized" or "Invalid token" on API calls
**Solution**:
- Check if token is properly stored in `localStorage`
- Check if backend is running and has same `GOOGLE_CLIENT_ID` in `.env`
- Try logging out and logging back in

### Error: "CORS error" when calling backend
**Solution**:
- Make sure backend is running on `http://localhost:5000`
- Check that Flask-CORS is enabled (it is by default)
- Verify your API endpoint URLs in frontend code

## Security Notes

⚠️ **Important Security Practices**:

1. **Never commit `.env` files** - They contain secrets
   - `.env` files are already in `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Token Verification**:
   - Backend verifies Google ID tokens using Google's API
   - Password hashing uses bcrypt (industry standard)
   - JWT tokens are signed with a secret key

3. **HTTPS in Production**:
   - Always use HTTPS for production deployments
   - Set secure cookie flags in production
   - Update Google OAuth redirect URIs for production domain

4. **Rate Limiting**:
   - Consider implementing rate limiting for auth endpoints
   - Protect against brute force attacks

## Production Deployment

For production deployment:

1. **Generate a strong secret key**:
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

2. **Update environment variables**:
   ```env
   FLASK_ENV=production
   SECRET_KEY=your_generated_secret_key
   GOOGLE_CLIENT_ID=your_production_google_client_id
   ```

3. **Update Google OAuth settings**:
   - Add your production domain to authorized redirect URIs
   - Use production Google Client ID

4. **Database setup**:
   - Consider using PostgreSQL instead of SQLite
   - Set up proper database backups

5. **Frontend build**:
   ```bash
   npm run build
   # Serve the dist folder with your production server
   ```

## API Response Examples

### Sign Up Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "google_picture": null,
    "created_at": "2024-01-20T10:30:00"
  }
}
```

### Google Auth Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "user@gmail.com",
    "username": "John Doe",
    "google_picture": "https://...",
    "created_at": "2024-01-20T10:35:00"
  }
}
```

### Save Interview Session Response
```json
{
  "success": true,
  "session_id": 1,
  "message": "Interview session saved successfully"
}
```

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google npm package](https://www.npmjs.com/package/@react-oauth/google)
- [JWT Introduction](https://jwt.io/introduction)
- [Flask-SQLAlchemy Documentation](https://flask-sqlalchemy.palletsprojects.com/)

## Support

If you encounter any issues:

1. Check that all environment variables are correctly set
2. Ensure both frontend and backend servers are running
3. Check browser console for frontend errors
4. Check terminal output for backend errors
5. Verify Google Cloud Console settings for OAuth credentials

For more information, see:
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Detailed setup with screenshots
- [API_DOCS.md](API_DOCS.md) - Complete API documentation
- [README.md](README.md) - Project overview
