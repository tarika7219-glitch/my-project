# 🎉 Free API Setup Guide

Your Resume AI Analyzer now uses **Groq API** - completely **FREE** with no payment required!

---

## ✅ Why Groq?

- ✨ **100% FREE** - No payment needed
- ⚡ **Super Fast** - Fastest inference API
- 🚀 **Generous Free Tier** - Plenty of free API calls monthly
- 🔒 **No Credit Card Required** - For free tier
- 📊 **Excellent Performance** - Modern Models

---

## 📋 Step-by-Step Setup

### Step 1: Get Your Free Groq API Key

1. **Go to:** https://console.groq.com/keys
2. **Sign Up** (if you don't have an account)
   - Email address
   - Password
   - Click "Sign Up"
3. **Verify Email** - Check your email and verify
4. **Generate API Key**
   - Click on "Create API Key"
   - Give it a name (e.g., "Resume Analyzer")
   - Copy the key (starts with `gsk_`)

### Step 2: Add API Key to Your Project

1. **Open the `.env` file** in the backend folder:
   ```
   c:\MSCIT SEM4\Project\ResumeAINew\backend\.env
   ```

2. **Replace with your Groq key:**
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here_xxxxx
   FLASK_ENV=development
   ```
   
   The key should look like: `gsk_xxxxxxxxxxxxxxxxxxxxxx`

3. **Save the file**

### Step 3: Install Updated Dependencies

In the `backend` folder, run:

```powershell
# Activate virtual environment (if not already active)
.\venv\Scripts\Activate.ps1

# Install new dependencies
pip install -r requirements.txt
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
# You should see: Running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# You should see: Local: http://localhost:3000
```

### Step 5: Test It!

1. Open http://localhost:3000
2. Upload a resume and job description
3. Click "Analyze Skills Match"
4. Should work instantly! ✨

---

## 🎁 FREE Groq API Tier Benefits

```
Free Tier Includes:
✅ Unlimited requests (rate limited to 30 requests/min)
✅ Access to Llama 3.1 70B (fast and powerful)
✅ Access to other models (Llama, Gemma)
✅ No credit card required
✅ Support included
```

---

## 💡 Working with Free API

### Rate Limits
- **30 requests per minute** (very generous for this app)
- Resets every minute
- Perfect for testing and learning

### Best Practices
1. Don't spam requests - wait between analyses
2. Each resume analysis is ~1-2 API calls
3. Each chatbot message is ~1 API call
4. You'll get warnings if approaching limits

### If You Hit Rate Limit
- Just wait 1 minute
- Limits reset automatically
- Try again after waiting

---

## 🔍 Verify Setup

After setup, test with these steps:

1. **Check API Key Works:**
   Open http://localhost:5000/api/health
   You should see: `{"status": "healthy"}`

2. **Test Full Analysis:**
   - Upload files
   - Click Analyze
   - Should see results in 5-10 seconds

3. **Test Chatbot:**
   - Ask a question
   - Should get instant response

---

## ⚠️ Troubleshooting

### Error: "invalid_request_error"
**Problem:** API key is incorrect or missing
**Solution:** 
- Check `.env` file exists
- Verify API key starts with `gsk_`
- No spaces before/after the key

### Error: "rate_limit_exceeded"
**Problem:** Exceeded 30 requests/minute
**Solution:** 
- Wait 1 minute
- Limit resets automatically
- Try again

### Error: "Connection refused"
**Problem:** Backend not running
**Solution:** 
- Make sure `python app.py` is running
- Check port 5000 is available

### Files Won't Upload
**Problem:** File validation
**Solution:** 
- Use PDF or TXT format
- File size < 16MB
- Try with sample files first

---

## 📚 More Information

### About Groq
- **Website:** https://groq.com
- **Console:** https://console.groq.com
- **Documentation:** https://console.groq.com/docs

### Free Models Available
- **Llama 3.1 70B** (current, recommended - more powerful)
- **Llama 3.1 8B** (faster, lighter)
- **Gemma 7B** (alternative option)
- All are fast and powerful

---

## 🎯 Quick Comparison

| Feature | Before (OpenAI) | Now (Groq) |
|---------|-----------------|-----------|
| Cost | Paid (~$0.002/request) | **FREE** |
| Setup | Credit card required | No card needed |
| Speed | Fast | **Super Fast** |
| API Key | Multiple steps | Simple signup |
| Rate Limits | Depends on plan | 30 req/min free |

---

## ✨ You're Ready!

Everything is now **completely FREE**:
- ✅ Installation free
- ✅ Usage free
- ✅ No hidden costs
- ✅ No credit card required
- ✅ Full functionality

---

## 💬 Questions?

### How much does it cost?
**Nothing!** Completely free, forever (with fair usage).

### Do I need a credit card?
**No!** Free tier requires no payment method.

### Will my API key work for other projects?
**Yes!** You can use the same key for any Groq API project.

### What if I need more than 30 requests/minute?
**Upgrade anytime** - But for this project, 30/min is plenty.

### Is my data safe?
**Yes!** Groq is a trusted AI company. Same as using OpenAI.

---

## 🚀 Next Steps

1. ✅ Copy your API key from https://console.groq.com/keys
2. ✅ Paste it in `backend/.env`
3. ✅ Run `pip install -r requirements.txt`
4. ✅ Start backend and frontend
5. ✅ Start analyzing resumes!

---

**You're all set with FREE AI! Enjoy! 🎉**

No payment. No credit card. No limits. Just pure AI power. ⚡
