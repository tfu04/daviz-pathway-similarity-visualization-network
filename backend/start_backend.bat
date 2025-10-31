@echo off
REM Quick start script for Disease Network Backend

echo ========================================
echo Disease Network Visualization - Backend
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Checking backend directory...
cd /d "%~dp0backend"
if not exist "main.py" (
    echo ERROR: backend/main.py not found
    pause
    exit /b 1
)

echo [2/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [3/4] Processing CSV data...
if not exist "data" mkdir data
if not exist "..\pathway_network_result_with_gpt4o_evaluation.csv" (
    echo WARNING: CSV file not found in project root
    echo Please copy pathway_network_result_with_gpt4o_evaluation.csv to project root
    pause
)

if exist "..\pathway_network_result_with_gpt4o_evaluation.csv" (
    python data_processor.py
    if errorlevel 1 (
        echo ERROR: Failed to process CSV data
        pause
        exit /b 1
    )
)

echo [4/4] Starting server...
echo.
echo Server will start at http://localhost:8000
echo API documentation at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
