"""Initialize database and verify all tables exist"""
from app import app
from database import db, User
from werkzeug.security import generate_password_hash

with app.app_context():
    # Create all tables
    db.create_all()
    print("[OK] Database tables created/verified successfully")
    
    # Verify tables exist
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"[OK] Found {len(tables)} tables: {', '.join(tables)}")
    
    # Create default admin if not exists
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
        print("[OK] Default admin user created: admin@gmfinance.com / admin123")
    else:
        print("[OK] Default admin user already exists")
    
    print("\n[OK] Database initialization complete!")
