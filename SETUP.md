# Complete Setup Guide - Cameroon Land Registry System

This guide will walk you through setting up the entire National Land Ownership Management and Verification System.

## Prerequisites Installation

### Step 1: Install Node.js and npm

**Windows:**
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer and follow prompts
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install PostgreSQL and PostGIS

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run installer, remember the password for postgres user
3. Select "Stack Builder" at the end to install PostGIS
4. Follow PostGIS installation

**macOS:**
```bash
brew install postgresql postgis
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
sudo systemctl start postgresql
```

### Step 3: Verify PostgreSQL Installation

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt, verify:
\dx
# Should show postgis extension available

# Type \q to quit
\q
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
# or if using pnpm
pnpm install
```

### Step 3: Create Database

```bash
# Create the database
psql -U postgres
# In PostgreSQL prompt:
CREATE DATABASE cameroon_land_registry;
CREATE EXTENSION postgis;
\c cameroon_land_registry
\q
```

### Step 4: Initialize Database Schema

```bash
# From backend directory
psql -U postgres -d cameroon_land_registry -f src/config/schema.sql
```

This will create all tables with proper indexes and PostGIS geometry columns.

### Step 5: Configure Environment Variables

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your database credentials
# Open .env in your text editor and update:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=cameroon_land_registry
JWT_SECRET=your-secure-jwt-secret-here
```

### Step 6: Seed Database with Initial Data

```bash
npm run seed
```

This creates default test users:
- Admin: admin@cameroon.gov.cm / admin123
- Land Owner: owner@cameroon.gov.cm / owner123
- Surveyor: surveyor@cameroon.gov.cm / surveyor123
- Officer: officer@cameroon.gov.cm / officer123

### Step 7: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✓ Database connection successful
✓ Server running on http://localhost:5000
✓ API: http://localhost:5000/api
```

## Frontend Setup

### Step 1: Open New Terminal and Navigate to Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or if using pnpm
pnpm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Testing the Application

### Step 1: Access the Application

Open your browser and navigate to: http://localhost:5173

### Step 2: Login with Test Account

Use any of the test accounts created during seeding:
```
Email: admin@cameroon.gov.cm
Password: admin123
```

### Step 3: Test Different Roles

Each role has different menu items and features. Try logging in with different accounts:

**Land Owner (owner@cameroon.gov.cm):**
- Register New Land
- My Parcels
- Applications
- Documents
- Certificates

**Surveyor (surveyor@cameroon.gov.cm):**
- Upload Parcels
- Draw Boundaries
- Manage Parcels

**Officer (officer@cameroon.gov.cm):**
- Verification
- Applications
- Workflows

**Admin (admin@cameroon.gov.cm):**
- Users
- Analytics
- Audit Logs

## Troubleshooting

### Issue: "Database connection refused"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
net start PostgreSQL14

# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Verify connection
psql -U postgres
```

### Issue: "Cannot find module 'pg'"

**Solution:**
```bash
# From backend directory
npm install pg
```

### Issue: "PostGIS extension not found"

**Solution:**
```bash
# Connect to the database
psql -U postgres -d cameroon_land_registry

# In PostgreSQL prompt:
CREATE EXTENSION IF NOT EXISTS postgis;

# Verify:
SELECT postgis_version();
\q
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

### Issue: "CORS error" when frontend calls API

**Solution:**
1. Check `.env` in backend
2. Ensure `CORS_ORIGIN=http://localhost:5173`
3. Restart backend server

### Issue: Map not loading

**Solution:**
1. Check internet connection (Leaflet uses CDN)
2. Clear browser cache
3. Open browser console (F12) for errors
4. Ensure Leaflet CSS is loaded

## API Testing with Curl

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "landowner"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cameroon.gov.cm",
    "password": "admin123"
  }'
```

Save the returned token and use in subsequent requests:

```bash
TOKEN="your-jwt-token-here"

# Get profile
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## Database Management

### Backup Database

```bash
# Windows/macOS/Linux
pg_dump -U postgres cameroon_land_registry > backup.sql
```

### Restore Database

```bash
psql -U postgres cameroon_land_registry < backup.sql
```

### Connect to Database

```bash
psql -U postgres -d cameroon_land_registry

# Useful commands:
\dt              # List all tables
\d table_name    # Describe table
SELECT * FROM users;  # Query
\q               # Quit
```

## Development Commands

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Start dev server (with auto-reload)
npm run dev

# Start production server
npm start

# Seed database
npm run seed
```

## Next Steps

1. **Configure JWT Secret:** Change `JWT_SECRET` in backend `.env` for production
2. **Setup file storage:** Configure upload directory in `.env`
3. **Add more users:** Use the admin dashboard or API
4. **Customize styling:** Modify CSS in `frontend/src/css/`
5. **Add more features:** Create new pages and API routes
6. **Deploy to production:** See deployment guides for Vercel/traditional servers

## Production Deployment

### Before Deploying

1. Update `.env` with production credentials
2. Set `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Enable HTTPS
5. Setup database backups
6. Configure proper CORS settings
7. Setup error logging

### Deploy Backend

#### Option 1: Vercel with Express API Routes
```bash
npm install -g vercel
vercel login
vercel deploy
```

#### Option 2: Traditional Node Server
```bash
# Upload code to server
# Install dependencies
npm install

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name "land-registry"
pm2 startup
pm2 save
```

### Deploy Frontend

#### Option 1: Vercel
```bash
cd frontend
npm run build
vercel deploy --prod
```

#### Option 2: GitHub Pages / Static Host
```bash
cd frontend
npm run build
# Upload dist folder to hosting
```

## Support

For issues:
1. Check error messages in browser console (F12)
2. Check backend logs in terminal
3. Verify database connection
4. Check PostgreSQL is running
5. Review .env configuration

## Additional Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- PostGIS Docs: https://postgis.net/docs/
- Express.js Docs: https://expressjs.com/
- React Docs: https://react.dev/
- Leaflet Docs: https://leafletjs.com/
