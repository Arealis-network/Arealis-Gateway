#!/usr/bin/env python3
"""
Startup script for ACC service
Handles database initialization and service startup
"""

import os
import sys

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import sqlalchemy
        import fastapi
        import neo4j
        import psycopg2
        print("✅ All dependencies are available")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Installing missing dependencies...")
        os.system("pip install -r requirements.txt")
        return False

def initialize_database():
    """Initialize database tables"""
    try:
        from database import create_tables
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
    
    # Check dependencies first
    if not check_dependencies():
        print("Retrying dependency check...")
        check_dependencies()
    
    # Initialize database
    if not initialize_database():
        print("Warning: Database initialization failed, but continuing...")
    
    # Import and run the FastAPI app
    try:
        from main import app
        import uvicorn
        
        # Get port from environment variable (Render requirement)
        port = int(os.getenv("PORT", 10000))
        print(f"🌐 Binding to host 0.0.0.0 on port {port} (Render requirement)")
        print(f"🔗 Starting server on http://0.0.0.0:{port}")
        
        uvicorn.run(
            app,  # Use app directly instead of "main:app"
            host="0.0.0.0",  # Required by Render
            port=port,       # From PORT environment variable
            log_level="info"
        )
    except Exception as e:
        print(f"Failed to start service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
