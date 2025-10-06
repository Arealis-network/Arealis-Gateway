#!/usr/bin/env python3
"""
Simple startup script for ACC service - Render optimized
"""

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Main startup function"""
    print("🚀 Starting ACC Agent Service...")
    
    try:
        # Import and run the FastAPI app directly
        from main import app
        import uvicorn
        
        port = int(os.getenv("PORT", 10000))
        print(f"🌐 Starting server on port {port}")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
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
