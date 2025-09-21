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

# Import models
from models.user import User
from models.project import Project, Comment

# Create database tables
with app.app_context():
    db.create_all()

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
    access_token = jwt.create_access_token(
        identity=user.id,
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
    user_id = get_jwt_identity()
    
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
        'created_at': project.created_at.isoformat()
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
        manager_id=get_jwt_identity()
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
    
    return jsonify([
        {
            'id': comment.id,
            'content': comment.content,
            'author_id': comment.author_id,
            'author_name': comment.author.username,
            'created_at': comment.created_at.isoformat()
        } for comment in comments
    ])

@app.route('/projects/<int:project_id>/comments', methods=['POST'])
@jwt_required()
def add_project_comment(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    # Create new comment
    new_comment = Comment(
        content=data['content'],
        author_id=get_jwt_identity(),
        project_id=project_id
    )
    
    # Save to database
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({
        'id': new_comment.id,
        'content': new_comment.content,
        'author_id': new_comment.author_id,
        'author_name': new_comment.author.username,
        'created_at': new_comment.created_at.isoformat()
    }), 201

if __name__ == "__main__":
    app.run(debug=True)