#!/usr/bin/env python3
"""
Test script to verify role-based access for Nirmaan AI
This script helps test the dashboard routing and project management functionality
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000"
TEST_EMAIL = "official@test.com"
TEST_PASSWORD = "password123"

def test_role_based_access():
    """Test the role-based dashboard access"""
    
    print("🧪 Testing Nirmaan AI Role-Based Access")
    print("=" * 50)
    
    # Step 1: Register a test official user
    print("\n1. Registering test official user...")
    register_data = {
        "username": "test_official",
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "role": "official"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 201:
            print("✅ Official user registered successfully")
        elif response.status_code == 409:
            print("ℹ️  Official user already exists")
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running on port 5000")
        return
    
    # Step 2: Login as official
    print("\n2. Logging in as official...")
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data['token']
            user = data['user']
            print(f"✅ Login successful! Role: {user['role']}")
            print(f"   User ID: {user['id']}")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return
    
    # Step 3: Test official projects endpoint
    print("\n3. Testing official projects endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/projects/official", headers=headers)
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Retrieved {len(projects)} projects for official")
            for project in projects:
                print(f"   - {project['name']} ({project['status']}) - {project['progress']}%")
        else:
            print(f"❌ Failed to get official projects: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return
    
    # Step 4: Test project update endpoint
    if projects:
        print("\n4. Testing project update endpoint...")
        project_id = projects[0]['id']
        update_data = {
            "progress": 80,
            "status": "in_progress"
        }
        
        try:
            response = requests.put(f"{BASE_URL}/projects/{project_id}/update", 
                                  json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ Project updated successfully")
                updated_project = response.json()
                print(f"   Updated progress: {updated_project['project']['progress']}%")
            else:
                print(f"❌ Failed to update project: {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend server")
    
    # Step 5: Test public projects endpoint
    print("\n5. Testing public projects endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/projects/public")
        if response.status_code == 200:
            public_projects = response.json()
            print(f"✅ Retrieved {len(public_projects)} public projects")
        else:
            print(f"❌ Failed to get public projects: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
    
    print("\n" + "=" * 50)
    print("🎉 Role-based access test completed!")
    print("\nNext steps:")
    print("1. Start the frontend: cd frontend && npm start")
    print("2. Login with the test credentials:")
    print(f"   Email: {TEST_EMAIL}")
    print(f"   Password: {TEST_PASSWORD}")
    print("3. Check if you see the Official Dashboard")
    print("4. Try managing projects from the dashboard")

if __name__ == "__main__":
    test_role_based_access()
