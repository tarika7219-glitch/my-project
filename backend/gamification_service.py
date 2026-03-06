"""
Gamification Service - Handles badges, streaks, and confidence levels
"""
from datetime import datetime, timedelta
from models import User, db

class Badge:
    """Badge definitions"""
    BADGES = {
        'first_interview': {
            'name': 'Getting Started',
            'description': 'Completed your first interview',
            'icon': '🚀',
            'condition': lambda user: user.total_interviews >= 1
        },
        'five_interviews': {
            'name': 'Practice Master',
            'description': 'Completed 5 interviews',
            'icon': '💪',
            'condition': lambda user: user.total_interviews >= 5
        },
        'ten_interviews': {
            'name': 'Dedication',
            'description': 'Completed 10 interviews',
            'icon': '⭐',
            'condition': lambda user: user.total_interviews >= 10
        },
        'twenty_interviews': {
            'name': 'Interview Champion',
            'description': 'Completed 20 interviews',
            'icon': '🏆',
            'condition': lambda user: user.total_interviews >= 20
        },
        'perfect_score': {
            'name': 'Perfect Performance',
            'description': 'Scored 10/10 on an interview',
            'icon': '💯',
            'condition': lambda user: False  # Checked at session level
        },
        'seven_day_streak': {
            'name': '🔥 Week Warrior',
            'description': '7 day interview streak',
            'icon': '🔥',
            'condition': lambda user: user.interview_streak >= 7
        },
        'thirty_day_streak': {
            'name': 'Unstoppable',
            'description': '30 day interview streak',
            'icon': '⚡',
            'condition': lambda user: user.interview_streak >= 30
        },
        'high_confidence': {
            'name': 'Confident Speaker',
            'description': 'Reached confidence level 7',
            'icon': '🎤',
            'condition': lambda user: user.confidence_level >= 7
        },
        'expert': {
            'name': 'Interview Expert',
            'description': 'Reached confidence level 10',
            'icon': '👑',
            'condition': lambda user: user.confidence_level >= 10
        },
        'average_score_high': {
            'name': 'Consistent Performer',
            'description': 'Average score above 8.0',
            'icon': '📈',
            'condition': lambda user: (user.total_interviews > 0 and (user.total_score / user.total_interviews) >= 8.0)
        },
        'first_recorded_answer': {
            'name': 'First Recorded Answer',
            'description': 'Recorded your first spoken answer',
            'icon': '🎤',
            'condition': lambda user: False  # Checked at session level
        },
        'ten_spoken_answers': {
            'name': 'Verbally Fluent',
            'description': 'Completed 10 spoken answers',
            'icon': '🗣',
            'condition': lambda user: False  # Checked at session level (cumulative)
        },
        'fast_confident_answer': {
            'name': 'Quick Thinking',
            'description': 'Answered within 1 minute confidently',
            'icon': '⏱',
            'condition': lambda user: False  # Checked at session level
        },
        'clear_speech': {
            'name': 'Clear Communicator',
            'description': 'High clarity score in your responses',
            'icon': '📢',
            'condition': lambda user: False  # Checked at session level
        },
        'low_filler_words': {
            'name': 'Fluent Speaker',
            'description': 'Low filler word usage ("umm", "uh", "like")',
            'icon': '💬',
            'condition': lambda user: False  # Checked at session level
        }
    }

