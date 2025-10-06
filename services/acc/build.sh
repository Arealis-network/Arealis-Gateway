#!/bin/bash
# Build script for ACC service
echo "Building ACC service..."

# Install dependencies using pip
pip install --upgrade pip
pip install -r requirements.txt

# Verify installation
echo "Verifying package installation..."
python -c "import sqlalchemy; print('SQLAlchemy installed successfully')"
python -c "import fastapi; print('FastAPI installed successfully')"
python -c "import neo4j; print('Neo4j installed successfully')"

echo "Build completed successfully!"
