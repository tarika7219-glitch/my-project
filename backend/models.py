from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)  # For local auth
    google_id = db.Column(db.String(255), unique=True, nullable=True)  # For Google OAuth
    google_picture = db.Column(db.String(500), nullable=True)
    
    # Profile fields
    country = db.Column(db.String(100), nullable=True)
    learning_interests = db.Column(db.JSON, nullable=True)  # Store as list: ["Python", "Web Dev", etc]
    bio = db.Column(db.Text, nullable=True)
    
    # Gamification fields
    interview_streak = db.Column(db.Integer, default=0)  # Current consecutive days
    last_interview_date = db.Column(db.DateTime, nullable=True)  # For streak tracking
    total_interviews = db.Column(db.Integer, default=0)  # Total interviews completed
    total_score = db.Column(db.Float, default=0)  # Sum of all ratings for leaderboard
    confidence_level = db.Column(db.Integer, default=1)  # Current level 1-10
    badges = db.Column(db.JSON, nullable=True)  # List of earned badges with unlock dates
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    interview_sessions = db.relationship('InterviewSession', backref='user', lazy=True, cascade='all, delete-orphan')
    analysis_sessions = db.relationship('AnalysisSession', backref='user', lazy=True, cascade='all, delete-orphan')
    job_applications = db.relationship('JobApplication', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'country': self.country,
            'learning_interests': self.learning_interests or [],
            'bio': self.bio,
            'google_picture': self.google_picture,
            'interview_streak': self.interview_streak,
            'total_interviews': self.total_interviews,
            'confidence_level': self.confidence_level,
            'badges': self.badges or [],
            'created_at': self.created_at.isoformat(),
        }



class AnalysisSession(db.Model):
    """Model to store user's saved resume analyses"""
    __tablename__ = 'analysis_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional metadata
    title = db.Column(db.String(200), nullable=True)
    resume_filename = db.Column(db.String(255), nullable=True)
    job_description_filename = db.Column(db.String(255), nullable=True)

    # Core analysis payload
    analysis_data = db.Column(db.JSON, nullable=False)
    resume_text = db.Column(db.Text, nullable=True)
    job_description_text = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'resume_filename': self.resume_filename,
            'job_description_filename': self.job_description_filename,
            'analysis_data': self.analysis_data,
            'resume_text': self.resume_text,
            'job_description_text': self.job_description_text,
            'created_at': self.created_at.isoformat(),
        }


class JobApplication(db.Model):
    """Model to track user's job applications"""
    __tablename__ = 'job_applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    analysis_session_id = db.Column(db.Integer, db.ForeignKey('analysis_sessions.id'), nullable=True, index=True)

    company = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Applied')
    application_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis_session = db.relationship('AnalysisSession', backref='job_applications', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'analysis_session_id': self.analysis_session_id,
            'company': self.company,
            'role': self.role,
            'status': self.status,
            'application_date': self.application_date.isoformat() if self.application_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }


class InterviewSession(db.Model):
    """Model to store interview session history and progress"""
    __tablename__ = 'interview_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_date = db.Column(db.DateTime, default=datetime.utcnow)
    question_count = db.Column(db.Integer, nullable=False)
    average_rating = db.Column(db.Float, nullable=False)
    confidence_level = db.Column(db.Integer, default=1)  # 1-10 scale
    session_data = db.Column(db.JSON, nullable=True)  # Stores detailed answers and feedback
    category_stats = db.Column(db.JSON, nullable=True)  # Stores performance by category
    
    # Speech metrics
    recorded_answers = db.Column(db.Integer, default=0)  # Number of spoken answers
    avg_response_time = db.Column(db.Float, nullable=True)  # Average time to answer in seconds
    filler_word_count = db.Column(db.Integer, default=0)  # Total filler words (umm, uh, like, etc)
    clarity_score = db.Column(db.Float, nullable=True)  # 0-10 clarity/pronunciation score
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_date': self.session_date.isoformat(),
            'question_count': self.question_count,
            'average_rating': self.average_rating,
            'confidence_level': self.confidence_level,
            'category_stats': self.category_stats,
        }

