# Gamification System - Testing Guide

## 📋 Pre-Test Checklist

- [ ] Database migrated (`python backend/migrate_db.py`)
- [ ] All dependencies installed
- [ ] Backend running (`python backend/app.py`)
- [ ] Frontend running (`npm run dev`)
- [ ] Browser console open (F12) for debugging

## 🧪 End-to-End Test Cases

### Test 1: User Registration & Initial Stats
**Purpose**: Verify new users have correct default gamification values

**Steps**:
1. Register a new user or login
2. Check localStorage: `localStorage.getItem('auth_token')`
3. Check API response: Open DevTools Network tab
4. Navigate to gamification stats endpoint
5. Expected results:
   - `interview_streak: 0`
   - `total_interviews: 0`
   - `confidence_level: 5` (default)
   - `badges: []` (empty array)

---

### Test 2: Complete First Interview & Badge Unlock
**Purpose**: Verify that completing an interview unlocks "Getting Started" badge

**Steps**:
1. Login as user
2. Go to Interactive Interview Practice
3. Complete a full interview with scoring
4. Check GamificationStats component appears on main page
5. Verify in Network tab → save-session response includes:
   - Updated `total_interviews: 1`
   - `new_badges` array with "Getting Started" badge
   - `confidence_level` updated based on rating

**Expected**:
- GamificationStats shows "1 Interview"
- "Getting Started" badge appears in badges section

---

### Test 3: Streak Tracking
**Purpose**: Verify streak is tracked across multiple days

**Steps**:
1. Complete an interview (Day 1)
2. Check GamificationStats: `interview_streak` should be 1
3. Simulate next day (edit database or change system time)
4. Complete another interview
5. Check streak is incremented

**Expected**:
- Streak increases: 1 → 2
- Last interview date updates
- Date difference = 1 day

---

### Test 4: Confidence Level Progression
**Purpose**: Verify confidence level increases with better scores

**Steps**:
1. Complete interview with low rating (5) → confidence should be ~1
2. Complete interview with medium rating (7.5) → confidence should be ~5
3. Complete interview with high rating (10) → confidence should be 10
4. Check confidence bar updates in real-time

**Expected**:
- Confidence bar segments light up
- Color changes 🔴→🟡→🟢
- Number updates in stats

---

### Test 5: Badge Unlocking (5 Interviews)
**Purpose**: Verify "Practice Master" badge unlocks at 5 interviews

**Steps**:
1. Complete interviews until total_interviews = 5
2. After 5th interview, check API response for "Practice Master" badge
3. Verify badge appears in GamificationStats

**Expected**:
- Badge appears in earned badges
- Badge shows correct icon and description
- Can see "5 of ∞" in stats

---

### Test 6: Perfect Performance Badge
**Purpose**: Verify badge unlocks for 10/10 rating

**Steps**:
1. Complete interview and score 10/10
2. Check API response for badge unlock
3. Verify "Perfect Performance" badge appears

**Expected**:
- Badge unlocks immediately
- Badge description shows in component

---

### Test 7: Leaderboard Display
**Purpose**: Verify leaderboard shows correct rankings

**Steps**:
1. Have multiple users complete interviews
2. Each user has different scores
3. Open Leaderboard button
4. Check rankings are sorted by total_score (descending)

**Expected**:
- Users ranked by score (highest first)
- Correct medals shown (🥇🥈🥉)
- Current user's rank highlighted
- Stats match database

---

### Test 8: User's Position Calculation
**Purpose**: Verify user sees correct rank in leaderboard

**Steps**:
1. Open leaderboard
2. Find "Your Position" section
3. Check rank number matches user's position
4. Verify percentile calculation (rank/total_users * 100)

**Expected**:
- Correct rank displayed
- User highlighted in leaderboard
- Position information accurate

---

### Test 9: Badge Count in Leaderboard
**Purpose**: Verify leaderboard shows badge count for each user

