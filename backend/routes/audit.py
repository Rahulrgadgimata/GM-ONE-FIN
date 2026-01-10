from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, User, AuditLog
from datetime import datetime, timedelta

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """Get audit logs (Super Admin only)"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        user = User.query.get(user_id)
        
        if user.role != 'super_admin':
            return jsonify({'error': 'Only Super Admin can view audit logs'}), 403
        
        # Get query parameters
        action = request.args.get('action')
        resource_type = request.args.get('resource_type')
        user_filter = request.args.get('user_id')
        days = int(request.args.get('days', 30))
        
        # Build query
        query = AuditLog.query
        
        if action:
            query = query.filter_by(action=action)
        if resource_type:
            query = query.filter_by(resource_type=resource_type)
        if user_filter:
            query = query.filter_by(user_id=int(user_filter))
        
        # Filter by date
        date_from = datetime.utcnow() - timedelta(days=days)
        query = query.filter(AuditLog.created_at >= date_from)
        
        logs = query.order_by(AuditLog.created_at.desc()).limit(1000).all()
        
        result = []
        for log in logs:
            log_user = User.query.get(log.user_id)
            result.append({
                'id': log.id,
                'user': {
                    'id': log.user_id,
                    'email': log_user.email if log_user else 'Unknown'
                },
                'action': log.action,
                'resource_type': log.resource_type,
                'resource_id': log.resource_id,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'details': log.details,
                'created_at': log.created_at.isoformat()
            })
        
        return jsonify({'logs': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@audit_bp.route('/my-logs', methods=['GET'])
@jwt_required()
def get_my_audit_logs():
    """Get current user's audit logs"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str) if isinstance(user_id_str, str) else user_id_str
        
        days = int(request.args.get('days', 30))
        date_from = datetime.utcnow() - timedelta(days=days)
        
        logs = AuditLog.query.filter_by(user_id=user_id).filter(
            AuditLog.created_at >= date_from
        ).order_by(AuditLog.created_at.desc()).limit(100).all()
        
        result = []
        for log in logs:
            result.append({
                'id': log.id,
                'action': log.action,
                'resource_type': log.resource_type,
                'resource_id': log.resource_id,
                'ip_address': log.ip_address,
                'details': log.details,
                'created_at': log.created_at.isoformat()
            })
        
        return jsonify({'logs': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

