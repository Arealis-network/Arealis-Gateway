#!/bin/bash
# Build script for ACC service
echo "Building ACC service..."

# Install dependencies using pip
pip install --upgrade pip
pip install -r requirements.txt

echo "Build completed successfully!"
