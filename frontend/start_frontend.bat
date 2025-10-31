@echo off
echo ========================================
echo Starting Disease Network Frontend
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js: OK
echo.

echo [2/3] Installing dependencies...
if not exist "node_modules\" (
    echo Installing packages for the first time...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo [3/3] Starting development server...
echo Frontend will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
