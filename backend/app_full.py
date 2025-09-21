from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import numpy as np

# IMPORTANT: We do NOT modify any prediction files. We reuse the exact logic from app.py
from utils import preprocess_image
from progress_model import predict_stage, stage_to_percent
from tensorflow.keras.models import load_model


# Flask app and core extensions
app = Flask(__name__)
CORS(app)

app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
    SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URI', 'sqlite:///nirmaan_full.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key'),
)

db = SQLAlchemy(app)
jwt = JWTManager(app)


# -------------------- Models (Auth only; no circular relationships) --------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='citizen')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'


with app.app_context():
    db.create_all()


# -------------------- Prediction (exact logic from app.py) --------------------
try:
    model = load_model("backend/delay_model.h5")
    AI_MODEL_LOADED = True
except Exception as e:
    print(f"Warning: AI model could not be loaded: {e}")
    AI_MODEL_LOADED = False


@app.route('/predict', methods=['POST'])
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


# -------------------- Auth --------------------
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not all(k in data for k in ['username', 'email', 'password', 'role']):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 409

    if data['role'] not in ['citizen', 'official', 'admin']:
        return jsonify({'message': 'Invalid role'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(k in data for k in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=user.id, additional_claims={'role': user.role}, expires_delta=timedelta(days=1))

    return jsonify({
        'token': token,
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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }), 200


# -------------------- Public projects (for dashboards/map) --------------------
@app.route('/projects/public', methods=['GET'])
def public_projects():
    # Sample public projects for dashboards/map
    sample_projects = [
        {
            'id': 1,
            'name': 'Mumbai Metro Line 3',
            'location': 'Mumbai, Maharashtra',
            'status': 'in progress',
            'progress': 75,
            'latitude': 19.0760,
            'longitude': 72.8777,
            'delay_status': None
        },
        {
            'id': 2,
            'name': 'Delhi Airport Terminal 4',
            'location': 'New Delhi, Delhi',
            'status': 'delayed',
            'progress': 60,
            'latitude': 28.5562,
            'longitude': 77.1000,
            'delay_status': '3 months behind schedule'
        },
        {
            'id': 3,
            'name': 'Bangalore Tech Park Phase 2',
            'location': 'Bangalore, Karnataka',
            'status': 'in progress',
            'progress': 45,
            'latitude': 12.9716,
            'longitude': 77.5946,
            'delay_status': None
        },
        {
            'id': 4,
            'name': 'Chennai Coastal Road',
            'location': 'Chennai, Tamil Nadu',
            'status': 'planned',
            'progress': 10,
            'latitude': 13.0827,
            'longitude': 80.2707,
            'delay_status': None
        }
    ]
    return jsonify(sample_projects)


@app.route('/')
def index():
    return jsonify({'message': 'Nirmaan AI unified API running'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

