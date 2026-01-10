"""Test entity creation via API"""
import requests
import json

# Test login first
print("=== TESTING ENTITY CREATION API ===\n")

# Step 1: Login
print("Step 1: Logging in...")
login_data = {
    "email": "rohanrgadgimata6364@gmail.com",
    "password": "your_password_here"  # User needs to provide actual password
}

# For testing, let's use the test user
login_data = {
    "email": "test1585@example.com", 
    "password": "test123"  # Assuming this is the password
}

login_response = requests.post('http://localhost:5000/api/auth/login', json=login_data)

if login_response.status_code != 200:
    print(f"[ERROR] Login failed: {login_response.status_code}")
    print(f"Response: {login_response.text}")
    exit(1)

login_result = login_response.json()
token = login_result.get('token')
print(f"[OK] Login successful")
print(f"Token received: {token[:50]}...")

# Step 2: Decode token to verify format
from flask_jwt_extended import decode_token
decoded = decode_token(token)
print(f"\n[OK] Token decoded")
print(f"Token subject (identity): {decoded['sub']} (type: {type(decoded['sub'])})")

if not isinstance(decoded['sub'], str):
    print(f"[ERROR] Token subject is not a string!")
    exit(1)

# Step 3: Create entity
print(f"\nStep 2: Creating entity...")
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'  # For testing without files
}

# Create FormData for multipart
form_data = {
    'company_name': 'Test Company API',
    'pan': 'TESTP9999Z',
    'gstin': '29TESTP9999Z1Z5',
    'company_type': 'Private Limited',
    'address': '123 Test Street',
    'owner': 'Test Owner'
}

# Actually, we need to use multipart/form-data
files = {}
create_response = requests.post(
    'http://localhost:5000/api/entities/create',
    headers={'Authorization': f'Bearer {token}'},
    data=form_data,
    files=files
)

print(f"Response status: {create_response.status_code}")
print(f"Response: {create_response.text}")

if create_response.status_code == 201:
    print(f"\n[OK] Entity created successfully!")
    result = create_response.json()
    print(f"Entity ID: {result.get('entity', {}).get('id')}")
else:
    print(f"\n[ERROR] Entity creation failed")
    print(f"Error: {create_response.text}")

print("\n[OK] Test complete!")
