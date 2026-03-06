# Google OAuth Setup Guide

## Prerequisites

To enable Google OAuth authentication in this app, you need to:

1. **Create a Google Cloud Project**
2. **Get OAuth 2.0 Credentials**
3. **Add credentials to your environment**

---

## Step-by-Step Setup

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Project name: "Resume AI Analyzer" (or your choice)
4. Click **Create**

### **Step 2: Create OAuth 2.0 Credentials**

1. In Google Cloud Console, go to **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. If prompted, click **Configure Consent Screen** first
   - Choose **External** user type
   - Fill in App name: "Resume AI Analyzer"
   - Add your email
   - Click **Save and Continue**
4. Return to **Credentials** and click **Create Credentials** again
5. Select **OAuth Client ID**
6. Choose **Web application**
7. Add Authorized redirect URIs:
   - `http://localhost:3001`
   - `http://localhost:5000`
8. Click **Create**
9. Copy the **Client ID** (you'll need this)

### **Step 3: Configure Environment Variables**

#### **Frontend (.env or passed to GoogleOAuthProvider)**

The Client ID is public and goes in the frontend. Update `frontend/src/index.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles/index.css';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID from Step 2.

#### **Backend (.env file)**

Create or update `backend/.env`:

```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### **Step 5: Install Frontend Dependencies**

```bash
cd frontend
npm install
```

The `@react-oauth/google` package will be installed automatically.

### **Step 6: Start Your App**

1. **Backend:**
```bash
cd backend
python app.py
```

2. **Frontend:**
```bash
cd frontend
npm run dev
```

---

## Testing Google OAuth

1. Open your app in browser (http://localhost:3001)
2. Click **"Sign In / Sign Up"**
3. You should see **"Continue with Google"** button
4. Click it and complete Google's authentication flow
5. Your Google account will be linked to your app account

---

## Troubleshooting

### "Redirect URI mismatch" error
- Check that your redirect URIs in Google Cloud Console match your app URLs exactly
- Include both `http://localhost:3001` and `http://localhost:5000`

### Google button not showing
- Verify `GOOGLE_CLIENT_ID` is set in `frontend/src/index.jsx`
- Check browser console for errors
- Make sure `@react-oauth/google` package is installed

### Backend not accepting token
- Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
- Backend may need to verify the token using `google-auth-library`

---

## Security Notes

- **Client ID**: Safe to expose (used only on frontend)
- **Never commit** your actual credentials to version control
- Use environment variables for sensitive data
- In production, use proper secret management

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)
