#!/bin/bash

echo "🚀 Starting College Portal Server..."

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo "Starting Flask server on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""

python app.py

