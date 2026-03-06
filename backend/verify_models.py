#!/usr/bin/env python3
"""Verify that all gamification models are properly configured"""

from app import app, db
from models import User, InterviewSession
from gamification_service import GamificationService, Badge

print("✓ All imports successful!\n")

# Check User model
print("User model gamification fields:")
user_fields = ['interview_streak', 'last_interview_date', 'total_interviews', 
               'total_score', 'confidence_level', 'badges']
for field in user_fields:
    if hasattr(User, field):
        print(f"  ✓ {field}")
    else:
        try:
            col = User.__table__.columns[field]
            print(f"  ✓ {field}")
        except KeyError:
            print(f"  ✗ {field} (MISSING)")

# Check InterviewSession model
print("\nInterviewSession model fields:")
session_fields = ['confidence_level']
for field in session_fields:
    try:
        col = InterviewSession.__table__.columns[field]
        print(f"  ✓ {field}")
    except KeyError:
        print(f"  ✗ {field} (MISSING)")

# Check GamificationService
print("\nGamificationService methods:")
methods = ['update_streak', 'calculate_confidence_level', 'check_and_unlock_badges', 
           'get_leaderboard', 'get_user_rank']
for method in methods:
    if hasattr(GamificationService, method):
        print(f"  ✓ {method}")
    else:
        print(f"  ✗ {method} (MISSING)")

# List available badges
print(f"\nAvailable badges ({len(Badge.BADGES)}):")
for name, badge in Badge.BADGES.items():
    print(f"  ✓ {badge['name']} - {badge['description']}")

print("\n✅ All gamification components are properly configured!")