**Steps**:
1. Open leaderboard
2. Look at each user row
3. Check badge count (🏅 number)
4. Count earned badges for each user

**Expected**:
- Badge count correct for each user
- Visual indicator clear

---

### Test 10: Responsive Design
**Purpose**: Verify UI works on mobile/tablet

**Steps**:
1. Open DevTools → toggle device toolbar
2. Test on mobile (375px)
3. Test on tablet (768px)
4. Check all components:
   - GamificationStats (cards stack vertically)
   - Leaderboard (scrollable table)
   - Badges (responsive grid)

**Expected**:
- No overflow or broken layout
- All text readable
- Buttons clickable
- Modal closes properly

---

## 🔍 API Testing (Using Curl/Postman)

### Test Gamification Stats Endpoint
```bash
curl -X GET http://localhost:5000/api/gamification/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "interview_streak": 2,
  "total_interviews": 5,
  "confidence_level": 7,
  "badges": [...],
  "avg_score": 8.5
}
```

### Test Leaderboard Endpoint
```bash
curl -X GET "http://localhost:5000/api/gamification/leaderboard?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
[
  {
    "username": "user1",
    "total_interviews": 20,
    "avg_score": 9.5,
    "confidence_level": 10,
    "interview_streak": 15,
    "num_badges": 8
  },
  ...
]
```

### Test User Rank Endpoint
```bash
curl -X GET http://localhost:5000/api/gamification/user-rank \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "rank": 5,
  "total_users": 100,
  "percentile": 95,
  "user_stats": {...}
}
```

---

## 🐛 Debugging Tips

### Check Database Directly
```bash
# View user's gamification data
sqlite3 backend/instance/resumeai.db
SELECT email, interview_streak, total_interviews, confidence_level, badges 
FROM users LIMIT 5;
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Complete an interview
4. Look for POST `/api/interview/save-session`
5. Check response includes:
   - `new_badges: [...]`
   - Updated stats

### Check Browser Console
```javascript
// Get authentication token
console.log(localStorage.getItem('auth_token'))

// Fetch user's gamification stats manually
fetch('http://localhost:5000/api/gamification/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(data => console.log(data))
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized on gamification endpoints | Missing/invalid token | Login first, check token in localStorage |
| 404 on new endpoints | Endpoints not added to app.py | Re-run app.py or check imports |
| Badges not unlocking | Server-side logic issue | Check gamification_service.py badge conditions |
| Leaderboard shows wrong order | Sorting by wrong field | Verify leaderboard uses total_score descending |
| UI doesn't update | Frontend not calling API | Check GamificationStats component mount logic |
| Database locked | Migration conflict | Restart backend server, rerun migration |

---

## ✅ Success Criteria

All of the following should be true:

- [ ] New user has default gamification stats
- [ ] First interview unlocks "Getting Started" badge
- [ ] Completing 5 interviews unlocks "Practice Master"
- [ ] Perfect 10/10 score triggers "Perfect Performance"
- [ ] Streak increases consistently
- [ ] Confidence level matches rating-based calculation
- [ ] Leaderboard shows correct rankings
- [ ] User's rank displayed accurately
- [ ] Mobile responsive design works
- [ ] All API endpoints return correct data
- [ ] No console errors
- [ ] No database errors

---

## 📊 Performance Metrics to Monitor

While testing, keep track of:
- **API response time**: Should be < 200ms for each endpoint
- **UI render time**: GamificationStats should appear immediately
- **Database query performance**: Large leaderboards might need indexing
- **Memory usage**: Long-running sessions shouldn't leak memory

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests passed locally
- [ ] Error handling tested (network failures, invalid data)
- [ ] Database backup taken
- [ ] Migration script tested on copy of production DB
- [ ] Performance tested with realistic user data
- [ ] Security review completed (no exposed tokens, data isolation)
- [ ] Frontend minified and optimized
- [ ] Backend error logging configured
- [ ] Monitoring set up for API endpoints
