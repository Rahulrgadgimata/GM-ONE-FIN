# Backend Startup Script for Windows PowerShell
Write-Host "`n=== STARTING BACKEND SERVER ===" -ForegroundColor Green
Write-Host ""

# Change to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again." -ForegroundColor Yellow
    exit 1
}

# Check if requirements are installed
Write-Host "`nChecking dependencies..." -ForegroundColor Cyan
if (Test-Path "requirements.txt") {
    Write-Host "Requirements file found" -ForegroundColor Green
} else {
    Write-Host "WARNING: requirements.txt not found" -ForegroundColor Yellow
}

# Start the Flask server
Write-Host "`nStarting Flask backend server on http://localhost:5000..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

python app.py
