#!/bin/bash

echo "========================================"
echo "Starting Disease Network Frontend"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi
echo "Node.js: OK"
echo ""

echo "[2/3] Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing packages for the first time..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
else
    echo "Dependencies already installed."
fi
echo ""

echo "[3/3] Starting development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""
npm run dev