class GamificationService:
    """Service to handle gamification logic"""
    
    @staticmethod
    def update_streak(user):
        """Update user's interview streak"""
        now = datetime.utcnow()
        
        if not user.last_interview_date:
            user.interview_streak = 1
        else:
            last_date = user.last_interview_date.date()
            today = now.date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                # Same day, streak continues
                pass
            elif days_diff == 1:
                # Next day, increment streak
                user.interview_streak += 1
            else:
                # Streak broken, reset
                user.interview_streak = 1
        
        user.last_interview_date = now
    
    @staticmethod
    def calculate_confidence_level(average_rating):
        """
        Calculate confidence level based on rating
        Rating: 5-10 → Level: 1-10
        """
        if average_rating >= 9.5:
            return 10
        elif average_rating >= 9:
            return 9
        elif average_rating >= 8.5:
            return 8
        elif average_rating >= 8:
            return 7
        elif average_rating >= 7.5:
            return 6
        elif average_rating >= 7:
            return 5
        elif average_rating >= 6.5:
            return 4
        elif average_rating >= 6:
            return 3
        elif average_rating >= 5.5:
            return 2
        else:
            return 1
    
    @staticmethod
    def check_and_unlock_badges(user, perfect_score=False, recorded_answers=0, avg_response_time=None, filler_word_count=0, clarity_score=None):
        """Check and unlock new badges for user"""
        if not user.badges:
            user.badges = []
        
        earned_badges = [b['id'] for b in user.badges]
        new_badges = []
        
        for badge_id, badge_info in Badge.BADGES.items():
            if badge_id not in earned_badges:
                # Check special case for perfect score
                if badge_id == 'perfect_score' and perfect_score:
                    new_badges.append(badge_id)
                # Check for first recorded answer
                elif badge_id == 'first_recorded_answer' and recorded_answers > 0:
                    new_badges.append(badge_id)
                # Check for 10 spoken answers (cumulative)
                elif badge_id == 'ten_spoken_answers':
                    total_spoken = sum(session.recorded_answers or 0 for session in user.interview_sessions)
                    if total_spoken >= 10:
                        new_badges.append(badge_id)
                # Check for fast confident answer (under 60 seconds and rating 8+)
                elif badge_id == 'fast_confident_answer' and avg_response_time and avg_response_time <= 60:
                    new_badges.append(badge_id)
                # Check for clear speech (clarity score 8+)
                elif badge_id == 'clear_speech' and clarity_score and clarity_score >= 8:
                    new_badges.append(badge_id)
                # Check for low filler words (less than 3 filler words in a session)
                elif badge_id == 'low_filler_words' and filler_word_count <= 2:
                    new_badges.append(badge_id)
                # Check regular conditions
                elif badge_info['condition'](user):
                    new_badges.append(badge_id)
        
        # Add new badges to user's list
        for badge_id in new_badges:
            badge_info = Badge.BADGES[badge_id]
            user.badges.append({
                'id': badge_id,
                'name': badge_info['name'],
                'description': badge_info['description'],
                'icon': badge_info['icon'],
                'unlocked_at': datetime.utcnow().isoformat()
            })
        
        return new_badges
    
    @staticmethod
    def get_leaderboard(limit=10):
        """Get top users by total score with interviews"""
        users = User.query.filter(User.total_interviews > 0)\
                          .order_by(User.total_score.desc())\
                          .limit(limit).all()
        
        leaderboard = []
        for idx, user in enumerate(users, 1):
            avg_score = user.total_score / user.total_interviews if user.total_interviews > 0 else 0
            leaderboard.append({
                'rank': idx,
                'username': user.username or user.email.split('@')[0],
                'total_interviews': user.total_interviews,
                'average_score': round(avg_score, 2),
                'confidence_level': user.confidence_level,
                'interview_streak': user.interview_streak,
                'badge_count': len(user.badges or [])
            })
        
        return leaderboard
    
    @staticmethod
    def get_user_rank(user_id):
        """Get user's rank in leaderboard"""
        user = User.query.get(user_id)
        if not user or user.total_interviews == 0:
            return None
        
        rank = User.query.filter(User.total_score > user.total_score,
                                 User.total_interviews > 0).count() + 1
        
        return {
            'rank': rank,
            'username': user.username or user.email.split('@')[0],
            'total_interviews': user.total_interviews,
            'average_score': round(user.total_score / user.total_interviews, 2),
            'confidence_level': user.confidence_level,
            'interview_streak': user.interview_streak,
            'badge_count': len(user.badges or [])
        }
