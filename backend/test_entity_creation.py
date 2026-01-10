"""Test entity creation directly in the database"""
from app import app
from database import db, User, Entity
from werkzeug.security import generate_password_hash
from datetime import datetime

with app.app_context():
    print("=== TESTING ENTITY CREATION ===\n")
    
    # Find a company secretary user
    secretary = User.query.filter_by(role='company_secretary').first()
    
    if not secretary:
        print("ERROR: No company secretary found. Creating one...")
        secretary = User(
            email='test_secretary@test.com',
            password_hash=generate_password_hash('test123'),
            role='company_secretary',
            is_active=True
        )
        db.session.add(secretary)
        db.session.commit()
        print(f"Created test secretary: {secretary.email}")
    
    print(f"Using secretary: {secretary.email} (ID: {secretary.id})\n")
    
    # Try to create a test entity
    test_entity = Entity(
        company_name='Test Company',
        pan='TESTP1234A',
        gstin='29TESTP1234A1Z5',
        company_type='Private Limited',
        address='123 Test Street, Test City',
        contact='1234567890',
        secretary_id=secretary.id,
        status='pending_approval'
    )
    
    try:
        db.session.add(test_entity)
        db.session.commit()
        print(f"[OK] Test entity created successfully!")
        print(f"  - ID: {test_entity.id}")
        print(f"  - Company: {test_entity.company_name}")
        print(f"  - PAN: {test_entity.pan}")
        print(f"  - Status: {test_entity.status}")
        
        # Verify it's in the database
        found = Entity.query.filter_by(pan='TESTP1234A').first()
        if found:
            print(f"\n[OK] Entity verified in database!")
        else:
            print(f"\n[ERROR] Entity not found in database!")
        
        # Clean up - remove test entity
        db.session.delete(test_entity)
        db.session.commit()
        print(f"\n[OK] Test entity cleaned up")
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to create entity: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n[OK] Test complete!")
