# Google OAuth Setup Verification Checklist

Complete this checklist to verify your Google OAuth setup is working correctly.

## Pre-Setup (Before You Start)

- [ ] Have Google account for testing
- [ ] Have Node.js 14+ installed (`node --version`)
- [ ] Have Python 3.8+ installed (`python --version`)
- [ ] Can access Google Cloud Console
- [ ] Have the project folder open in VS Code

## Step 1: Get Google Client ID ✓

- [ ] Navigate to https://console.cloud.google.com/
- [ ] Create a new project or select existing
- [ ] Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
- [ ] Set up OAuth Consent Screen (if prompted)
  - [ ] Enter application name
  - [ ] Add your email
  - [ ] Skip adding scopes
  - [ ] Add test users (optional)
- [ ] Select "Web application" as application type
- [ ] Add Authorized Redirect URIs:
  - [ ] `http://localhost:5173`
  - [ ] `http://localhost:5000`
  - [ ] `http://localhost:3000` (backup)
- [ ] Click "Create"
- [ ] **Copy your Client ID** (looks like: `xyz123...googleusercontent.com`)

## Step 2: Frontend Configuration ✓

- [ ] File `frontend/.env` exists
- [ ] File contains: `VITE_GOOGLE_CLIENT_ID=your_client_id`
- [ ] Your actual Client ID is pasted (not placeholder text)
- [ ] File `frontend/src/index.jsx` has:
  - [ ] `import { GoogleOAuthProvider } from '@react-oauth/google'`
  - [ ] GoogleOAuthProvider wrapper around App component
- [ ] File `frontend/package.json` includes:
  - [ ] `"@react-oauth/google"` in dependencies
- [ ] File `frontend/src/components/Auth.jsx` has:
  - [ ] `import { GoogleLogin } from '@react-oauth/google'`
  - [ ] GoogleLogin component with onSuccess handler
- [ ] Dependencies installed:
  ```bash
  cd frontend
  npm list @react-oauth/google
  # Should show: @react-oauth/google@X.X.X
  ```

## Step 3: Backend Configuration ✓

- [ ] File `backend/.env` exists
- [ ] File contains: `GOOGLE_CLIENT_ID=your_client_id`
- [ ] Your actual Client ID is pasted (same as frontend)
- [ ] File `backend/requirements.txt` includes:
  - [ ] `google-auth==2.26.2`
  - [ ] `PyJWT==2.8.1`
  - [ ] `bcrypt==4.1.2`
  - [ ] `Flask-SQLAlchemy==3.0.5`
- [ ] File `backend/app.py` has:
  - [ ] `/api/auth/google` route
  - [ ] Google token verification code
- [ ] Dependencies installed:
  ```bash
  cd backend
  pip list | grep google-auth
  # Should show: google-auth 2.26.2
  ```

## Step 4: Start Backend ✓

In a terminal, run:
```bash
cd backend
python app.py
```

- [ ] Server starts without errors
- [ ] Output shows: "Running on http://127.0.0.1:5000"
- [ ] Database initializes (creates `resumeai.db`)
- [ ] No error messages about GOOGLE_CLIENT_ID

## Step 5: Start Frontend ✓

In a **new** terminal, run:
```bash
cd frontend
npm run dev
```

- [ ] Server starts without errors
- [ ] Output shows: "Local: http://localhost:5173"
- [ ] No error about missing VITE_GOOGLE_CLIENT_ID
- [ ] No CORS errors in console

## Step 6: Test in Browser ✓

1. Open http://localhost:5173 in Chrome/Firefox/Edge
2. Click the "Login" button (top right corner)
   - [ ] Login modal appears with sign-up and login tabs
3. Click "Continue with Google" button
   - [ ] Google button appears (not blank, not showing alert)
4. Click the Google button
   - [ ] Google sign-in popup opens
5. Sign in with your Google account
   - [ ] You see your email/profile in popup
6. After sign in
   - [ ] Modal closes
   - [ ] Your name appears in top right (instead of Login button)
   - [ ] No error messages in console

## Step 7: Test Features ✓

### Test 1: User Profile Menu
- [ ] Click your name in top right
- [ ] Dropdown menu appears with:
  - [ ] Your email shown
  - [ ] "Logout" button visible

### Test 2: Logout
- [ ] Click "Logout"
- [ ] You're logged out (name disappears)
- [ ] Login button reappears

