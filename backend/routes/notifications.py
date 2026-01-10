from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for current user"""
    try:
        user_id = get_jwt_identity()
        
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(user_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(Notification.created_at.desc()).limit(100).all()
        
        result = []
        for notif in notifications:
            result.append({
                'id': notif.id,
                'title': notif.title,
                'message': notif.message,
                'type': notif.type,
                'is_read': notif.is_read,
                'created_at': notif.created_at.isoformat(),
                'related_entity_id': notif.related_entity_id
            })
        
        return jsonify({'notifications': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    try:
        user_id = get_jwt_identity()
        count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return jsonify({'count': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(notif_id):
    """Mark notification as read"""
    try:
        user_id = get_jwt_identity()
        notification = Notification.query.get(notif_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        if notification.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-all-read', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read"""
    try:
        user_id = get_jwt_identity()
        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

