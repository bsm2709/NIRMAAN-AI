#!/usr/bin/env python3
"""
Database initialization script with AI prediction fields
This script recreates the database with the new schema including AI prediction fields
"""

import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app_updated import app, db, User, Project, Comment

def init_database():
    """Initialize database with AI prediction fields"""
    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating new tables with AI prediction fields...")
        db.create_all()
        
        print("Database initialized successfully!")
        print("AI prediction fields added:")
        print("- predicted_stage (0-5 construction stage)")
        print("- confidence (0-1 confidence score)")
        print("- delay_probability (0-1 delay probability)")
        print("- last_prediction_date (timestamp)")

if __name__ == "__main__":
    init_database()