### Test 3: Interview Progress
- [ ] Click "Practice Interview" from home page
- [ ] Complete an interview
- [ ] At end, you see "Save to Profile" option
- [ ] Your progress shows name (indicating it's saved to database)

### Test 4: Email/Password Login
- [ ] Click "Login" button
- [ ] Click "Sign Up" tab
- [ ] Enter email, password, and username
- [ ] Click "Sign Up"
  - [ ] Account created
  - [ ] You're logged in
- [ ] Logout and login again
  - [ ] Login works with same credentials

## Step 8: Check Browser Storage ✓

Open Developer Tools (F12) → Application/Storage:
- [ ] `localStorage` contains:
  - [ ] `auth_token` (JWT token)
  - [ ] `user_info` (user details as JSON)
- [ ] Token starts with `eyJ...` (JWT format)

## Step 9: Check Backend Database ✓

In backend folder, check if `resumeai.db` exists:
```bash
ls -la | grep resumeai.db  # Linux/Mac
dir | findstr resumeai.db  # Windows
```

- [ ] `resumeai.db` file exists
- [ ] File size > 0 KB (not empty)

## Troubleshooting Checklist

### If Google button doesn't appear:
- [ ] Check browser console (F12) for errors
- [ ] Verify @react-oauth/google is installed: `npm list @react-oauth/google`
- [ ] Check index.jsx has GoogleOAuthProvider wrapper
- [ ] Restart frontend dev server after changing .env

### If Google sign-in fails:
- [ ] Check that Client ID is the same in both .env files
- [ ] Check that http://localhost:5173 is in authorized URIs
- [ ] Check backend console for token verification errors
- [ ] Verify google-auth is installed: `pip list | grep google-auth`

### If CORS error appears:
- [ ] Check backend is running: `http://localhost:5000`
- [ ] Check API endpoint URLs in Auth.jsx match backend port
- [ ] Check that Flask-CORS is enabled (it is by default)

### If "Invalid Google token" error:
- [ ] This is normal if google-auth can't verify (dev mode)
- [ ] Backend will fallback to decoding token payload
- [ ] Check backend console for exact error message

### If cannot find .env file:
- [ ] Check file exists: `frontend/.env` and `backend/.env`
- [ ] Check filename is exactly `.env` (note the dot)
- [ ] Don't use `.env.example`—create new `.env` file
- [ ] On Windows, use: `echo "VAR=value" > .env`

### If npm install fails:
```bash
cd frontend
rm -rf node_modules package-lock.json  # Clear cache
npm install   # Reinstall
```

### If pip install fails:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

## Success Indicators ✓

When everything is working, you should see:

1. ✅ Login button visible in header
2. ✅ "Continue with Google" button appears in modal
3. ✅ Can sign in with Google account
4. ✅ Name appears in header after login
5. ✅ Can complete interviews and see saved progress
6. ✅ Can logout and login again
7. ✅ `localStorage` contains auth_token
8. ✅ `resumeai.db` file created in backend folder
9. ✅ No errors in browser console
10. ✅ No errors in terminal output

## Quick Debug Commands

```bash
# Check if backend is running
curl http://localhost:5000/

# Check if frontend is running
curl http://localhost:5173/

# Test Google token verification (if you have a token)
# Copy token from localStorage and test with backend

# Check Python version
python --version

# Check Node version
node --version

# List installed pip packages
pip list | grep -E "google-auth|PyJWT|bcrypt"

# List installed npm packages
npm list @react-oauth/google
```

## Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Cannot find module '@react-oauth/google'" | `npm install @react-oauth/google` |
| "GOOGLE_CLIENT_ID is not set" | Add to `backend/.env` |
| "VITE_GOOGLE_CLIENT_ID is not set" | Add to `frontend/.env` |
| "The clientId should be a valid google clientId" | Paste actual Client ID, not placeholder |
| "CORS error" | Check backend is running on port 5000 |
| "Invalid OAuth Client ID" | Verify Client ID in both .env files match exactly |
| "Connection refused" | Backend not running; start with `python app.py` |

## Completed Checklist Sign-Off

When you've completed all items above:

- [ ] All steps 1-9 completed without errors
- [ ] All success indicators present
- [ ] Can sign in with Google
- [ ] Can use email/password
- [ ] Interview progress saves
- [ ] User profile visible
- [ ] No errors in console or terminal

**Congratulations! 🎉 Google OAuth is fully set up and working!**

---

**Next Steps:**
1. Read the [Quick Start Guide](GOOGLE_OAUTH_QUICK_START.md)
2. Read [Full Documentation](GOOGLE_OAUTH_INTEGRATION.md)
3. [Deploy to Production](DEPLOYMENT.md)
4. Customize the app further

---

**Need Help?**
- Check the setup guides
- Review error messages in console
- Check terminal output for detailed errors
- All configuration files have `.example` versions showing expected format
