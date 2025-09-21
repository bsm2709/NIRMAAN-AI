from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import os
import random

# Create app
app = Flask(__name__)

# Configure the app
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
    SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URI', 'sqlite:///nirmaan.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

# Initialize database
db = SQLAlchemy(app)

# Import models
from models.user import User
from models.project import Project, Comment

def init_db():
    # Create tables
    db.create_all()
    
    # Check if there are already users in the database
    if User.query.count() > 0:
        print("Database already initialized")
        return
    
    # Create sample users
    users = [
        User(
            username="admin",
            email="admin@example.com",
            password_hash=generate_password_hash("admin123"),
            role="admin"
        ),
        User(
            username="official",
            email="official@example.com",
            password_hash=generate_password_hash("official123"),
            role="official"
        ),
        User(
            username="citizen",
            email="citizen@example.com",
            password_hash=generate_password_hash("citizen123"),
            role="citizen"
        )
    ]
    
    db.session.add_all(users)
    db.session.commit()
    
    # Create sample projects
    projects = [
        Project(
            name="Metro Line Extension",
            description="Extension of the city metro line to the suburbs",
            location="North District",
            latitude=28.6139,
            longitude=77.2090,
            status="in_progress",
            progress=35,
            start_date=datetime.now() - timedelta(days=60),
            end_date=datetime.now() + timedelta(days=300),
            budget=5000000.0,
            manager_id=2  # Official
        ),
        Project(
            name="Public Park Renovation",
            description="Renovation of the central public park with new facilities",
            location="Central District",
            latitude=28.6129,
            longitude=77.2295,
            status="planned",
            progress=0,
            start_date=datetime.now() + timedelta(days=30),
            end_date=datetime.now() + timedelta(days=180),
            budget=1200000.0,
            manager_id=2  # Official
        ),
        Project(
            name="Smart Traffic System",
            description="Implementation of AI-based traffic management system",
            location="South District",
            latitude=28.5921,
            longitude=77.2290,
            status="completed",
            progress=100,
            start_date=datetime.now() - timedelta(days=120),
            end_date=datetime.now() - timedelta(days=10),
            budget=3500000.0,
            manager_id=2  # Official
        ),
        Project(
            name="Solar Power Plant",
            description="Construction of 50MW solar power plant",
            location="East District",
            latitude=28.6304,
            longitude=77.2177,
            status="delayed",
            progress=45,
            start_date=datetime.now() - timedelta(days=90),
            end_date=datetime.now() + timedelta(days=120),
            budget=8000000.0,
            manager_id=1  # Admin
        ),
        Project(
            name="Hospital Building",
            description="Construction of new 500-bed government hospital",
            location="West District",
            latitude=28.6258,
            longitude=77.2209,
            status="in_progress",
            progress=70,
            start_date=datetime.now() - timedelta(days=180),
            end_date=datetime.now() + timedelta(days=90),
            budget=12000000.0,
            manager_id=1  # Admin
        )
    ]
    
    db.session.add_all(projects)
    db.session.commit()
    
    # Create sample comments
    comments = [
        Comment(
            content="When will the metro be operational? The current commute is very difficult.",
            author_id=3,  # Citizen
            project_id=1
        ),
        Comment(
            content="We're working to complete this section by the end of the year. Thank you for your patience.",
            author_id=2,  # Official
            project_id=1
        ),
        Comment(
            content="The park renovation is much needed. Please include more play areas for children.",
            author_id=3,  # Citizen
            project_id=2
        ),
        Comment(
            content="The solar plant construction seems to be behind schedule. What's causing the delay?",
            author_id=3,  # Citizen
            project_id=4
        ),
        Comment(
            content="We've encountered some issues with equipment delivery. We're working to resolve them.",
            author_id=1,  # Admin
            project_id=4
        ),
        Comment(
            content="The hospital is looking great! When will it start accepting patients?",
            author_id=3,  # Citizen
            project_id=5
        )
    ]
    
    db.session.add_all(comments)
    db.session.commit()
    
    print("Database initialized with sample data")

if __name__ == "__main__":
    with app.app_context():
        init_db()