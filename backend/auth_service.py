import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import os

class AuthService:
    """Service for handling authentication operations"""
    
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = 'HS256'
    TOKEN_EXPIRY_HOURS = 24
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @staticmethod
    def create_token(user_id: int, email: str) -> str:
        """Create JWT token"""
        payload = {
            'user_id': user_id,
            'email': email,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=AuthService.TOKEN_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return token
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def get_token_from_request(request):
        """Extract token from Authorization header"""
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:]
        return None


def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = AuthService.get_token_from_request(request)
        
        if not token:
            return jsonify({'error': 'Missing authentication token'}), 401
        
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Pass user_id to the route handler
        return f(payload['user_id'], *args, **kwargs)
    
    return decorated_function
