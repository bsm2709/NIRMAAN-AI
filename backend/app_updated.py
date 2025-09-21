from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import numpy as np

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Create app
app = Flask(__name__)

# Configure the app
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
    SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URI', 'sqlite:///nirmaan.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key'),
)

# Enable CORS
CORS(app)

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)

# Import models after db is initialized
from models.user import create_user_model
from models.project import create_project_models

# Create model classes
User = create_user_model(db)
Project, Comment = create_project_models(db)

# Create database tables after models are defined
with app.app_context():
    # Drop all tables first to ensure clean recreation
    db.drop_all()
    # Create all tables with new schema
    db.create_all()

# Add some sample users for testing
with app.app_context():
    if User.query.count() == 0:
        from werkzeug.security import generate_password_hash
        
        sample_users = [
            User(
                username="admin",
                email="admin@nirmaan.ai",
                password_hash=generate_password_hash("admin123"),
                role="admin"
            ),
            User(
                username="official1",
                email="official1@nirmaan.ai", 
                password_hash=generate_password_hash("official123"),
                role="official"
            ),
            User(
                username="chandru",
                email="chandru@nirmaan.ai",
                password_hash=generate_password_hash("chandru123"),
                role="official"
            ),
            User(
                username="santosh",
                email="santosh@nirmaan.ai",
                password_hash=generate_password_hash("santosh123"),
                role="citizen"
            ),
            User(
                username="jabeer",
                email="jabeer@nirmaan.ai",
                password_hash=generate_password_hash("jabeer123"),
                role="citizen"
            )
        ]
        
        for user in sample_users:
            db.session.add(user)
        
        db.session.commit()
        print("Sample users added to database")

# Add some sample projects for testing
with app.app_context():
    if Project.query.count() == 0:
        sample_projects = [
            Project(
                name="Mumbai Metro Line 3 Extension",
                description="Extension of Mumbai Metro Line 3 from Colaba to SEEPZ",
                location="Mumbai, Maharashtra",
                latitude=19.0760,
                longitude=72.8777,
                status="in_progress",
                progress=75,
                start_date=datetime(2023, 1, 15),
                end_date=datetime(2024, 6, 30),
                budget=15000000000,
                manager_id=2,  # official1 user
                predicted_stage=4,
                confidence=0.85,
                delay_probability=0.15,
                last_prediction_date=datetime.utcnow()
            ),
            Project(
                name="Delhi Airport Terminal 4",
                description="Construction of new terminal building at Delhi Airport",
                location="New Delhi, Delhi",
                latitude=28.5562,
                longitude=77.1000,
                status="delayed",
                progress=60,
                start_date=datetime(2022, 8, 1),
                end_date=datetime(2024, 3, 31),
                budget=25000000000,
                manager_id=3,  # chandru user
                predicted_stage=3,
                confidence=0.92,
                delay_probability=0.75,
                last_prediction_date=datetime.utcnow()
            ),
            Project(
                name="Bangalore Tech Park Phase 2",
                description="Development of second phase of Bangalore Tech Park",
                location="Bangalore, Karnataka",
                latitude=12.9716,
                longitude=77.5946,
                status="in_progress",
                progress=45,
                start_date=datetime(2023, 6, 1),
                end_date=datetime(2025, 12, 31),
                budget=8000000000,
                manager_id=3,  # chandru user
                predicted_stage=2,
                confidence=0.78,
                delay_probability=0.25,
                last_prediction_date=datetime.utcnow()
            )
        ]
        
        for project in sample_projects:
            db.session.add(project)
        
        db.session.commit()
        print("Sample projects added to database")

# Import AI model functions
try:
    from tensorflow.keras.models import load_model
    from utils import preprocess_image
    from progress_model import predict_stage, stage_to_percent
    
    # Load AI model
    model = load_model("backend/delay_model.h5")
    AI_MODEL_LOADED = True
except Exception as e:
    print(f"Warning: AI model could not be loaded: {e}")
    AI_MODEL_LOADED = False

# Routes
@app.route("/")
def index():
    return jsonify({"message": "Welcome to Nirmaan AI API"})

