#!/usr/bin/env python3
"""
Gunicorn startup script for ACC service - Render optimized
"""

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Main startup function using Gunicorn"""
    print("🚀 Starting ACC Agent Service with Gunicorn...")
    
    # Get port from environment variable (Render requirement)
    port = int(os.getenv("PORT", 10000))
    print(f"🌐 Binding to host 0.0.0.0 on port {port} (Render requirement)")
    
    try:
        # Import the FastAPI app
        from main import app
        print(f"✅ FastAPI app imported successfully")
        
        # Start with Gunicorn
        import gunicorn.app.wsgiapp as wsgi
        
        # Set Gunicorn configuration
        sys.argv = [
            'gunicorn',
            '--bind', f'0.0.0.0:{port}',
            '--workers', '1',
            '--worker-class', 'uvicorn.workers.UvicornWorker',
            '--timeout', '120',
            '--keep-alive', '2',
            '--max-requests', '1000',
            '--max-requests-jitter', '100',
            'main:app'
        ]
        
        print(f"🔗 Starting Gunicorn server on http://0.0.0.0:{port}")
        wsgi.run()
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Installing missing dependencies...")
        os.system("pip install -r requirements.txt")
        print("Retrying startup...")
        main()
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
