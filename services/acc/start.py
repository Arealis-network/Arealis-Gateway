#!/usr/bin/env python3
"""
Startup script for ACC service
Handles database initialization and service startup
"""

import os
import sys
from database import create_tables
from main import app

def initialize_database():
    """Initialize database tables"""
    try:
        print("Initializing database tables...")
        create_tables()
        print("Database tables initialized successfully!")
        return True
    except Exception as e:
        print(f"Database initialization failed: {e}")
        return False

def main():
    """Main startup function"""
    print("Starting ACC Agent Service...")
    
    # Initialize database
    if not initialize_database():
        print("Warning: Database initialization failed, but continuing...")
    
    # Import and run the FastAPI app
    import uvicorn
    
    port = int(os.getenv("PORT", 10000))
    print(f"Starting server on port {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    main()
