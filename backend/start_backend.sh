# Quick Start Script for Disease Network Backend
# For Unix/Linux/macOS

#!/bin/bash

echo "========================================"
echo "Disease Network Visualization - Backend"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

echo "[1/4] Checking backend directory..."
cd "$(dirname "$0")/backend" || exit 1

if [ ! -f "main.py" ]; then
    echo "ERROR: backend/main.py not found"
    exit 1
fi

echo "[2/4] Installing dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "[3/4] Processing CSV data..."
mkdir -p data

if [ ! -f "../pathway_network_result_with_gpt4o_evaluation.csv" ]; then
    echo "WARNING: CSV file not found in project root"
    echo "Please copy pathway_network_result_with_gpt4o_evaluation.csv to project root"
    read -p "Press enter to continue..."
fi

if [ -f "../pathway_network_result_with_gpt4o_evaluation.csv" ]; then
    python3 data_processor.py
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to process CSV data"
        exit 1
    fi
fi

echo "[4/4] Starting server..."
echo ""
echo "Server will start at http://localhost:8000"
echo "API documentation at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
