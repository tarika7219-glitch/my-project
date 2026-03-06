import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    @staticmethod
    def _database_url():
        db_url = os.getenv('DATABASE_URL', 'sqlite:///resumeai.db')
        if db_url.startswith('postgres://'):
            db_url = db_url.replace('postgres://', 'postgresql://', 1)
        return db_url

    @staticmethod
    def _cors_origins():
        raw = os.getenv('CORS_ORIGINS', '*')
        if raw.strip() == '*':
            return '*'
        return [origin.strip() for origin in raw.split(',') if origin.strip()]

    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SQLALCHEMY_DATABASE_URI = _database_url.__func__()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = _cors_origins.__func__()
    PORT = int(os.getenv('PORT', 5000))
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
