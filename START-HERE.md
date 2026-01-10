# 🚀 QUICK START GUIDE

## Step 1: Start Backend Server

Open **PowerShell** in the project root and run:

```powershell
.\start-backend.ps1
```

**OR manually:**
```powershell
cd backend
python app.py
```

**Wait for:** `Running on http://0.0.0.0:5000`

---

## Step 2: Start Frontend Server

Open a **NEW PowerShell** window in the project root and run:

```powershell
.\start-frontend.ps1
```

**OR manually:**
```powershell
cd frontend
npm run dev
```

**Wait for:** `Ready on http://localhost:3000`

---

## Step 3: Access the Application

1. Open browser: http://localhost:3000
2. Login with:
   - **Email:** `admin@gmfinance.com`
   - **Password:** `admin123`

---

## ✅ What's Fixed

- ✅ User Management page now works
- ✅ Shows all users (Super Admin, Company Secretaries, Accountants)
- ✅ Click on any user to see their documents
- ✅ Shows permanent documents (Company Secretary uploads)
- ✅ Shows periodic documents (Accountant uploads)
- ✅ View and download documents
- ✅ Activate/Deactivate users
- ✅ API connection issues resolved
- ✅ Database properly connected

---

## 🔧 Troubleshooting

### Backend won't start?
- Check Python: `python --version` (need 3.8+)
- Install dependencies: `cd backend && pip install -r requirements.txt`

### Frontend won't start?
- Check Node.js: `node --version` (need 16+)
- Install dependencies: `cd frontend && npm install`

### "Cannot connect" error?
- Make sure backend is running on port 5000
- Check browser console (F12) for errors
- Verify both servers are running

---

## 📝 Important Notes

- **Backend must be running** before frontend can work
- Keep both terminals open while using the app
- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000
