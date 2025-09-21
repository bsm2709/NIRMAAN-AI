from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
import os
from datetime import datetime, timedelta
import random

# Create a minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///nirmaan.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Import models
from models.user import User

# Define Project model here for initialization
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Float)
    status = db.Column(db.String(20), default='planned')
    progress = db.Column(db.Integer, default=0)
    delay_status = db.Column(db.String(50))
    delay_reason = db.Column(db.Text)
    predicted_stage = db.Column(db.String(50))
    confidence = db.Column(db.Float)
    delay_probability = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key to User (official)
    official_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    official = db.relationship('User', backref='assigned_projects')

# Define Comment model here for initialization
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    project = db.relationship('Project', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('comments', lazy=True))

def init_db():
    # Create all tables
    with app.app_context():
        db.create_all()
        
        # Check if we already have users
        if User.query.count() == 0:
            print("Creating sample users...")
            
            # Create admin user
            admin = User(
                username="admin",
                email="admin@nirmaan.ai",
                role="admin",
                created_at=datetime.utcnow()
            )
            admin.set_password("admin123")
            
            # Create official user
            official = User(
                username="official",
                email="official@nirmaan.ai",
                role="official",
                created_at=datetime.utcnow()
            )
            official.set_password("official123")
            
            # Create citizen user
            citizen = User(
                username="citizen",
                email="citizen@nirmaan.ai",
                role="citizen",
                created_at=datetime.utcnow()
            )
            citizen.set_password("citizen123")
            
            # Add users to session
            db.session.add(admin)
            db.session.add(official)
            db.session.add(citizen)
            db.session.commit()
            
            print("Sample users created successfully!")
        
        # Check if we already have projects
        if Project.query.count() == 0:
            print("Creating sample projects...")
            
            # Sample project locations in India
            locations = [
                {"name": "Mumbai Central Station Renovation", "location": "Mumbai, Maharashtra", "lat": 18.9750, "lng": 72.8258},
                {"name": "Delhi Metro Extension", "location": "New Delhi, Delhi", "lat": 28.6139, "lng": 77.2090},
                {"name": "Bangalore Tech Park", "location": "Bangalore, Karnataka", "lat": 12.9716, "lng": 77.5946},
                {"name": "Chennai Coastal Road", "location": "Chennai, Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
                {"name": "Kolkata Riverfront Development", "location": "Kolkata, West Bengal", "lat": 22.5726, "lng": 88.3639},
                {"name": "Hyderabad IT Corridor", "location": "Hyderabad, Telangana", "lat": 17.3850, "lng": 78.4867},
                {"name": "Ahmedabad Smart City Project", "location": "Ahmedabad, Gujarat", "lat": 23.0225, "lng": 72.5714},
                {"name": "Pune Ring Road", "location": "Pune, Maharashtra", "lat": 18.5204, "lng": 73.8567},
                {"name": "Jaipur Heritage Restoration", "location": "Jaipur, Rajasthan", "lat": 26.9124, "lng": 75.7873},
                {"name": "Lucknow Convention Center", "location": "Lucknow, Uttar Pradesh", "lat": 26.8467, "lng": 80.9462}
            ]
            
            # Get the official user
            official_user = User.query.filter_by(role="official").first()
            
            # Create projects
            for i, loc in enumerate(locations):
                # Randomize project details
                start_date = datetime.utcnow() - timedelta(days=random.randint(30, 365))
                duration = random.randint(180, 730)  # 6 months to 2 years
                end_date = start_date + timedelta(days=duration)
                
                # Randomize status and progress
                status_options = ["planned", "in progress", "delayed", "completed"]
                status = random.choice(status_options)
                
                if status == "planned":
                    progress = 0
                elif status == "completed":
                    progress = 100
                else:
                    progress = random.randint(10, 90)
                
                # Set delay information if delayed
                delay_status = None
                delay_reason = None
                if status == "delayed":
                    delay_status = f"{random.randint(1, 6)} months behind schedule"
                    delay_reasons = [
                        "Weather conditions",
                        "Supply chain issues",
                        "Labor shortage",
                        "Permit delays",
                        "Budget constraints",
                        "Technical challenges"
                    ]
                    delay_reason = random.choice(delay_reasons)
                
                # Create project
                project = Project(
                    name=loc["name"],
                    description=f"A major infrastructure project in {loc['location']} to improve urban facilities and support economic growth.",
                    location=loc["location"],
                    latitude=loc["lat"],
                    longitude=loc["lng"],
                    start_date=start_date,
                    end_date=end_date,
                    budget=random.randint(10000000, 1000000000),  # 1 crore to 100 crore
                    status=status,
                    progress=progress,
                    delay_status=delay_status,
                    delay_reason=delay_reason,
                    predicted_stage=f"Stage {random.randint(1, 5)}",
                    confidence=random.uniform(70.0, 99.0),
                    delay_probability=random.uniform(0.0, 100.0),
                    official_id=official_user.id if i < 5 else None  # Assign first 5 projects to the official
                )
                
                db.session.add(project)
            
            db.session.commit()
            print("Sample projects created successfully!")
            
            # Add some comments to projects
            print("Creating sample comments...")
            
            # Get users and projects
            users = User.query.all()
            projects = Project.query.all()
            
            # Comment templates
            citizen_comments = [
                "When will this project be completed? It's causing traffic issues.",
                "The construction noise is too loud during night hours.",
                "Great progress on this project! Looking forward to its completion.",
                "There's debris falling onto the pedestrian walkway. Please address this safety concern.",
                "Is there a way to get updates on the project timeline?"
            ]
            
            official_comments = [
                "We're working to address the concerns raised by citizens.",
                "The project is on track and should be completed by the expected date.",
                "We've implemented additional safety measures as requested.",
                "There will be a temporary road closure next week to facilitate construction.",
                "Thank you for your patience during this development phase."
            ]
            
            # Add comments to each project
            for project in projects:
                # Add 1-3 citizen comments
                for _ in range(random.randint(1, 3)):
                    citizen = next(user for user in users if user.role == "citizen")
                    comment = Comment(
                        content=random.choice(citizen_comments),
                        project_id=project.id,
                        user_id=citizen.id,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                    )
                    db.session.add(comment)
                
                # Add 0-2 official responses
                for _ in range(random.randint(0, 2)):
                    official = next(user for user in users if user.role == "official")
                    comment = Comment(
                        content=random.choice(official_comments),
                        project_id=project.id,
                        user_id=official.id,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 15))
                    )
                    db.session.add(comment)
            
            db.session.commit()
            print("Sample comments created successfully!")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")