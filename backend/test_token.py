"""Test JWT token creation and validation"""
from app import app
from flask_jwt_extended import create_access_token, decode_token
from database import db, User

with app.app_context():
    print("=== TESTING JWT TOKEN CREATION ===\n")
    
    # Get a test user
    user = User.query.filter_by(role='company_secretary').first()
    
    if not user:
        print("ERROR: No company secretary found")
        exit(1)
    
    print(f"Testing with user: {user.email} (ID: {user.id}, type: {type(user.id)})")
    
    # Test 1: Create token with string identity
    try:
        token = create_access_token(identity=str(user.id))
        print(f"\n[OK] Token created successfully")
        print(f"Token (first 50 chars): {token[:50]}...")
        
        # Test 2: Decode the token
        decoded = decode_token(token)
        print(f"\n[OK] Token decoded successfully")
        print(f"Decoded identity: {decoded['sub']} (type: {type(decoded['sub'])})")
        print(f"Full decoded: {decoded}")
        
        # Test 3: Verify it's a string
        if isinstance(decoded['sub'], str):
            print(f"\n[OK] Identity is a string as required")
        else:
            print(f"\n[ERROR] Identity is not a string! Type: {type(decoded['sub'])}")
        
        # Test 4: Convert back to int
        user_id_from_token = int(decoded['sub'])
        print(f"\n[OK] Converted back to int: {user_id_from_token}")
        
        if user_id_from_token == user.id:
            print(f"\n[OK] User ID matches! Token is working correctly.")
        else:
            print(f"\n[ERROR] User ID mismatch! Expected {user.id}, got {user_id_from_token}")
            
    except Exception as e:
        print(f"\n[ERROR] Token creation/decoding failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n[OK] Test complete!")