# AI Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    if not AI_MODEL_LOADED:
        return jsonify({"error": "AI model not loaded"}), 500
        
    try:
        timeline = float(request.form["timeline_days"])
        budget = float(request.form["budget_utilized_percent"])
        file = request.files["image"]

        # Save and use the uploaded image
        filepath = "temp.jpg"
        file.save(filepath)

        # Predict stage and progress % from image
        stage, conf = predict_stage(filepath)
        progress = stage_to_percent[stage]

        # Prepare inputs for hybrid model
        img = preprocess_image(filepath).reshape(1, 224, 224, 3)
        tabular = np.array([[timeline, progress, budget]])

        pred = model.predict([img, tabular])[0][0]

        return jsonify({
            "predicted_stage": int(stage),
            "confidence": round(float(conf), 2),
            "estimated_progress_percent": progress,
            "delayed": int(pred > 0.5),
            "probability": round(float(pred), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Auth routes
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['username', 'email', 'password', 'role']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 409
    
    # Validate role
    valid_roles = ['citizen', 'official', 'admin']
    if data['role'] not in valid_roles:
        return jsonify({'message': 'Invalid role'}), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )
    
    # Save to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Create access token
    from flask_jwt_extended import create_access_token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

@app.route('/auth/profile', methods=['GET'])
@jwt_required()
def profile():
    # Get user ID from JWT
    user_id = int(get_jwt_identity())
    
    # Find user by ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }), 200

# Project routes
@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([
        {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'location': project.location,
            'latitude': project.latitude,
            'longitude': project.longitude,
            'status': project.status,
            'progress': project.progress,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'end_date': project.end_date.isoformat() if project.end_date else None,
            'budget': project.budget,
            'manager_id': project.manager_id,
            'created_at': project.created_at.isoformat()
        } for project in projects
    ])

@app.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'location': project.location,
        'latitude': project.latitude,
        'longitude': project.longitude,
        'status': project.status,
        'progress': project.progress,
        'start_date': project.start_date.isoformat() if project.start_date else None,
        'end_date': project.end_date.isoformat() if project.end_date else None,
        'budget': project.budget,
        'manager_id': project.manager_id,
        'created_at': project.created_at.isoformat(),
        'predicted_stage': project.predicted_stage,
        'confidence': project.confidence,
        'delay_probability': project.delay_probability,
        'last_prediction_date': project.last_prediction_date.isoformat() if project.last_prediction_date else None
    })

@app.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    
    # Create new project
    new_project = Project(
        name=data['name'],
        description=data.get('description', ''),
        location=data.get('location', ''),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        status=data.get('status', 'planned'),
        progress=data.get('progress', 0),
        start_date=datetime.fromisoformat(data['start_date']) if 'start_date' in data else None,
        end_date=datetime.fromisoformat(data['end_date']) if 'end_date' in data else None,
        budget=data.get('budget'),
        manager_id=int(get_jwt_identity())
    )
    
    # Save to database
    db.session.add(new_project)
    db.session.commit()
    
    return jsonify({
        'id': new_project.id,
        'name': new_project.name,
        'message': 'Project created successfully'
    }), 201

