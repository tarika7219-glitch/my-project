# Gamification System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Migrate Database
```bash
cd backend
python migrate_db.py
```
This adds the gamification fields to your database.

### Step 2: Verify Installation
```bash
python verify_models.py
```
Should show all ✅ green checkmarks.

### Step 3: Start Backend
```bash
python app.py
```
Should start on `http://localhost:5000`

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend
npm install  # if not already done
npm run dev
```
Should start on `http://localhost:5173`

### Step 5: Test It
1. Open `http://localhost:5173`
2. Sign up or login
3. Go to "Interactive Interview Practice"
4. Complete an interview
5. Check the "Gamification Stats" section above the upload area
6. Your stats should be visible!

---

## 📊 What You'll See

### Gamification Stats Section (Main Dashboard)
```
┌─────────────────────────────────────┐
│  🔥 2 Day Streak                    │
├─────────────────────────────────────┤
│  Confidence Level: [████████░]  8/10│
├─────────────────────────────────────┤
│  📊 Interviews: 5  Avg Score: 8.5   │
├─────────────────────────────────────┤
│  🏅 Badges Earned (3)               │
│  [Getting Started] [Practice Master] │
│  [Perfect Performance]               │
├─────────────────────────────────────┤
│  [View Leaderboard]                 │
└─────────────────────────────────────┘
```

### Leaderboard Modal
```
Your Position: 3rd out of 10 users (Top 30%)

Rank │ Username     │ Interviews │ Score │ Level │ 🔥 Streak │ 🏅
══════╪══════════════╪════════════╪═══════╪═══════╪═══════════╪════
  🥇 │ ProUser      │    25      │  9.2  │  10   │    30     │  8
  🥈 │ NoobMaster   │    22      │  8.9  │   9   │    21     │  7
  🥉 │ You (User)   │    15      │  8.5  │   8   │    14     │  5
───────┼──────────────┼────────────┼───────┼───────┼───────────┼────
  4   │ PracticeKing │    12      │  8.2  │   7   │    10     │  4
```

---

## 🎯 10 Available Badges

| Badge | Unlock Requirement | Notes |
|-------|-------------------|-------|
| 🎓 Getting Started | Complete 1st interview | Automatic |
| 🎯 Practice Master | Complete 5 interviews | - |
| 💪 Dedication | Complete 10 interviews | - |
| 👑 Interview Champion | Complete 20 interviews | - |
| ⭐ Perfect Performance | Score 10/10 on interview | Any single session |
| 🔥 Week Warrior | 7-day interview streak | Consecutive days |
| 🚀 Unstoppable | 30-day interview streak | Really hard! |
| 🗣️ Confident Speaker | Reach confidence level 7 | Based on ratings |
| 💎 Interview Expert | Reach confidence level 10 | Master level |
| 📈 Consistent Performer | Maintain 8.0+ average score | - |

---

## 🔗 Key Files Modified/Created

### New Files (Don't delete these!)
- `backend/gamification_service.py` - Core gamification logic
- `backend/migrate_db.py` - Database migration
- `backend/verify_models.py` - Verification script
- `frontend/src/components/GamificationStats.jsx` - Stats display
- `frontend/src/components/Leaderboard.jsx` - Leaderboard modal
- `frontend/src/styles/GamificationStats.css` - Stats styling
- `frontend/src/styles/Leaderboard.css` - Leaderboard styling

### Modified Files
- `backend/models.py` - Added gamification fields to User and InterviewSession
- `backend/app.py` - Added 4 new API endpoints, enhanced save-session
- `frontend/src/App.jsx` - Integrated gamification components
- `backend/requirements.txt` - Updated PyJWT version

---

## 📡 API Endpoints Reference

### Get User Stats
```
GET /api/gamification/stats
Returns: User's streak, interviews, confidence, badges, avg_score
```

### Get Leaderboard
```
GET /api/gamification/leaderboard?limit=10
Returns: Top 10-100 ranked users
```

### Get User's Rank
```
GET /api/gamification/user-rank
Returns: User's rank, percentile, detailed stats
```

### Get All Badges
```
GET /api/gamification/badges
Returns: All available badge definitions
```

---

## 🎮 How the Streak Works

