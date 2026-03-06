from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import requests
from datetime import datetime
from config import Config
from utils import extract_text_from_file, clean_text
from analysis_service import AnalysisService
from pdf_generator import PDFReportGenerator
from models import db, User, InterviewSession, AnalysisSession, JobApplication
from auth_service import AuthService, token_required
from gamification_service import GamificationService, Badge

app = Flask(__name__)
app.config.from_object(Config)

cors_origins = app.config.get('CORS_ORIGINS', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origins}})

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize analysis service
analysis_service = AnalysisService(app.config['GROQ_API_KEY'])

ALLOWED_EXTENSIONS = {'txt', 'pdf'}
APPLICATION_STATUSES = {'Applied', 'Interviewing', 'Offer', 'Rejected'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============= AUTHENTICATION ROUTES =============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data.get('email').lower()
        password = data.get('password')
        username = data.get('username', email.split('@')[0])
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            email=email,
            username=username,
            password_hash=AuthService.hash_password(password)
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create token
        token = AuthService.create_token(user.id, user.email)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with email and password"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data.get('email').lower()
        password = data.get('password')
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.password_hash:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not AuthService.verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create token
        token = AuthService.create_token(user.id, user.email)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    """Handle Google OAuth authentication"""
    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token
        
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token
        try:
            # This will verify the token signature and expiration
            # Note: For development, you may need to skip verification
            # In production, always verify the token
            idinfo = id_token.verify_oauth2_token(
                google_token,
                requests.Request(),
                os.getenv('GOOGLE_CLIENT_ID')
            )
            
            email = idinfo.get('email', '').lower()
            google_id = idinfo.get('sub')
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture')
            
        except Exception as e:
            # For development, accept token without verification
            # In production, this should fail
            print(f"Token verification warning: {str(e)}")
            
            # Fallback: Try to decode without verification (development only)
            try:
                import base64
                import json
                
                # Decode the JWT payload (not verified)
                payload = google_token.split('.')[1]
                # Add padding if needed
                padding = 4 - len(payload) % 4
                if padding != 4:
                    payload += '=' * padding
                
                decoded = base64.urlsafe_b64decode(payload)
                idinfo = json.loads(decoded)
                
                email = idinfo.get('email', '').lower()
                google_id = idinfo.get('sub')
                name = idinfo.get('name', email.split('@')[0])
                picture = idinfo.get('picture')
                
            except Exception as decode_error:
                return jsonify({'error': f'Invalid Google token: {str(decode_error)}'}), 400
        
        if not email or not google_id:
            return jsonify({'error': 'Invalid Google user info'}), 400
        
        # Find or create user
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Check if email exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Link Google account to existing user
                user.google_id = google_id
            else:
                # Create new user
                user = User(
                    email=email,
                    username=name,
                    google_id=google_id,
                    google_picture=picture
                )
                db.session.add(user)
        
        # Update picture and name
        if picture:
            user.google_picture = picture
        user.username = name
        
        db.session.commit()
        
        # Create token
        token = AuthService.create_token(user.id, user.email)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error in google_auth: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/user', methods=['GET'])
@token_required
def get_user(user_id):
    """Get current user info"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout(user_id):
    """Logout user (token invalidation handled on client side)"""
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


# ============= USER PROFILE ROUTES =============

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    """Get user profile"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'profile': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Update user profile"""
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update fields if provided
        if 'username' in data and data['username'].strip():
            # Check if username is already taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        
        if 'country' in data:
            user.country = data['country'] if data['country'] else None
        
        if 'learning_interests' in data:
            # Ensure it's a list
            interests = data['learning_interests']
            if isinstance(interests, str):
                # If string, split by comma
                interests = [i.strip() for i in interests.split(',') if i.strip()]
            elif not isinstance(interests, list):
                interests = []
            user.learning_interests = interests if interests else None
        
        if 'bio' in data:
            user.bio = data['bio'] if data['bio'] else None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============= INTERVIEW PROGRESS ROUTES =============

@app.route('/api/interview/save-session', methods=['POST'])
@token_required
def save_interview_session(user_id):
    """Save interview session progress and update gamification stats"""
    try:
        data = request.get_json()
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        average_rating = data.get('average_rating', 0)
        
        # Calculate confidence level
        confidence_level = GamificationService.calculate_confidence_level(average_rating)
        
        # Check for perfect score (10/10)
        perfect_score = average_rating >= 10
        
        # Get speech metrics
        recorded_answers = data.get('recorded_answers', 0)
        avg_response_time = data.get('avg_response_time')
        filler_word_count = data.get('filler_word_count', 0)
        clarity_score = data.get('clarity_score')
        
        session = InterviewSession(
            user_id=user_id,
            question_count=data.get('question_count', 0),
            average_rating=average_rating,
            confidence_level=confidence_level,
            session_data=data.get('session_data'),
            category_stats=data.get('category_stats'),
            # Add speech metrics
            recorded_answers=recorded_answers,
            avg_response_time=avg_response_time,
            filler_word_count=filler_word_count,
            clarity_score=clarity_score
        )
        
        # Update user's gamification stats
        user.total_interviews += 1
        user.total_score += average_rating
        user.confidence_level = confidence_level
        
        # Update streak
        GamificationService.update_streak(user)
        
        # Check for new badge unlocks (with speech metrics)
        new_badges = GamificationService.check_and_unlock_badges(
            user, 
            perfect_score=perfect_score,
            recorded_answers=recorded_answers,
            avg_response_time=avg_response_time,
            filler_word_count=filler_word_count,
            clarity_score=clarity_score
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'user_stats': {
                'total_interviews': user.total_interviews,
                'interview_streak': user.interview_streak,
                'confidence_level': user.confidence_level,
                'badges': user.badges or [],
                'new_badges': new_badges
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/interview/history', methods=['GET'])
@token_required
def get_interview_history(user_id):
    """Get user's interview history"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        sessions = InterviewSession.query.filter_by(user_id=user_id).order_by(
            InterviewSession.session_date.desc()
        ).limit(10).all()
        
        return jsonify({
            'success': True,
            'sessions': [session.to_dict() for session in sessions]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# ============= ANALYSIS HISTORY ROUTES =============

@app.route('/api/analysis/save', methods=['POST'])
@token_required
def save_analysis(user_id):
    """Save analysis result for authenticated user"""
    try:
        data = request.get_json()

        if not data or 'analysis' not in data:
            return jsonify({'error': 'Analysis payload is required'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        analysis_session = AnalysisSession(
            user_id=user_id,
            title=(data.get('title') or '').strip() or None,
            resume_filename=(data.get('resume_filename') or '').strip() or None,
            job_description_filename=(data.get('job_description_filename') or '').strip() or None,
            analysis_data=data.get('analysis'),
            resume_text=data.get('resume_text'),
            job_description_text=data.get('job_description_text')
        )

        db.session.add(analysis_session)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Analysis saved successfully',
            'analysis_session': analysis_session.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/history', methods=['GET'])
@token_required
def get_analysis_history(user_id):
    """List user's saved analyses"""
    try:
        limit = request.args.get('limit', 20, type=int)
        limit = max(1, min(limit, 100))

        sessions = AnalysisSession.query.filter_by(user_id=user_id).order_by(
            AnalysisSession.created_at.desc()
        ).limit(limit).all()

        return jsonify({
            'success': True,
            'history': [session.to_dict() for session in sessions]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/history/<int:session_id>', methods=['DELETE'])
@token_required
def delete_analysis_history(user_id, session_id):
    """Delete one saved analysis that belongs to current user"""
    try:
        session = AnalysisSession.query.filter_by(id=session_id, user_id=user_id).first()
        if not session:
            return jsonify({'error': 'Saved analysis not found'}), 404

        db.session.delete(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Saved analysis deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============= JOB APPLICATION TRACKER ROUTES =============

@app.route('/api/applications', methods=['GET'])
@token_required
def list_job_applications(user_id):
    """List job applications for the authenticated user"""
    try:
        applications = JobApplication.query.filter_by(user_id=user_id).order_by(
            JobApplication.created_at.desc()
        ).all()

        return jsonify({
            'success': True,
            'applications': [application.to_dict() for application in applications]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications', methods=['POST'])
@token_required
def create_job_application(user_id):
    """Create a new job application"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Application data is required'}), 400

        company = (data.get('company') or '').strip()
        role = (data.get('role') or '').strip()
        status = (data.get('status') or 'Applied').strip()
        notes = data.get('notes')
        analysis_session_id = data.get('analysis_session_id')
        application_date_str = data.get('application_date')

        if not company or not role:
            return jsonify({'error': 'Company and role are required'}), 400

        if status not in APPLICATION_STATUSES:
            return jsonify({'error': 'Invalid application status'}), 400

        application_date = None
        if application_date_str:
            try:
                application_date = datetime.strptime(application_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'application_date must be in YYYY-MM-DD format'}), 400

        if analysis_session_id is not None:
            linked_analysis = AnalysisSession.query.filter_by(
                id=analysis_session_id,
                user_id=user_id
            ).first()
            if not linked_analysis:
                return jsonify({'error': 'Linked analysis session not found'}), 404

        application = JobApplication(
            user_id=user_id,
            analysis_session_id=analysis_session_id,
            company=company,
            role=role,
            status=status,
            application_date=application_date,
            notes=notes
        )

        db.session.add(application)
        db.session.commit()

        return jsonify({
            'success': True,
            'application': application.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/<int:application_id>', methods=['PUT'])
@token_required
def update_job_application(user_id, application_id):
    """Update an existing job application"""
    try:
        application = JobApplication.query.filter_by(id=application_id, user_id=user_id).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Application data is required'}), 400

        if 'company' in data:
            company = (data.get('company') or '').strip()
            if not company:
                return jsonify({'error': 'Company cannot be empty'}), 400
            application.company = company

        if 'role' in data:
            role = (data.get('role') or '').strip()
            if not role:
                return jsonify({'error': 'Role cannot be empty'}), 400
            application.role = role

        if 'status' in data:
            status = (data.get('status') or '').strip()
            if status not in APPLICATION_STATUSES:
                return jsonify({'error': 'Invalid application status'}), 400
            application.status = status

        if 'notes' in data:
            application.notes = data.get('notes')

        if 'application_date' in data:
            application_date_str = data.get('application_date')
            if application_date_str:
                try:
                    application.application_date = datetime.strptime(application_date_str, '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'application_date must be in YYYY-MM-DD format'}), 400
            else:
                application.application_date = None

        if 'analysis_session_id' in data:
            analysis_session_id = data.get('analysis_session_id')
            if analysis_session_id is None or analysis_session_id == '':
                application.analysis_session_id = None
            else:
                linked_analysis = AnalysisSession.query.filter_by(
                    id=analysis_session_id,
                    user_id=user_id
                ).first()
                if not linked_analysis:
                    return jsonify({'error': 'Linked analysis session not found'}), 404
                application.analysis_session_id = analysis_session_id

        db.session.commit()

        return jsonify({
            'success': True,
            'application': application.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/<int:application_id>', methods=['DELETE'])
@token_required
def delete_job_application(user_id, application_id):
    """Delete a job application"""
    try:
        application = JobApplication.query.filter_by(id=application_id, user_id=user_id).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        db.session.delete(application)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Application deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============= GAMIFICATION ROUTES =============

@app.route('/api/gamification/stats', methods=['GET'])
@token_required
def get_gamification_stats(user_id):
    """Get user's gamification stats"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'stats': {
                'interview_streak': user.interview_streak,
                'total_interviews': user.total_interviews,
                'confidence_level': user.confidence_level,
                'badges': user.badges or [],
                'average_score': round(user.total_score / user.total_interviews, 2) if user.total_interviews > 0 else 0
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/gamification/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get global leaderboard of top performers"""
    try:
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 100)  # Max 100 results
        
        leaderboard = GamificationService.get_leaderboard(limit)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/gamification/user-rank', methods=['GET'])
@token_required
def get_user_rank(user_id):
    """Get user's rank in leaderboard"""
    try:
        rank_info = GamificationService.get_user_rank(user_id)
        
        if not rank_info:
            return jsonify({
                'success': True,
                'rank_info': None,
                'message': 'No interviews completed yet'
            }), 200
        
        return jsonify({
            'success': True,
            'rank_info': rank_info
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/gamification/badges', methods=['GET'])
def get_all_badges():
    """Get all available badges"""
    try:
        badges_list = []
        for badge_id, badge_info in Badge.BADGES.items():
            badges_list.append({
                'id': badge_id,
                'name': badge_info['name'],
                'description': badge_info['description'],
                'icon': badge_info['icon']
            })
        
        return jsonify({
            'success': True,
            'badges': badges_list
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return health()

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """Analyze resume against job description"""
    try:
        # Check if files are present
        if 'resume' not in request.files or 'job_description' not in request.files:
            return jsonify({"error": "Resume and job description files are required"}), 400
        
        resume_file = request.files['resume']
        job_file = request.files['job_description']
        
        if resume_file.filename == '' or job_file.filename == '':
            return jsonify({"error": "Files cannot be empty"}), 400
        
        if not (allowed_file(resume_file.filename) and allowed_file(job_file.filename)):
            return jsonify({"error": "Only .txt and .pdf files are allowed"}), 400
        
        # Save and extract resume
        resume_filename = secure_filename(resume_file.filename)
        resume_path = os.path.join(app.config['UPLOAD_FOLDER'], 'resume_' + resume_filename)
        resume_file.save(resume_path)
        
        resume_extension = resume_filename.rsplit('.', 1)[1].lower()
        resume_text = extract_text_from_file(resume_path, resume_extension)
        resume_text = clean_text(resume_text)
        
        # Save and extract job description
        job_filename = secure_filename(job_file.filename)
        job_path = os.path.join(app.config['UPLOAD_FOLDER'], 'job_' + job_filename)
        job_file.save(job_path)
        
        job_extension = job_filename.rsplit('.', 1)[1].lower()
        job_text = extract_text_from_file(job_path, job_extension)
        job_text = clean_text(job_text)
        
        # Perform analysis
        analysis = analysis_service.analyze_skills_match(resume_text, job_text)
        
        # Clean up uploaded files
        os.remove(resume_path)
        os.remove(job_path)
        
        return jsonify({
            "success": True,
            "analysis": analysis,
            "resume_text": resume_text,
            "job_description": job_text
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chatbot conversations"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        user_message = data['message']
        context = data.get('context', '')  # Optional context from analysis
        
        response = analysis_service.chat_response(user_message, context)
        
        return jsonify({
            "success": True,
            "response": response
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/file-type-help', methods=['GET'])
def file_type_help():
    """Get information about supported file types"""
    return jsonify({
        "supported_formats": ["pdf", "txt"],
        "max_file_size": "16MB",
        "tips": {
            "resume": "Upload your complete resume in PDF or TXT format",
            "job_description": "Upload or paste the job description in PDF or TXT format"
        }
    }), 200

@app.route('/api/download-report', methods=['POST'])
def download_report():
    """Generate and download analysis report as PDF"""
    try:
        # Get analysis data from request
        data = request.get_json()
        if not data:
            return jsonify({"error": "Analysis data is required"}), 400
        
        # Generate PDF
        pdf_generator = PDFReportGenerator()
        pdf_buffer = pdf_generator.generate_report(data)
        
        # Return PDF file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Resume_Analysis_Report.pdf'
        ), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

@app.route('/api/generate-roadmap', methods=['POST'])
def generate_roadmap():
    """Generate a personalized learning roadmap"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Analysis data is required"}), 400
        
        missing_skills = data.get('missing_skills', [])
        skills_to_learn = data.get('skills_to_learn', [])
        match_percentage = data.get('match_percentage', 0)
        
        if not skills_to_learn:
            return jsonify({"error": "No skills to generate roadmap for"}), 400
        
        roadmap = analysis_service.generate_learning_roadmap(
            missing_skills, 
            skills_to_learn, 
            match_percentage
        )
        
        return jsonify({
            "success": True,
            "roadmap": roadmap
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-interview-questions', methods=['POST'])
def generate_interview_questions():
    """Generate interview questions based on resume and job description"""
    try:
        # Get analysis data from request (resume, job description, missing skills)
        data = request.get_json()
        if not data:
            return jsonify({"error": "Data is required"}), 400
        
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        missing_skills = data.get('missing_skills', [])
        
        if not resume_text or not job_description:
            return jsonify({"error": "Resume text and job description are required"}), 400
        
        questions = analysis_service.generate_interview_questions(
            resume_text,
            job_description,
            missing_skills
        )
        
        return jsonify({
            "success": True,
            "questions": questions
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/evaluate-interview-answer', methods=['POST'])
def evaluate_interview_answer():
    """Evaluate user's spoken interview answer"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Data is required"}), 400
        
        question = data.get('question', '')
        user_answer = data.get('user_answer', '')
        
        if not question or not user_answer:
            return jsonify({"error": "Question and answer are required"}), 400
        
        feedback = analysis_service.evaluate_interview_answer(question, user_answer)
        
        return jsonify({
            "success": True,
            "feedback": feedback
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/rewrite-resume-bullets', methods=['POST'])
def rewrite_resume_bullets():
    """Rewrite resume bullets to be stronger and ATS-friendly"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Data is required"}), 400

        bullets = data.get('bullets', [])
        job_description = data.get('job_description', '')

        if not isinstance(bullets, list) or not bullets:
            return jsonify({"error": "bullets must be a non-empty list"}), 400

        rewritten = analysis_service.rewrite_resume_bullets(bullets, job_description)

        return jsonify({
            "success": True,
            "result": rewritten
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=app.config.get('PORT', 5000))

