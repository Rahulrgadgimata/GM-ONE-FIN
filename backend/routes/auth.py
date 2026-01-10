from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from database import db, User, AuditLog
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_pan(pan):
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    return re.match(pattern, pan) is not None

def validate_gstin(gstin):
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    return re.match(pattern, gstin) is not None

def log_audit(user_id, action, resource_type=None, resource_id=None, details=None):
    """Log user action to audit trail"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent'),
        details=details
    )
    db.session.add(log)
    db.session.commit()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Signup for Company Secretary only"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        pan = data.get('pan', '').strip().upper()
        gstin = data.get('gstin', '').strip().upper()
        
        # Validation
        if not email or not password or not pan or not gstin:
            return jsonify({'error': 'All fields are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_pan(pan):
            return jsonify({'error': 'Invalid PAN format'}), 400
        
        if not validate_gstin(gstin):
            return jsonify({'error': 'Invalid GSTIN format'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(pan=pan).first():
            return jsonify({'error': 'PAN already registered'}), 400
        
        if User.query.filter_by(gstin=gstin).first():
            return jsonify({'error': 'GSTIN already registered'}), 400
        
        # Create user (Company Secretary role)
        user = User(
            email=email,
            password_hash=generate_password_hash(password),
            role='company_secretary',
            pan=pan,
            gstin=gstin,
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        
        log_audit(user.id, 'signup', 'user', user.id, f'New company secretary registered: {email}')
        
        # Generate token - identity must be a string
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Signup successful. Please create your entity.',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'pan': user.pan,
                'gstin': user.gstin
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Log login
        log_audit(user.id, 'login', 'user', user.id, f'User logged in: {email}')
        
        # Generate token - identity must be a string
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'pan': user.pan,
                'gstin': user.gstin
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'pan': user.pan,
            'gstin': user.gstin,
            'is_active': user.is_active,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    try:
        user_id = get_jwt_identity()
        log_audit(user_id, 'logout', 'user', user_id, 'User logged out')
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

