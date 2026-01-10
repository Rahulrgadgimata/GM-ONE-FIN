from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, Entity, User, AuditLog, PermanentDocument
from datetime import datetime
from werkzeug.utils import secure_filename
import os

entities_bp = Blueprint('entities', __name__)

# Document categories from the requirements
DOCUMENT_CATEGORIES = [
    "Identity & Legal",
    "Ownership & Governance",
    "Financial Statements",
    "Accounting Records",
    "Bank & Loan",
    "Income Tax",
    "GST",
    "TDS / TCS",
    "Statutory & Labour",
    "Sales & Revenue",
    "Purchase & Expense",
    "Payroll & HR",
    "Fixed Assets",
    "Audit Documents"
]

# Accept all file types
def allowed_file(filename):
    # Accept any file that has an extension
    return '.' in filename and len(filename.rsplit('.', 1)) > 1

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

@entities_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get available document categories"""
    return jsonify({
        'categories': DOCUMENT_CATEGORIES
    }), 200

@entities_bp.route('/create', methods=['POST'])
@jwt_required()
def create_entity():
    """Create a new entity with documents (Company Secretary only)"""
    try:
        # Check content type
        content_type = request.content_type or ''
        print(f"Content-Type: {content_type}")
        print(f"Request method: {request.method}")
        print(f"Request is_json: {request.is_json}")
        print(f"Authorization header: {request.headers.get('Authorization', 'Not found')}")
        
        try:
            user_id_str = get_jwt_identity()
            print(f"Raw JWT identity: {user_id_str} (type: {type(user_id_str)})")
            
            # Convert to int if it's a string, or use directly if already int
            if user_id_str is None:
                return jsonify({'error': 'No user ID in token. Please login again.'}), 401
            
            # Handle both string and int (for backward compatibility)
            if isinstance(user_id_str, str):
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return jsonify({'error': f'Invalid user ID format in token: {user_id_str}'}), 401
            elif isinstance(user_id_str, int):
                # Old token format - still accept it but log warning
                print(f"WARNING: Token contains integer ID (old format). User should re-login.")
                user_id = user_id_str
            else:
                return jsonify({'error': f'Unexpected user ID type: {type(user_id_str)}'}), 401
                
            print(f"User ID from token: {user_id} (type: {type(user_id)})")
        except Exception as jwt_error:
            error_msg = str(jwt_error)
            print(f"JWT Error: {error_msg}")
            if 'Subject must be a string' in error_msg:
                return jsonify({
                    'error': 'Token format is invalid. Please logout and login again.',
                    'code': 'INVALID_TOKEN_FORMAT'
                }), 422
            return jsonify({'error': f'Authentication failed: {error_msg}'}), 401
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != 'company_secretary':
            return jsonify({'error': 'Only Company Secretaries can create entities'}), 403
        
        # Get form data
        print(f"Received form data keys: {list(request.form.keys())}")
        print(f"Received files keys: {list(request.files.keys())}")
        
        # Debug: Print all form values
        for key in request.form.keys():
            print(f"  {key}: {request.form.get(key)}")
        
        company_name = request.form.get('company_name', '').strip()
        pan = request.form.get('pan', '').strip().upper()
        gstin = request.form.get('gstin', '').strip().upper()
        company_type = request.form.get('company_type', '').strip()
        address = request.form.get('address', '').strip()
        contact = request.form.get('contact', '').strip()
        cin = request.form.get('cin', '').strip().upper() if request.form.get('cin') else None
        
        print(f"Parsed form data - Company: {company_name}, PAN: {pan}, GSTIN: {gstin}")
        incorporation_date = request.form.get('incorporation_date', '').strip()
        fy_start = request.form.get('fy_start', '').strip()
        fy_end = request.form.get('fy_end', '').strip()
        owner = request.form.get('owner', '').strip()
        
        # Validation
        required_fields = ['company_name', 'pan', 'gstin', 'company_type', 'address']
        if not all(request.form.get(field, '').strip() for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if PAN or GSTIN already exists
        if Entity.query.filter_by(pan=pan).first():
            return jsonify({'error': 'An entity with this PAN already exists'}), 400
        
        if Entity.query.filter_by(gstin=gstin).first():
            return jsonify({'error': 'An entity with this GSTIN already exists'}), 400
        
        # Parse dates safely
        parsed_incorporation_date = None
        parsed_fy_start = None
        parsed_fy_end = None
        
        try:
            if incorporation_date:
                parsed_incorporation_date = datetime.strptime(incorporation_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid incorporation date format'}), 400
        
        try:
            if fy_start:
                parsed_fy_start = datetime.strptime(fy_start, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid financial year start date format'}), 400
        
        try:
            if fy_end:
                parsed_fy_end = datetime.strptime(fy_end, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid financial year end date format'}), 400
        
        # Create entity
        entity = Entity(
            company_name=company_name,
            pan=pan,
            gstin=gstin,
            company_type=company_type,
            address=address,
            contact=contact if contact else None,
            cin=cin,
            incorporation_date=parsed_incorporation_date,
            fy_start=parsed_fy_start,
            fy_end=parsed_fy_end,
            owner=owner if owner else None,
            secretary_id=user_id,
            status='pending_approval'
        )
        db.session.add(entity)
        db.session.flush()  # Get the entity ID without committing
        
        # Handle file uploads
        uploaded_docs = []
        print(f"Files in request: {list(request.files.keys())}")
        print(f"Form data keys: {list(request.form.keys())}")
        
        if 'files[]' in request.files:
            files = request.files.getlist('files[]')
            categories = request.form.getlist('categories[]')
            print(f"Number of files: {len(files)}, Number of categories: {len(categories)}")
            
            for file, category in zip(files, categories):
                if file and file.filename and allowed_file(file.filename):
                    print(f"Processing file: {file.filename}, Category: {category}")
                    # Create upload folder using app config
                    from flask import current_app
                    base_upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
                    upload_folder = os.path.join(base_upload_folder, f'entity_{entity.id}', 'permanent')
                    os.makedirs(upload_folder, exist_ok=True)
                    
                    # Save file
                    filename = secure_filename(file.filename)
                    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S_')
                    filename = timestamp + filename
                    
                    file_path = os.path.join(upload_folder, filename)
                    file.save(file_path)
                    
                    # Get file size
                    file_size = os.path.getsize(file_path)
                    
                    # Create document record
                    doc = PermanentDocument(
                        entity_id=entity.id,
                        document_type=category,
                        file_path=file_path,
                        file_name=filename,
                        file_size=file_size,
                        uploaded_by=user_id
                    )
                    db.session.add(doc)
                    uploaded_docs.append(filename)
        
        db.session.commit()
        
        log_audit(user_id, 'create_entity', 'entity', entity.id, 
                 f'Created entity: {company_name} with {len(uploaded_docs)} documents')
        
        return jsonify({
            'message': 'Entity created successfully and pending approval',
            'entity': {
                'id': entity.id,
                'company_name': entity.company_name,
                'pan': entity.pan,
                'gstin': entity.gstin,
                'status': entity.status,
                'documents_uploaded': len(uploaded_docs)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error creating entity: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to create entity: {str(e)}'}), 500

@entities_bp.route('/my-entities', methods=['GET'])
@jwt_required()
def get_my_entities():
    """Get entities owned or assigned to the user"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role == 'company_secretary':
            # Get entities created by this secretary
            entities = Entity.query.filter_by(secretary_id=user_id).all()
            result_entities = [
                {
                    'id': e.id,
                    'company_name': e.company_name,
                    'pan': e.pan,
                    'gstin': e.gstin,
                    'company_type': e.company_type,
                    'address': e.address,
                    'status': e.status,
                    'created_at': e.created_at.isoformat() if e.created_at else None
                }
                for e in entities
            ]
        elif user.role == 'accountant':
            # Get entities assigned to this accountant with access_type
            result_entities = []
            for assignment in user.assigned_entities:
                e = assignment.entity
                result_entities.append({
                    'id': e.id,
                    'company_name': e.company_name,
                    'pan': e.pan,
                    'gstin': e.gstin,
                    'company_type': e.company_type,
                    'address': e.address,
                    'status': e.status,
                    'created_at': e.created_at.isoformat() if e.created_at else None,
                    'access_type': assignment.access_type  # Include access type for accountants
                })
        else:
            # Super admin gets all entities
            entities = Entity.query.all()
            result_entities = [
                {
                    'id': e.id,
                    'company_name': e.company_name,
                    'pan': e.pan,
                    'gstin': e.gstin,
                    'company_type': e.company_type,
                    'address': e.address,
                    'status': e.status,
                    'created_at': e.created_at.isoformat() if e.created_at else None
                }
                for e in entities
            ]
        
        return jsonify({
            'entities': result_entities
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@entities_bp.route('/<int:entity_id>', methods=['GET'])
@jwt_required()
def get_entity(entity_id):
    """Get a specific entity"""
    try:
        entity = Entity.query.get(entity_id)
        
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        # Check user access
        if user.role == 'company_secretary' and entity.secretary_id != user_id:
            return jsonify({'error': 'You can only view your own entities'}), 403
        elif user.role == 'accountant':
            # Check if accountant is assigned to entity
            assigned = any(a.entity_id == entity_id for a in user.assigned_entities)
            if not assigned and user.role != 'super_admin':
                return jsonify({'error': 'You are not assigned to this entity'}), 403
        
        return jsonify({
            'entity': {
                'id': entity.id,
                'company_name': entity.company_name,
                'pan': entity.pan,
                'gstin': entity.gstin,
                'company_type': entity.company_type,
                'address': entity.address,
                'status': entity.status,
                'created_at': entity.created_at.isoformat() if entity.created_at else None,
                'approved_at': entity.approved_at.isoformat() if entity.approved_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@entities_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_entities():
    """Get all pending entities (Admin only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user or user.role != 'super_admin':
            return jsonify({'error': 'Only Super Admins can view pending entities'}), 403
        
        entities = Entity.query.filter_by(status='pending_approval').all()
        
        return jsonify({
            'entities': [
                {
                    'id': e.id,
                    'company_name': e.company_name,
                    'pan': e.pan,
                    'gstin': e.gstin,
                    'company_type': e.company_type,
                    'address': e.address,
                    'status': e.status,
                    'secretary_email': e.secretary.email if e.secretary else None,
                    'secretary': {
                        'email': e.secretary.email if e.secretary else None,
                        'id': e.secretary.id if e.secretary else None
                    },
                    'documents': [
                        {
                            'id': doc.id,
                            'document_type': doc.document_type,
                            'file_name': doc.file_name,
                            'file_size': doc.file_size,
                            'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
                        }
                        for doc in e.permanent_documents
                    ],
                    'created_at': e.created_at.isoformat() if e.created_at else None
                }
                for e in entities
            ]
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching pending entities: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@entities_bp.route('/<int:entity_id>/approve', methods=['POST'])
@jwt_required()
def approve_entity(entity_id):
    """Approve an entity (Admin only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user or user.role != 'super_admin':
            return jsonify({'error': 'Only Super Admins can approve entities'}), 403
        
        entity = Entity.query.get(entity_id)
        
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if entity.status != 'pending_approval':
            return jsonify({'error': 'Entity is not pending approval'}), 400
        
        data = request.get_json()
        remarks = data.get('remarks', '')
        
        entity.status = 'active'
        entity.approved_at = datetime.utcnow()
        entity.approved_by = user_id
        if remarks:
            entity.admin_remarks = remarks
        
        db.session.commit()
        
        log_audit(user_id, 'approve_entity', 'entity', entity_id, f'Approved entity: {entity.company_name}')
        
        return jsonify({
            'message': 'Entity approved successfully',
            'entity': {
                'id': entity.id,
                'company_name': entity.company_name,
                'status': entity.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@entities_bp.route('/<int:entity_id>/reject', methods=['POST'])
@jwt_required()
def reject_entity(entity_id):
    """Reject an entity (Admin only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user or user.role != 'super_admin':
            return jsonify({'error': 'Only Super Admins can reject entities'}), 403
        
        entity = Entity.query.get(entity_id)
        
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if entity.status != 'pending_approval':
            return jsonify({'error': 'Entity is not pending approval'}), 400
        
        data = request.get_json()
        remarks = data.get('remarks', '')
        
        entity.status = 'rejected'
        entity.approved_by = user_id
        if remarks:
            entity.admin_remarks = remarks
        
        db.session.commit()
        
        log_audit(user_id, 'reject_entity', 'entity', entity_id, f'Rejected entity: {entity.company_name}')
        
        return jsonify({
            'message': 'Entity rejected',
            'entity': {
                'id': entity.id,
                'company_name': entity.company_name,
                'status': entity.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
