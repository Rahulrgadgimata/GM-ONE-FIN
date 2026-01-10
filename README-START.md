# Quick Start Guide

## Starting the Application

### Option 1: Using PowerShell Scripts (Recommended)

1. **Start Backend:**
   - Open PowerShell in the project root
   - Run: `.\start-backend.ps1`
   - Wait for: "Running on http://0.0.0.0:5000"

2. **Start Frontend:**
   - Open a NEW PowerShell window in the project root
   - Run: `.\start-frontend.ps1`
   - Wait for: "Ready on http://localhost:3000"

### Option 2: Manual Start

1. **Backend:**
   ```powershell
   cd backend
   python app.py
   ```

2. **Frontend (in a new terminal):**
   ```powershell
   cd frontend
   npm run dev
   ```

## Default Credentials

- **Super Admin:**
  - Email: `admin@gmfinance.com`
  - Password: `admin123`

## Troubleshooting

### Backend not starting?
- Check if Python is installed: `python --version`
- Install dependencies: `cd backend && pip install -r requirements.txt`
- Check if port 5000 is available

### Frontend not starting?
- Check if Node.js is installed: `node --version`
- Install dependencies: `cd frontend && npm install`
- Check if port 3000 is available

### "Cannot connect to backend" error?
- Make sure backend is running on http://localhost:5000
- Check browser console (F12) for detailed errors
- Verify CORS is enabled in backend

## API Endpoints

- Backend: http://localhost:5000/api
- Frontend: http://localhost:3000