@app.route('/projects/<int:project_id>/comments', methods=['GET'])
def get_project_comments(project_id):
    project = Project.query.get_or_404(project_id)
    comments = Comment.query.filter_by(project_id=project_id).order_by(Comment.created_at).all()
    
    result = []
    for comment in comments:
        # Get the author information
        author = User.query.get(comment.author_id)
        author_name = author.username if author else 'Unknown User'
        
        result.append({
            'id': comment.id,
            'content': comment.content,
            'author_id': comment.author_id,
            'author_name': author_name,
            'created_at': comment.created_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/projects/<int:project_id>/comments', methods=['POST'])
@jwt_required()
def add_project_comment(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    # Create new comment
    new_comment = Comment(
        content=data['content'],
        author_id=int(get_jwt_identity()),
        project_id=project_id
    )
    
    # Save to database
    db.session.add(new_comment)
    db.session.commit()
    
    # Get the author information
    author = User.query.get(new_comment.author_id)
    author_name = author.username if author else 'Unknown User'
    
    return jsonify({
        'id': new_comment.id,
        'content': new_comment.content,
        'author_id': new_comment.author_id,
        'author_name': author_name,
        'created_at': new_comment.created_at.isoformat()
    }), 201

# Official Dashboard endpoints
@app.route('/projects/official', methods=['GET'])
@jwt_required()
def get_official_projects():
    """Get projects assigned to the current official"""
    official_id = int(get_jwt_identity())
    projects = Project.query.filter_by(manager_id=official_id).all()
    
    return jsonify([
        {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'location': project.location,
            'latitude': project.latitude,
            'longitude': project.longitude,
            'status': project.status,
            'progress': project.progress,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'end_date': project.end_date.isoformat() if project.end_date else None,
            'budget': project.budget,
            'manager_id': project.manager_id,
            'created_at': project.created_at.isoformat()
        } for project in projects
    ])

@app.route('/projects/comments/unresolved', methods=['GET'])
@jwt_required()
def get_unresolved_comments():
    """Get unresolved comments for projects managed by the current official"""
    official_id = int(get_jwt_identity())
    
    # Get projects managed by this official
    official_projects = Project.query.filter_by(manager_id=official_id).all()
    project_ids = [p.id for p in official_projects]
    
    # Get comments for these projects (assuming all comments are unresolved for now)
    comments = Comment.query.filter(Comment.project_id.in_(project_ids)).order_by(Comment.created_at.desc()).all()
    
    return jsonify([
        {
            'id': comment.id,
            'content': comment.content,
            'author_id': comment.author_id,
            'author_name': comment.author.username,
            'project_id': comment.project_id,
            'project_name': comment.project.name,
            'created_at': comment.created_at.isoformat()
        } for comment in comments
    ])

@app.route('/projects/<int:project_id>/update', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update project details - only by assigned official or admin"""
    project = Project.query.get_or_404(project_id)
    current_user_id = int(get_jwt_identity())
    
    # Get current user to check role
    current_user = User.query.get(current_user_id)
    
    # Check if user is the project manager or admin
    if project.manager_id != current_user_id and current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized to update this project. Only the assigned official or admin can make changes.'}), 403
    
    data = request.get_json()
    
    # Update project fields
    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'location' in data:
        project.location = data['location']
    if 'latitude' in data:
        project.latitude = data['latitude']
    if 'longitude' in data:
        project.longitude = data['longitude']
    if 'status' in data:
        project.status = data['status']
    if 'progress' in data:
        project.progress = data['progress']
    if 'start_date' in data:
        project.start_date = datetime.fromisoformat(data['start_date']) if data['start_date'] else None
    if 'end_date' in data:
        project.end_date = datetime.fromisoformat(data['end_date']) if data['end_date'] else None
    if 'budget' in data:
        project.budget = data['budget']
    
    project.updated_at = datetime.utcnow()
    
    # Save to database
    db.session.commit()
    
    return jsonify({
        'message': 'Project updated successfully',
        'project': {
            'id': project.id,
            'name': project.name,
            'status': project.status,
            'progress': project.progress
        }
    }), 200

# Additional endpoints for frontend compatibility
@app.route('/projects/public', methods=['GET'])
def get_public_projects():
    """Get public projects for map display"""
    projects = Project.query.all()
    return jsonify([
        {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'location': project.location,
            'latitude': project.latitude,
            'longitude': project.longitude,
            'status': project.status,
            'progress': project.progress,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'end_date': project.end_date.isoformat() if project.end_date else None,
            'budget': project.budget,
            'manager_id': project.manager_id,
            'created_at': project.created_at.isoformat()
        } for project in projects
    ])

@app.route('/projects/all', methods=['GET'])
@jwt_required()
def get_all_projects():
    """Get all projects for admin dashboard"""
    projects = Project.query.all()
    return jsonify([
        {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'location': project.location,
            'latitude': project.latitude,
            'longitude': project.longitude,
            'status': project.status,
            'progress': project.progress,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'end_date': project.end_date.isoformat() if project.end_date else None,
            'budget': project.budget,
            'manager_id': project.manager_id,
            'official_name': project.manager.username if project.manager else 'Unassigned',
            'created_at': project.created_at.isoformat()
        } for project in projects
    ])

@app.route('/auth/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users for admin dashboard"""
    users = User.query.all()
    return jsonify([
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None
        } for user in users
    ])

# AI Prediction endpoint for projects
@app.route('/projects/<int:project_id>/predict', methods=['POST'])
@jwt_required()
def predict_project_ai(project_id):
    """Generate AI prediction for a project based on current data"""
    project = Project.query.get_or_404(project_id)
    
    if not AI_MODEL_LOADED:
        return jsonify({"error": "AI model not loaded"}), 500
    
    try:
        # Calculate timeline days
        timeline_days = 0
        if project.start_date:
            timeline_days = (datetime.utcnow() - project.start_date).days
        
        # Calculate budget utilization (simplified - you might want to add actual budget tracking)
        budget_utilized_percent = min(project.progress, 100) if project.progress else 0
        
        # Use the existing AI prediction logic
        from utils import preprocess_image
        from progress_model import predict_stage, stage_to_percent
        
        # For now, we'll use a placeholder image or generate a mock prediction
        # In a real scenario, you'd have project images stored
        try:
            # Try to use a sample image if available
            sample_image_path = "data/images/s1.jpg"  # Use first available image
            stage, conf = predict_stage(sample_image_path)
            progress = stage_to_percent[stage]
        except:
            # Fallback to mock prediction based on project progress
            stage = min(5, max(0, int(project.progress / 20)))  # Convert progress to stage
            conf = 0.8  # Mock confidence
            progress = project.progress
        
        # Prepare inputs for hybrid model
        try:
            img = preprocess_image(sample_image_path).reshape(1, 224, 224, 3)
            tabular = np.array([[timeline_days, progress, budget_utilized_percent]])
            delay_prob = model.predict([img, tabular])[0][0]
        except:
            # Fallback mock prediction
            delay_prob = 0.3 if project.status == 'delayed' else 0.1
        
        # Update project with AI predictions
        project.predicted_stage = int(stage)
        project.confidence = float(conf)
        project.delay_probability = float(delay_prob)
        project.last_prediction_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "predicted_stage": int(stage),
            "confidence": round(float(conf), 2),
            "estimated_progress_percent": progress,
            "delay_probability": round(float(delay_prob), 2),
            "delayed": int(delay_prob > 0.5),
            "message": "AI prediction generated successfully"
        })
        
    except Exception as e:
        return jsonify({"error": f"AI prediction failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)