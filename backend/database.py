from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # super_admin, company_secretary, accountant
    pan = db.Column(db.String(10), unique=True, nullable=True)
    gstin = db.Column(db.String(15), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    entities = db.relationship('Entity', backref='secretary', lazy=True, foreign_keys='Entity.secretary_id')
    assigned_entities = db.relationship('EntityAssignment', backref='accountant', lazy=True, foreign_keys='EntityAssignment.accountant_id')
    notifications = db.relationship('Notification', backref='user', lazy=True)
    audit_logs = db.relationship('AuditLog', backref='user', lazy=True)

class Entity(db.Model):
    __tablename__ = 'entities'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(255), nullable=False)
    pan = db.Column(db.String(10), unique=True, nullable=False)
    gstin = db.Column(db.String(15), unique=True, nullable=False)
    company_type = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(20), nullable=True)
    cin = db.Column(db.String(21), nullable=True)  # Corporate Identification Number
    incorporation_date = db.Column(db.Date, nullable=True)
    fy_start = db.Column(db.Date, nullable=True)  # Financial Year Start
    fy_end = db.Column(db.Date, nullable=True)    # Financial Year End
    owner = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='pending_approval')  # pending_approval, active, rejected
    secretary_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    admin_remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    permanent_documents = db.relationship('PermanentDocument', backref='entity', lazy=True, cascade='all, delete-orphan')
    periodic_documents = db.relationship('PeriodicDocument', backref='entity', lazy=True, cascade='all, delete-orphan')
    assignments = db.relationship('EntityAssignment', backref='entity', lazy=True, cascade='all, delete-orphan')

class PermanentDocument(db.Model):
    __tablename__ = 'permanent_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entities.id'), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)  # pan_card, gst_certificate, incorporation_cert, moa_aoa
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_permanent_documents')

class PeriodicDocument(db.Model):
    __tablename__ = 'periodic_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entities.id'), nullable=False)
    financial_year = db.Column(db.String(10), nullable=False)  # e.g., "2023-24"
    period = db.Column(db.String(50), nullable=False)  # monthly, quarterly, yearly
    period_value = db.Column(db.String(50), nullable=False)  # e.g., "Q1", "January", "FY2023-24"
    document_type = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    version = db.Column(db.Integer, default=1)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_periodic_documents')

class EntityAssignment(db.Model):
    __tablename__ = 'entity_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entities.id'), nullable=False)
    accountant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    access_type = db.Column(db.String(50), default='all')  # monthly, quarterly, yearly, all
    
    __table_args__ = (db.UniqueConstraint('entity_id', 'accountant_id', name='unique_assignment'),)

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # approval, rejection, upload, missing, deadline, security
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    related_entity_id = db.Column(db.Integer, db.ForeignKey('entities.id'), nullable=True)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)  # login, logout, upload, download, approve, reject, create, update
    resource_type = db.Column(db.String(50), nullable=True)  # entity, document, user
    resource_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_db():
    """Initialize the database"""
    db.create_all()
    
    # Create default super admin if not exists
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

