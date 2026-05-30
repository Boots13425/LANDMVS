# Cameroon Land Registry - Digital Land Ownership Management System

A comprehensive GIS-enabled enterprise web platform for digitizing land ownership registration, verification, and administration processes in Cameroon.

## Project Structure

```
cameroon-land-registry/
├── frontend/                 # React Vite application
│   ├── src/
│   │   ├── api/             # API integration layer
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context for state management
│   │   ├── css/             # Global and component styles
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   ├── services/        # Business logic services
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── backend/                 # Express.js backend
    ├── src/
    │   ├── config/          # Configuration files
    │   ├── controllers/      # Request handlers
    │   ├── middleware/       # Express middleware
    │   ├── repositories/     # Data access layer
    │   ├── routes/          # API routes
    │   ├── services/        # Business logic
    │   ├── utils/           # Utility functions
    │   ├── app.js           # Express app setup
    │   └── server.js        # Server entry point
    ├── uploads/             # Uploaded files directory
    ├── .env                 # Environment variables
    └── package.json
```

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Maps**: Leaflet & React-Leaflet
- **Styling**: Plain CSS (no frameworks)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Password Hashing**: bcryptjs

## Prerequisites

### System Requirements
- Node.js 16+ and npm/pnpm
- PostgreSQL 12+ with PostGIS extension
- 2GB RAM minimum
- 500MB disk space

### Environment Setup

#### Windows/macOS/Linux
1. Install [Node.js](https://nodejs.org/)
2. Install [PostgreSQL](https://www.postgresql.org/download/)
3. Enable PostGIS extension in PostgreSQL

## Installation & Setup

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
# or
pnpm install

# Create PostgreSQL database
createdb cameroon_land_registry

# Enable PostGIS extension
psql cameroon_land_registry
# In PostgreSQL prompt:
# CREATE EXTENSION IF NOT EXISTS postgis;

# Run database schema
psql cameroon_land_registry < src/config/schema.sql

# Copy environment file and configure
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=your_postgres_user
# DB_PASSWORD=your_password
# DB_NAME=cameroon_land_registry
# JWT_SECRET=your-secure-jwt-secret

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# App runs on http://localhost:5173
```

## Default User Accounts (After Database Seeding)

```
Admin:
Email: admin@cameroon.gov.cm
Password: admin123

Land Owner:
Email: owner@cameroon.gov.cm
Password: owner123

Surveyor:
Email: surveyor@cameroon.gov.cm
Password: surveyor123

Officer:
Email: officer@cameroon.gov.cm
Password: officer123
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Land Parcel Endpoints
- `POST /api/land/parcels` - Create new parcel
- `GET /api/land/parcels` - Get all parcels
- `GET /api/land/parcels/:parcelId` - Get parcel by ID
- `PUT /api/land/parcels/:parcelId` - Update parcel
- `DELETE /api/land/parcels/:parcelId` - Delete parcel
- `POST /api/land/parcels/spatial-query` - Spatial query within bounds

### Application Endpoints
- `POST /api/land/applications` - Create application
- `GET /api/land/applications` - Get applications
- `GET /api/land/applications/:applicationId` - Get application by ID
- `PATCH /api/land/applications/:applicationId/status` - Update application status

## Features by User Role

### Admin
- Manage all users
- View system analytics
- Access audit logs
- Monitor all activities
- Manage system configuration

### Land Owner
- Register land parcels with boundaries
- Upload ownership documents
- Submit applications for verification
- Track application status
- View land certificates
- Manage personal land portfolio

### Surveyor
- Upload parcel boundary data (GIS)
- Draw land boundaries on interactive maps
- Manage parcel information
- Update coordinate data

### MINDCAF Officer
- Review ownership applications
- Validate submitted documents
- Approve/reject applications
- Manage verification workflows
- Generate verification reports

## GIS Features

- **Interactive Map**: OpenStreetMap-based interface
- **Boundary Drawing**: Draw and edit land boundaries
- **Spatial Queries**: Find parcels within geographic areas
- **Coordinate System**: WGS84 (EPSG:4326)
- **Geometry Support**: PostGIS POLYGON storage

## Database Schema

### Tables
- **users** - User accounts and profiles
- **land_parcels** - Land parcel records with geometry
- **ownership_records** - Ownership details
- **applications** - Verification applications
- **documents** - Uploaded documents
- **verification_logs** - Application workflow history
- **notifications** - User notifications
- **audit_logs** - System activity logging

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **CORS Protection** - Controlled cross-origin requests
- **Role-Based Access Control** - Permission-based endpoints
- **Input Validation** - Server-side data validation
- **SQL Injection Prevention** - Parameterized queries

## Deployment

### Deploy to Vercel (Recommended)

**Frontend:**
```bash
npm run build
# Deploy the dist folder to Vercel
```

**Backend:**
- Use Vercel serverless functions or external Node.js host
- Update CORS_ORIGIN in production
- Configure PostgreSQL connection string

### Deploy to Traditional Server

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

## Development Workflow

### Adding a New Page
1. Create component in `frontend/src/pages`
2. Import in `App.jsx`
3. Add route in routing config
4. Create CSS module in same directory

### Adding an API Endpoint
1. Create controller method in `backend/src/controllers`
2. Create repository method in `backend/src/repositories`
3. Add service logic in `backend/src/services`
4. Add route in `backend/src/routes`
5. Test with Postman or curl

## Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check connection string in .env
# Ensure database exists
createdb cameroon_land_registry

# Verify PostGIS is installed
psql cameroon_land_registry
# \dx postgis  (should show installed)
```

### Port Already in Use
```bash
# Change port in .env or vite.config.js
# Kill process on port 5000 (backend)
lsof -i :5000
kill -9 <PID>

# Kill process on port 5173 (frontend)
lsof -i :5173
kill -9 <PID>
```

### CORS Issues
- Verify `CORS_ORIGIN` in backend .env
- Ensure frontend URL matches
- Check request headers

## Performance Optimization

- Spatial indexes on geometry columns
- Connection pooling in database
- API response pagination
- Frontend code splitting with React Router
- CSS modules for scoped styling

## Support & Contribution

For issues or contributions, please contact the development team or open an issue in the repository.

## License

© 2024 Cameroon Land Registry System. All rights reserved.
"# LANDMVS" 
