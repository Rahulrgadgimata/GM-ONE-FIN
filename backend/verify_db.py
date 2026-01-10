"""Verify database structure and show current data"""
from app import app
from database import db, User, Entity, PermanentDocument, PeriodicDocument

with app.app_context():
    print("=== DATABASE VERIFICATION ===\n")
    
    # Check tables
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {len(tables)}")
    for table in tables:
        print(f"  - {table}")
    
    print("\n=== TABLE STRUCTURES ===")
    for table_name in tables:
        print(f"\n{table_name}:")
        columns = inspector.get_columns(table_name)
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")
    
    print("\n=== CURRENT DATA ===")
    
    # Users
    user_count = User.query.count()
    print(f"\nUsers: {user_count}")
    if user_count > 0:
        users = User.query.all()
        for user in users:
            print(f"  - ID: {user.id}, {user.email} ({user.role})")
    
    # Entities
    entity_count = Entity.query.count()
    print(f"\nEntities: {entity_count}")
    if entity_count > 0:
        entities = Entity.query.all()
        for entity in entities:
            secretary = User.query.get(entity.secretary_id)
            secretary_email = secretary.email if secretary else 'None'
            print(f"  - ID: {entity.id}, {entity.company_name} (PAN: {entity.pan}, Status: {entity.status}, Secretary ID: {entity.secretary_id}, Email: {secretary_email})")
    
    # Entity Assignments
    from database import EntityAssignment
    assignment_count = EntityAssignment.query.count()
    print(f"\nEntity Assignments: {assignment_count}")
    if assignment_count > 0:
        assignments = EntityAssignment.query.all()
        for assign in assignments:
            accountant = User.query.get(assign.accountant_id)
            entity = Entity.query.get(assign.entity_id)
            accountant_email = accountant.email if accountant else 'None'
            entity_name = entity.company_name if entity else 'None'
            print(f"  - Accountant: {accountant_email}, Entity: {entity_name}, Access: {assign.access_type}")
    
    # Permanent Documents
    perm_doc_count = PermanentDocument.query.count()
    print(f"\nPermanent Documents: {perm_doc_count}")
    if perm_doc_count > 0:
        docs = PermanentDocument.query.all()
        for doc in docs:
            entity = Entity.query.get(doc.entity_id)
            uploader = User.query.get(doc.uploaded_by)
            entity_name = entity.company_name if entity else 'None'
            uploader_email = uploader.email if uploader else 'None'
            print(f"  - {doc.document_type}: {doc.file_name} (Entity: {entity_name}, Uploaded by: {uploader_email})")
    
    # Periodic Documents
    periodic_doc_count = PeriodicDocument.query.count()
    print(f"\nPeriodic Documents: {periodic_doc_count}")
    if periodic_doc_count > 0:
        docs = PeriodicDocument.query.all()
        for doc in docs:
            entity = Entity.query.get(doc.entity_id)
            uploader = User.query.get(doc.uploaded_by)
            entity_name = entity.company_name if entity else 'None'
            uploader_email = uploader.email if uploader else 'None'
            print(f"  - {doc.document_type}: {doc.file_name} (Entity: {entity_name}, FY: {doc.financial_year}, Uploaded by: {uploader_email})")
    
    print("\n=== DATABASE FILE INFO ===")
    import os
    db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        print(f"Database file: {db_path}")
        print(f"File size: {size / 1024:.2f} KB")
    else:
        print(f"Database file not found at: {db_path}")
    
    print("\n[OK] Database verification complete!")
