from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db
import os

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

# Get the absolute path to the instance folder
base_dir = os.path.dirname(os.path.abspath(__file__))
instance_dir = os.path.join(base_dir, 'instance')
os.makedirs(instance_dir, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_dir, "gm_finance.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(base_dir, 'uploads')

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
jwt = JWTManager(app)

# Configure JWT to work with multipart/form-data
# JWT tokens should be in Authorization header for multipart requests
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For development - no expiration

db.init_app(app)

# Error handlers
@app.errorhandler(422)
def handle_422_error(e):
    """Handle 422 Unprocessable Entity errors"""
    error_description = str(e.description) if hasattr(e, 'description') else str(e)
    print(f"422 Error: {error_description}")
    return jsonify({
        'error': 'Request could not be processed',
        'details': error_description
    }), 422

@app.errorhandler(400)
def handle_400_error(e):
    """Handle 400 Bad Request errors"""
    return jsonify({'error': 'Bad request. Please check your input data.'}), 400

@app.errorhandler(401)
def handle_401_error(e):
    """Handle 401 Unauthorized errors"""
    return jsonify({'error': 'Authentication required. Please login again.'}), 401

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired. Please login again.'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    error_msg = str(error)
    print(f"Invalid token error: {error_msg}")
    # If it's the "Subject must be a string" error, provide clear message
    if 'Subject must be a string' in error_msg or 'subject' in error_msg.lower():
        return jsonify({
            'error': 'Token format is invalid. Please logout and login again to get a new token.',
            'code': 'INVALID_TOKEN_FORMAT',
            'action': 'logout_and_relogin'
        }), 422
    return jsonify({'error': f'Invalid token: {error_msg}'}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is missing. Please login.'}), 401

# Register blueprints
from routes.auth import auth_bp
from routes.users import users_bp
from routes.entities import entities_bp
from routes.documents import documents_bp
from routes.notifications import notifications_bp
from routes.audit import audit_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(entities_bp, url_prefix='/api/entities')
app.register_blueprint(documents_bp, url_prefix='/api/documents')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(audit_bp, url_prefix='/api/audit')

# Create database tables and default admin user
with app.app_context():
    db.create_all()

    # Migrate: Add access_type column to entity_assignments if it doesn't exist
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        if 'entity_assignments' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('entity_assignments')]
            if 'access_type' not in columns:
                with db.engine.connect() as conn:
                    conn.execute(text('ALTER TABLE entity_assignments ADD COLUMN access_type VARCHAR(50) DEFAULT "all"'))
                    conn.commit()
                print("Added access_type column to entity_assignments table")
    except Exception as e:
        # Column might already exist - that's okay
        pass

    # Create default super admin if not exists
    from database import User
    from werkzeug.security import generate_password_hash

    admin = User.query.filter_by(email='admin@gmfinance.com').first()
    if not admin:
        admin = User(
            email='admin@gmfinance.com',
            password_hash=generate_password_hash('admin123'),
            role='super_admin',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Default admin user created: admin@gmfinance.com / admin123")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)