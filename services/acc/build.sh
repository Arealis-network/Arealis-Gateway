#!/bin/bash
# Build script for ACC service - Render optimized
echo "🚀 Building ACC service for Render..."

# Upgrade pip first
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install dependencies with verbose output
echo "📦 Installing dependencies..."
pip install -r requirements.txt --verbose

# Verify critical packages
echo "🔍 Verifying package installation..."
python -c "import sys; print(f'Python version: {sys.version}')"
python -c "import sqlalchemy; print('✅ SQLAlchemy installed successfully')"
python -c "import fastapi; print('✅ FastAPI installed successfully')"
python -c "import neo4j; print('✅ Neo4j installed successfully')"
python -c "import psycopg2; print('✅ psycopg2 installed successfully')"
python -c "import uvicorn; print('✅ Uvicorn installed successfully')"

# List installed packages
echo "📋 Installed packages:"
pip list

echo "✅ Build completed successfully!"
