# Frontend Startup Script for Windows PowerShell
Write-Host "`n=== STARTING FRONTEND SERVER ===" -ForegroundColor Green
Write-Host ""

# Change to frontend directory
$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js and try again." -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
    npm install
}

# Start the Next.js development server
Write-Host "`nStarting Next.js frontend server on http://localhost:3000..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev
