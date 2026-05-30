# Quick Start Guide - 5 Minutes

## Start Here

This is the absolute fastest way to get the system running locally.

## Prerequisites (Already Installed?)

- ✅ Node.js 16+ (`node --version`)
- ✅ PostgreSQL 12+ with PostGIS (`psql --version`)

## Setup (Copy & Paste Commands)

### 1. Database Setup (2 min)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE cameroon_land_registry;"

# Create PostGIS extension
psql -U postgres -d cameroon_land_registry -c "CREATE EXTENSION postgis;"

# Create all tables
psql -U postgres -d cameroon_land_registry -f backend/src/config/schema.sql
```

### 2. Backend Setup (1 min)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env and update: DB_PASSWORD=your_postgres_password

# Seed test data
npm run seed

# Start server
npm run dev
```

### 3. Frontend Setup (1 min)

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Login (1 min)

Open http://localhost:5173

**Test Credentials:**
- Email: `admin@cameroon.gov.cm`
- Password: `admin123`

That's it! You're running the system locally! 🎉

## Common Commands

```bash
# Backend
cd backend
npm run dev        # Development mode
npm start          # Production mode
npm run seed       # Add test data

# Frontend
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build

# Database
psql -U postgres -d cameroon_land_registry  # Connect
\dt                                          # List tables
SELECT * FROM users;                         # Query data
\q                                           # Quit
```

## Test Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cameroon.gov.cm | admin123 |
| Land Owner | owner@cameroon.gov.cm | owner123 |
| Surveyor | surveyor@cameroon.gov.cm | surveyor123 |
| Officer | officer@cameroon.gov.cm | officer123 |

## Features to Try

### Admin Dashboard
- Dashboard with statistics
- View all users and applications
- Monitor system analytics

### Land Owner
- Register new land parcels with map boundaries
- Upload ownership documents
- Track verification status
- View issued certificates

### Surveyor
- Upload GIS parcel data
- Draw land boundaries on interactive map
- Manage parcel information

### Officer
- Review applications
- Verify documents
- Approve/reject applications
- Add verification comments

## API Endpoints (Postman/Curl)

```bash
# Get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cameroon.gov.cm","password":"admin123"}'

# Use token in requests
TOKEN="paste_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

## Project Structure at a Glance

```
├── frontend/          # React + Leaflet
│   └── src/
│       ├── pages/     # Page components
│       ├── components/ # Reusable components
│       ├── services/  # API calls
│       └── css/       # Styling
│
└── backend/           # Express + PostgreSQL
    └── src/
        ├── controllers/    # Request handlers
        ├── services/       # Business logic
        ├── repositories/   # Data access
        └── routes/         # API endpoints
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| `Error: connect ECONNREFUSED` | PostgreSQL not running: `brew services start postgresql` |
| `Error: EADDRINUSE` | Port in use: Kill process on port 5000 or change PORT in .env |
| `Module not found` | Run: `npm install` |
| Map not loading | Check internet, clear browser cache |
| Login fails | Check .env DB settings, reseed data: `npm run seed` |

## Next Steps

1. **Explore the code** - Review components and services
2. **Test all features** - Try each role's functionality
3. **Customize styling** - Edit CSS files in `frontend/src/css/`
4. **Add features** - Create new pages and API routes
5. **Deploy** - See README.md for deployment guides

## File Locations Quick Reference

| What | Location |
|------|----------|
| Frontend code | `frontend/src/` |
| Backend code | `backend/src/` |
| Database schema | `backend/src/config/schema.sql` |
| Environment config | `backend/.env` |
| API routes | `backend/src/routes/` |
| Page components | `frontend/src/pages/` |
| Styling | `frontend/src/css/` |

## Need Help?

1. Check `SETUP.md` for detailed setup instructions
2. See `README.md` for full documentation
3. Review code comments in components
4. Check browser console (F12) for errors
5. Check backend terminal for error logs

---

**That's it!** You now have a fully functional National Land Ownership Management and Verification System running locally. Start exploring! 🚀
