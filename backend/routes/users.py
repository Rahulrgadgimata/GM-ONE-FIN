from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from database import db, User, Entity, EntityAssignment, AuditLog, PermanentDocument, PeriodicDocument

users_bp = Blueprint('users', __name__)

def log_audit(user_id, action, resource_type=None, resource_id=None, details=None):
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

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (Super Admin only)"""
    try:
        print("get_users called")
        user_id_str = get_jwt_identity()
        print(f"user_id_str: {user_id_str}")
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        print(f"user_id: {user_id}")
        user = User.query.get(user_id)
        print(f"user: {user}, role: {user.role if user else None}")
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can view users'}), 403
        
        users = User.query.all()
        print(f"Found {len(users)} users")
        
        result = []
        for u in users:
            result.append({
                'id': u.id,
                'email': u.email,
                'role': u.role,
                'pan': u.pan,
                'gstin': u.gstin,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat() if u.created_at else None,
                'last_login': u.last_login.isoformat() if u.last_login else None
            })
        
        print(f"Returning {len(result)} users to super admin")
        return jsonify({'users': result}), 200
        
    except (ValueError, TypeError) as e:
        return jsonify({'error': 'Invalid token format'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/create', methods=['POST'])
@jwt_required()
def create_user():
    """Create user (Super Admin only)"""
    try:
        user_id = get_jwt_identity()
        admin = User.query.get(user_id)
        
        if admin.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can create users'}), 403
        
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = data.get('role', '').strip()
        pan = data.get('pan', '').strip().upper() if data.get('pan') else None
        gstin = data.get('gstin', '').strip().upper() if data.get('gstin') else None
        
        if not all([email, password, role]):
            return jsonify({'error': 'Email, password, and role are required'}), 400
        
        if role not in ['super_admin', 'company_secretary', 'accountant']:
            return jsonify({'error': 'Invalid role'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            email=email,
            password_hash=generate_password_hash(password),
            role=role,
            pan=pan,
            gstin=gstin,
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        
        log_audit(user_id, 'create', 'user', user.id, f'Created user: {email} with role {role}')
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/toggle-active', methods=['POST'])
@jwt_required()
def toggle_user_active(user_id):
    """Activate/deactivate user (Super Admin only)"""
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        
        if admin.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can modify users'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.id == admin_id:
            return jsonify({'error': 'Cannot deactivate yourself'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        action = 'activated' if user.is_active else 'deactivated'
        log_audit(admin_id, 'update', 'user', user_id, f'{action.capitalize()} user: {user.email}')
        
        return jsonify({
            'message': f'User {action} successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/assign-entity', methods=['POST'])
@jwt_required()
def assign_entity():
    """Assign entity to accountant (Super Admin only)"""
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        
        if admin.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can assign entities'}), 403
        
        data = request.get_json()
        entity_id = data.get('entity_id')
        accountant_id = data.get('accountant_id')
        
        if not all([entity_id, accountant_id]):
            return jsonify({'error': 'Entity ID and Accountant ID are required'}), 400
        
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if entity.status != 'active':
            return jsonify({'error': 'Can only assign active entities'}), 400
        
        accountant = User.query.get(accountant_id)
        if not accountant:
            return jsonify({'error': 'Accountant not found'}), 404
        
        if accountant.role != 'accountant':
            return jsonify({'error': 'User is not an accountant'}), 400
        
        # Check if assignment already exists
        existing = EntityAssignment.query.filter_by(
            entity_id=entity_id,
            accountant_id=accountant_id
        ).first()
        
        if existing:
            return jsonify({'error': 'Entity already assigned to this accountant'}), 400
        
        access_type = data.get('access_type', 'all')
        if access_type not in ['monthly', 'quarterly', 'yearly', 'all']:
            access_type = 'all'
        
        assignment = EntityAssignment(
            entity_id=entity_id,
            accountant_id=accountant_id,
            assigned_by=admin_id,
            access_type=access_type
        )
        db.session.add(assignment)
        db.session.commit()
        
        log_audit(admin_id, 'assign', 'entity', entity_id, f'Assigned entity to accountant {accountant.email}')
        
        return jsonify({
            'message': 'Entity assigned successfully',
            'assignment': {
                'id': assignment.id,
                'entity_id': entity_id,
                'accountant_id': accountant_id
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/create-accountant', methods=['POST'])
@jwt_required()
def create_accountant():
    """Create accountant and assign to entity (Company Secretary only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        secretary = User.query.get(user_id)
        
        if not secretary or secretary.role != 'company_secretary':
            return jsonify({'error': 'Only Company Secretaries can create accountants'}), 403
        
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        entity_id = data.get('entity_id')
        access_type = data.get('access_type', 'all')  # monthly, quarterly, yearly, all
        
        # Validation
        if not all([name, email, password, entity_id]):
            return jsonify({'error': 'Name, email, password, and entity are required'}), 400
        
        if access_type not in ['monthly', 'quarterly', 'yearly', 'all']:
            access_type = 'all'
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Verify entity exists and belongs to this secretary
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if entity.secretary_id != user_id:
            return jsonify({'error': 'You can only create accountants for your own entities'}), 403
        
        if entity.status != 'active':
            return jsonify({'error': 'Can only assign accountants to active entities'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create accountant user
        accountant = User(
            email=email,
            password_hash=generate_password_hash(password),
            role='accountant',
            is_active=True
        )
        db.session.add(accountant)
        db.session.flush()  # Get the accountant ID
        
        # Create entity assignment
        assignment = EntityAssignment(
            entity_id=entity_id,
            accountant_id=accountant.id,
            assigned_by=user_id,
            access_type=access_type
        )
        db.session.add(assignment)
        db.session.commit()
        
        log_audit(user_id, 'create_accountant', 'user', accountant.id, 
                 f'Created accountant {email} for entity {entity.company_name} with access: {access_type}')
        
        return jsonify({
            'message': 'Accountant created and assigned successfully',
            'accountant': {
                'id': accountant.id,
                'name': name,
                'email': accountant.email,
                'role': accountant.role,
                'entity_id': entity_id,
                'entity_name': entity.company_name,
                'access_type': access_type
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error creating accountant: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@users_bp.route('/entity/<int:entity_id>/accountants', methods=['GET'])
@jwt_required()
def get_entity_accountants(entity_id):
    """Get accountants assigned to an entity (Company Secretary of that entity only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        # Check access - Company Secretary can see accountants for their entities
        if user.role == 'company_secretary' and entity.secretary_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        elif user.role != 'super_admin' and user.role != 'company_secretary':
            return jsonify({'error': 'Access denied'}), 403
        
        assignments = EntityAssignment.query.filter_by(entity_id=entity_id).all()
        
        accountants = []
        for assignment in assignments:
            accountant = User.query.get(assignment.accountant_id)
            if accountant:
                accountants.append({
                    'id': accountant.id,
                    'email': accountant.email,
                    'is_active': accountant.is_active,
                    'assigned_at': assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                    'access_type': assignment.access_type
                })
        
        return jsonify({
            'accountants': accountants
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching accountants: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@users_bp.route('/unassign-entity', methods=['POST'])
@jwt_required()
def unassign_entity():
    """Unassign entity from accountant (Super Admin only)"""
    try:
        admin_id_str = get_jwt_identity()
        admin_id = int(admin_id_str) if isinstance(admin_id_str, str) else admin_id_str
        admin = User.query.get(admin_id)
        
        if admin.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can unassign entities'}), 403
        
        data = request.get_json()
        entity_id = data.get('entity_id')
        accountant_id = data.get('accountant_id')
        
        assignment = EntityAssignment.query.filter_by(
            entity_id=entity_id,
            accountant_id=accountant_id
        ).first()
        
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        db.session.delete(assignment)
        db.session.commit()
        
        log_audit(admin_id, 'unassign', 'entity', entity_id, f'Unassigned entity from accountant {accountant_id}')
        
        return jsonify({'message': 'Entity unassigned successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/documents', methods=['GET'])
@jwt_required()
def get_user_documents(user_id):
    """Get all documents uploaded by a user (Super Admin only)"""
    try:
        admin_id_str = get_jwt_identity()
        admin_id = int(admin_id_str) if isinstance(admin_id_str, str) else admin_id_str
        admin = User.query.get(admin_id)
        
        if not admin:
            return jsonify({'error': 'Admin user not found'}), 404
        
        if admin.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can view user documents'}), 403
        
        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get permanent documents uploaded by this user
        permanent_docs = PermanentDocument.query.filter_by(uploaded_by=user_id).all()
        
        # Get periodic documents uploaded by this user
        periodic_docs = PeriodicDocument.query.filter_by(uploaded_by=user_id).all()
        
        return jsonify({
            'permanent_documents': [
                {
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'file_name': doc.file_name,
                    'file_size': doc.file_size,
                    'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                    'entity_id': doc.entity_id,
                    'entity_name': doc.entity.company_name if doc.entity else 'Unknown'
                }
                for doc in permanent_docs
            ],
            'periodic_documents': [
                {
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'file_name': doc.file_name,
                    'file_size': doc.file_size,
                    'period': doc.period,
                    'period_value': doc.period_value,
                    'financial_year': doc.financial_year,
                    'version': doc.version,
                    'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                    'entity_id': doc.entity_id,
                    'entity_name': doc.entity.company_name if doc.entity else 'Unknown'
                }
                for doc in periodic_docs
            ]
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching user documents: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/assigned-entities', methods=['GET'])
@jwt_required()
def get_user_assigned_entities(user_id):
    """Get entities assigned to a user (Super Admin only)"""
    try:
        print(f"get_user_assigned_entities called for user_id: {user_id}")
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str) if isinstance(current_user_id_str, str) else current_user_id_str
        current_user = User.query.get(current_user_id)
        print(f"Current user: {current_user}, role: {current_user.role if current_user else None}")
        
        if not current_user or current_user.role != 'super_admin':
            print("Access denied")
            return jsonify({'error': 'Access denied'}), 403
        
        target_user = User.query.get(user_id)
        print(f"Target user: {target_user}, role: {target_user.role if target_user else None}")
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        assigned_entities = []
        if target_user.role == 'accountant':
            for assignment in target_user.assigned_entities:
                assigned_entities.append({
                    'id': assignment.entity.id,
                    'company_name': assignment.entity.company_name,
                    'pan': assignment.entity.pan,
                    'gstin': assignment.entity.gstin,
                    'status': assignment.entity.status,
                    'access_type': assignment.access_type
                })
        elif target_user.role == 'company_secretary':
            for entity in target_user.entities:
                assigned_entities.append({
                    'id': entity.id,
                    'company_name': entity.company_name,
                    'pan': entity.pan,
                    'gstin': entity.gstin,
                    'status': entity.status,
                    'access_type': 'owner'
                })
        
        print(f"Returning {len(assigned_entities)} assigned entities")
        return jsonify({'entities': assigned_entities}), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching assigned entities: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
