
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, Entity, PermanentDocument, PeriodicDocument, User, AuditLog
from datetime import datetime
from werkzeug.utils import secure_filename
import os

documents_bp = Blueprint('documents', __name__)

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

@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload a periodic document"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get form data
        entity_id = request.form.get('entity_id')
        period_type = request.form.get('period') or request.form.get('period_type')  # Support both 'period' and 'period_type'
        period_value = request.form.get('period_value')  # e.g., "January", "Q1", "FY2023-24"
        document_type = request.form.get('document_type')
        financial_year = request.form.get('financial_year', '')
        
        if not all([entity_id, period_type, period_value, document_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify entity exists and user has access
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if user.role == 'company_secretary' and entity.secretary_id != user_id:
            return jsonify({'error': 'You can only upload documents for your entities'}), 403
        elif user.role == 'accountant':
            # Check if accountant is assigned to entity
            assigned = False
            for assignment in user.assigned_entities:
                if assignment.entity_id == int(entity_id):
                    assigned = True
                    break
            if not assigned:
                return jsonify({'error': 'You are not assigned to this entity'}), 403
        elif user.role != 'super_admin':
            return jsonify({'error': 'You do not have permission to upload documents'}), 403
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        # Use configured upload folder
        from flask import current_app
        base_upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        entity_upload_folder = os.path.join(base_upload_folder, f'entity_{entity_id}', 'periodic')
        os.makedirs(entity_upload_folder, exist_ok=True)
        
        file_path = os.path.join(entity_upload_folder, filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Check for existing document with same entity, period, period_value, document_type, and financial_year
        # If exists, increment version number
        existing_doc = PeriodicDocument.query.filter_by(
            entity_id=int(entity_id),
            period=period_type,
            period_value=period_value,
            document_type=document_type,
            financial_year=financial_year
        ).order_by(PeriodicDocument.version.desc()).first()
        
        version = 1
        if existing_doc:
            version = existing_doc.version + 1
        
        # Create document record
        doc = PeriodicDocument(
            entity_id=int(entity_id),
            document_type=document_type,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            period=period_type,  # Use 'period' field as per database model
            period_value=period_value,
            financial_year=financial_year,
            uploaded_by=user_id,
            version=version
        )
        
        db.session.add(doc)
        db.session.commit()
        
        log_audit(user_id, 'upload_document', 'document', doc.id, f'Uploaded document: {filename}')
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': {
                'id': doc.id,
                'file_name': doc.file_name,
                'document_type': doc.document_type,
                'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/vault', methods=['GET'])
@jwt_required()
def get_vault():
    """Get documents in vault with filtering"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get filter parameters
        entity_id = request.args.get('entity_id')
        financial_year = request.args.get('financial_year')
        document_type = request.args.get('document_type')
        
        # Build query
        query = PeriodicDocument.query
        
        # Filter by user access
        if user.role == 'company_secretary':
            # Get documents for entities owned by secretary
            entity_ids = [e.id for e in user.entities]
            query = query.filter(PeriodicDocument.entity_id.in_(entity_ids) if entity_ids else False)
        elif user.role == 'accountant':
            # Get documents for assigned entities
            entity_ids = [a.entity_id for a in user.assigned_entities]
            query = query.filter(PeriodicDocument.entity_id.in_(entity_ids) if entity_ids else False)
        # super_admin sees all
        
        # Apply additional filters
        if entity_id:
            query = query.filter_by(entity_id=int(entity_id))
        
        if financial_year:
            query = query.filter_by(financial_year=financial_year)
        
        if document_type:
            query = query.filter_by(document_type=document_type)
        
        documents = query.order_by(PeriodicDocument.uploaded_at.desc()).all()
        
        # Also get permanent documents for the same entities
        perm_query = PermanentDocument.query
        
        if user.role == 'company_secretary':
            perm_query = perm_query.filter(PermanentDocument.entity_id.in_(entity_ids) if entity_ids else False)
        elif user.role == 'accountant':
            perm_query = perm_query.filter(PermanentDocument.entity_id.in_(entity_ids) if entity_ids else False)
        # super_admin sees all
        
        if entity_id:
            perm_query = perm_query.filter_by(entity_id=int(entity_id))
        
        permanent_docs = perm_query.order_by(PermanentDocument.uploaded_at.desc()).all()
        
        vault_items = []
        
        # Add periodic documents
        for d in documents:
            vault_items.append({
                'id': d.id,
                'entity_id': d.entity_id,
                'entity_name': d.entity.company_name if d.entity else None,
                'document_type': d.document_type,
                'file_name': d.file_name,
                'period_type': d.period,
                'period_value': d.period_value,
                'financial_year': d.financial_year,
                'version': d.version,
                'uploaded_at': d.uploaded_at.isoformat() if d.uploaded_at else None,
                'uploaded_by_email': d.uploader.email if d.uploader else None,
                'doc_type': 'periodic'
            })
        
        # Add permanent documents
        for d in permanent_docs:
            vault_items.append({
                'id': d.id,
                'entity_id': d.entity_id,
                'entity_name': d.entity.company_name if d.entity else None,
                'document_type': d.document_type,
                'file_name': d.file_name,
                'period_type': 'permanent',
                'period_value': d.document_type,
                'financial_year': '',
                'version': 1,
                'uploaded_at': d.uploaded_at.isoformat() if d.uploaded_at else None,
                'uploaded_by_email': d.uploader.email if d.uploader else None,
                'doc_type': 'permanent'
            })
        
        return jsonify({
            'vault': vault_items
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/accountant-status', methods=['GET'])
@jwt_required()
def get_accountant_status():
    """Get document submission status for accountant dashboard"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user or user.role != 'accountant':
            return jsonify({'error': 'Access denied'}), 403
        
        # Get assigned entities
        assigned_entity_ids = [a.entity_id for a in user.assigned_entities]
        
        if not assigned_entity_ids:
            return jsonify({'statuses': []}), 200
        
        # Get current financial year
        from datetime import datetime
        now = datetime.utcnow()
        current_year = now.year
        current_month = now.month
        
        # Financial year starts in April
        if current_month >= 4:
            fy_start = f"{current_year}-04-01"
            fy_end = f"{current_year + 1}-03-31"
            fy_label = f"{current_year}-{current_year + 1}"
        else:
            fy_start = f"{current_year - 1}-04-01"
            fy_end = f"{current_year}-03-31"
            fy_label = f"{current_year - 1}-{current_year}"
        
        statuses = []
        
        for entity_id in assigned_entity_ids:
            entity = Entity.query.get(entity_id)
            if not entity:
                continue
            
            # Count submissions for current FY
            monthly_count = PeriodicDocument.query.filter_by(
                entity_id=entity_id,
                financial_year=fy_label,
                period='monthly'
            ).count()
            
            quarterly_count = PeriodicDocument.query.filter_by(
                entity_id=entity_id,
                financial_year=fy_label,
                period='quarterly'
            ).count()
            
            yearly_count = PeriodicDocument.query.filter_by(
                entity_id=entity_id,
                financial_year=fy_label,
                period='yearly'
            ).count()
            
            # Get last submission date
            last_doc = PeriodicDocument.query.filter_by(
                entity_id=entity_id,
                financial_year=fy_label
            ).order_by(PeriodicDocument.uploaded_at.desc()).first()
            
            statuses.append({
                'entity_id': entity_id,
                'entity_name': entity.company_name,
                'financial_year': fy_label,
                'monthly_submissions': monthly_count,
                'quarterly_submissions': quarterly_count,
                'yearly_submissions': yearly_count,
                'last_submission': last_doc.uploaded_at.isoformat() if last_doc else None
            })
        
        return jsonify({'statuses': statuses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/permanent/<int:doc_id>/view', methods=['GET'])
@jwt_required()
def view_permanent_document(doc_id):
    """View/Download a permanent document (Super Admin has access to all)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        doc = PermanentDocument.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        # Check access - Super Admin can access all documents
        if user.role != 'super_admin':
            if user.role == 'company_secretary' and doc.entity.secretary_id != user_id:
                return jsonify({'error': 'Access denied'}), 403
            elif user.role == 'accountant':
                assigned = any(a.entity_id == doc.entity_id for a in user.assigned_entities)
                if not assigned:
                    return jsonify({'error': 'Access denied'}), 403
        
        # Check if file exists
        if not os.path.exists(doc.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Log view
        log_audit(user_id, 'view_document', 'document', doc_id, f'Viewed permanent document: {doc.file_name}')
        
        # Send file
        return send_file(
            doc.file_path,
            as_attachment=False,  # View in browser
            download_name=doc.file_name,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        import traceback
        print(f"Error viewing document: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/permanent/<int:doc_id>/download', methods=['GET'])
@jwt_required()
def download_permanent_document(doc_id):
    """Download a permanent document (Super Admin has access to all)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        doc = PermanentDocument.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        # Check access - Super Admin can access all documents
        if user.role != 'super_admin':
            if user.role == 'company_secretary' and doc.entity.secretary_id != user_id:
                return jsonify({'error': 'Access denied'}), 403
            elif user.role == 'accountant':
                assigned = any(a.entity_id == doc.entity_id for a in user.assigned_entities)
                if not assigned:
                    return jsonify({'error': 'Access denied'}), 403
        
        # Check if file exists
        if not os.path.exists(doc.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Log download
        log_audit(user_id, 'download_document', 'document', doc_id, f'Downloaded permanent document: {doc.file_name}')
        
        # Send file for download
        return send_file(
            doc.file_path,
            as_attachment=True,  # Force download
            download_name=doc.file_name,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        import traceback
        print(f"Error downloading document: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/periodic/<int:doc_id>/view', methods=['GET'])
@jwt_required()
def view_periodic_document(doc_id):
    """View/Download a periodic document (Super Admin has access to all)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        doc = PeriodicDocument.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        # Check access - Super Admin can access all documents
        if user.role != 'super_admin':
            if user.role == 'company_secretary' and doc.entity.secretary_id != user_id:
                return jsonify({'error': 'Access denied'}), 403
            elif user.role == 'accountant':
                assigned = any(a.entity_id == doc.entity_id for a in user.assigned_entities)
                if not assigned:
                    return jsonify({'error': 'Access denied'}), 403
        
        # Check if file exists
        if not os.path.exists(doc.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Log view
        log_audit(user_id, 'view_document', 'document', doc_id, f'Viewed periodic document: {doc.file_name}')
        
        # Send file
        return send_file(
            doc.file_path,
            as_attachment=False,  # View in browser
            download_name=doc.file_name,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        import traceback
        print(f"Error viewing document: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/periodic/<int:doc_id>/download', methods=['GET'])
@jwt_required()
def download_periodic_document(doc_id):
    """Download a periodic document (Super Admin has access to all)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        doc = PeriodicDocument.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        # Check access - Super Admin can access all documents
        if user.role != 'super_admin':
            if user.role == 'company_secretary' and doc.entity.secretary_id != user_id:
                return jsonify({'error': 'Access denied'}), 403
            elif user.role == 'accountant':
                assigned = any(a.entity_id == doc.entity_id for a in user.assigned_entities)
                if not assigned:
                    return jsonify({'error': 'Access denied'}), 403
        
        # Check if file exists
        if not os.path.exists(doc.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Log download
        log_audit(user_id, 'download_document', 'document', doc_id, f'Downloaded periodic document: {doc.file_name}')
        
        # Send file for download
        return send_file(
            doc.file_path,
            as_attachment=True,  # Force download
            download_name=doc.file_name,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        import traceback
        print(f"Error downloading document: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/permanent/upload', methods=['POST'])
@jwt_required()
def upload_permanent_document():
    """Upload a permanent document to an entity (Company Secretary only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != 'company_secretary':
            return jsonify({'error': 'Only Company Secretaries can upload permanent documents'}), 403
        
        # Check if file in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get form data
        entity_id = request.form.get('entity_id')
        document_type = request.form.get('document_type')
        
        if not all([entity_id, document_type]):
            return jsonify({'error': 'Entity ID and document type are required'}), 400
        
        # Verify entity exists and belongs to this secretary
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        if entity.secretary_id != user_id:
            return jsonify({'error': 'You can only upload documents for your own entities'}), 403
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        # Use configured upload folder
        base_upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        entity_upload_folder = os.path.join(base_upload_folder, f'entity_{entity_id}', 'permanent')
        os.makedirs(entity_upload_folder, exist_ok=True)
        
        file_path = os.path.join(entity_upload_folder, filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create document record
        doc = PermanentDocument(
            entity_id=int(entity_id),
            document_type=document_type,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            uploaded_by=user_id
        )
        
        db.session.add(doc)
        db.session.commit()
        
        log_audit(user_id, 'upload_permanent_document', 'document', doc.id, f'Uploaded permanent document: {filename}')
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': {
                'id': doc.id,
                'file_name': doc.file_name,
                'document_type': doc.document_type,
                'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error uploading permanent document: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/permanent/<int:entity_id>', methods=['GET'])
@jwt_required()
def get_permanent_documents(entity_id):
    """Get permanent documents for an entity"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        entity = Entity.query.get(entity_id)
        if not entity:
            return jsonify({'error': 'Entity not found'}), 404
        
        # Check access
        if user.role == 'company_secretary' and entity.secretary_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        elif user.role == 'accountant':
            assigned = any(a.entity_id == entity_id for a in user.assigned_entities)
            if not assigned:
                return jsonify({'error': 'Access denied'}), 403
        elif user.role != 'super_admin':
            return jsonify({'error': 'Access denied'}), 403
        
        documents = PermanentDocument.query.filter_by(entity_id=entity_id).all()
        
        return jsonify({
            'documents': [
                {
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'file_name': doc.file_name,
                    'file_size': doc.file_size,
                    'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                    'uploaded_by': doc.uploader.email if doc.uploader else None
                }
                for doc in documents
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/permanent/all', methods=['GET'])
@jwt_required()
def get_all_permanent_documents():
    """Get all permanent documents (Super Admin only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if not user or user.role != 'super_admin':
            return jsonify({'error': 'Access denied'}), 403
        
        documents = PermanentDocument.query.all()
        
        return jsonify({
            'documents': [
                {
                    'id': doc.id,
                    'entity_id': doc.entity_id,
                    'entity_name': doc.entity.company_name if doc.entity else None,
                    'secretary_name': doc.entity.secretary.email if doc.entity and doc.entity.secretary else None,
                    'document_type': doc.document_type,
                    'file_name': doc.file_name,
                    'file_size': doc.file_size,
                    'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                    'uploaded_by_email': doc.uploader.email if doc.uploader else None
                }
                for doc in documents
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