1. **User completes first interview** → streak becomes 1
2. **User completes interview next day** → streak becomes 2
3. **User misses a day** → streak resets to 0
4. **Grace period** → If user comes back within 24 hours, streak continues
5. **Maximum** → No limit (30-day badge at 30+ days)

---

## 💡 How Confidence Level Works

Confidence is calculated from your interview ratings:

```
Rating Average  →  Confidence Level
5.0            →  1 (Beginner)
5.5-6.0        →  2
6.0-6.5        →  3
7.0-7.5        →  4
7.5-8.0        →  5 (Intermediate)
8.0-8.5        →  6
8.5-9.0        →  7
9.0-9.5        →  8
9.5-10.0       →  9-10 (Expert)
10.0           →  10 (Master)
```

**Note**: Confidence is NOT calculated per session, but continuously based on overall average of all interviews.

---

## 📱 Mobile Experience

✅ **Fully responsive design**
- Gamification Stats cards stack on mobile
- Leaderboard scrolls horizontally 
- Badges display in grid
- All text readable on 375px+ screens

---

## 🔒 Security Features

- ✅ All endpoints require JWT authentication
- ✅ Users can only see own detailed stats
- ✅ Badge unlocking is server-side (no cheating)
- ✅ Leaderboard data verified server-side
- ✅ Streak calculations verified with database

---

## 🆘 Troubleshooting

### Gamification Stats Don't Show
1. Check browser console (F12) for errors
2. Verify user is logged in (check localStorage token)
3. Check backend logs for API errors
4. Verify backend is running on port 5000

### Leaderboard Shows Wrong Data
1. Check that multiple users have completed interviews
2. Verify database has been migrated properly
3. Run: `python migrate_db.py` again
4. Restart backend server

### Badges Not Unlocking
1. Check backend logs for gamification_service errors
2. Verify conditions are met (e.g., 5 interviews for Practice Master)
3. Check the `badges` field in database is valid JSON
4. Restart backend and try again

### Database Migration Failed
1. Backup your `resumeai.db` file
2. Delete `instance/resumeai.db`
3. Restart backend (it will create fresh DB)
4. Run migration again: `python migrate_db.py`
5. Manually add users if needed

---

## 📊 Database Schema Summary

### Users Table (Enhanced)
```sql
interviews_streak INTEGER      -- Days in a row
last_interview_date DATETIME   -- Track streak date
total_interviews INTEGER       -- Lifetime count
total_score FLOAT              -- Sum for leaderboard
confidence_level INTEGER 1-10  -- Current level
badges JSON                    -- Earned badges array
```

### Interview_sessions Table (Enhanced)
```sql
confidence_level INTEGER 1-10  -- Per-session level
```

---

## 🎯 Common Workflows

### Workflow: User Completes Interview → See Badge
```
1. User completes interview → API POST save-session
2. Backend calculates confidence, updates stats
3. Backend checks badge conditions
4. If eligible, badge added to badges array
5. Response includes new_badges list
6. Frontend receives response
7. GamificationStats component re-fetches stats
8. Component displays new badge
9. User sees 🎉 new achievement
```

### Workflow: User Opens Leaderboard
```
1. User clicks "View Leaderboard" button
2. App calls fetchUserRank()
3. Backend returns user's rank info
4. Leaderboard component opens
5. Shows "Your Position" with user's stats
6. Shows top 20 performers below
7. User can see where they rank
```

---

## 🚀 Next Level (Optional)

Want to make it even better?

1. **Badge Notifications**: Toast popup when badge unlocked
2. **Confetti Animation**: Celebrate milestones
3. **Streak Notifications**: Alert when streak is about to reset
4. **Friend Leaderboards**: Compare with specific users
5. **Weekly Challenges**: Time-based bonus badges
6. **Achievement History**: See when each badge was earned

These can be added with minimal code changes.

---

## 📞 Support

- Check `GAMIFICATION_TESTING.md` for detailed test cases
- Check `GAMIFICATION_IMPLEMENTATION.md` for technical details
- Check backend logs: `console output` when running `python app.py`
- Check frontend logs: Browser DevTools F12 → Console tab

---

**Status**: ✅ Fully Implemented & Tested
**Version**: 1.0
**Last Updated**: 2024
