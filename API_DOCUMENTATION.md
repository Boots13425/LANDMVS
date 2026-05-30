# API Documentation - Cameroon Land Registry

Complete reference for all REST API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token-here
```

## Error Response Format

All errors return a JSON response:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Success Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+237123456789",
  "organization": "Ministry",
  "role": "landowner"
}
```

**Role Options:** `landowner`, `surveyor`, `officer`, `admin`

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "landowner",
      "phone": "+237123456789"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:** 201 (Created), 400 (Bad Request)

---

### Login User

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@cameroon.gov.cm",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@cameroon.gov.cm",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:** 200 (OK), 401 (Unauthorized)

---

### Get Profile

**GET** `/auth/profile`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@cameroon.gov.cm",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:** 200 (OK), 401 (Unauthorized)

---

### Update Profile

**PUT** `/auth/profile`

Update current user's profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+237987654321"
}
```

**Response:** Updated user object

**Status Codes:** 200 (OK), 401 (Unauthorized)

---

## Land Parcel Endpoints

### Create Parcel

**POST** `/land/parcels`

Create a new land parcel with geometry.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Residential Plot A",
  "location": "Yaounde, Cameroon",
  "area": 5000,
  "description": "Beautiful residential plot",
  "geometry": [
    [3.8480, 11.5021],
    [3.8481, 11.5022],
    [3.8482, 11.5021],
    [3.8480, 11.5021]
  ]
}
```

**Geometry:** Array of [latitude, longitude] coordinates. Minimum 3 points required for valid polygon.

**Response:**
```json
{
  "success": true,
  "message": "Parcel created successfully",
  "data": {
    "id": 1,
    "ownerId": 2,
    "name": "Residential Plot A",
    "location": "Yaounde, Cameroon",
    "area": 5000,
    "status": "pending",
    "description": "Beautiful residential plot",
    "geometry": [[3.8480, 11.5021], ...],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:** 201 (Created), 400 (Bad Request)

---

### Get All Parcels

**GET** `/land/parcels`

Get list of land parcels (with pagination).

**Query Parameters:**
```
?limit=50&offset=0&status=pending&userId=2
```

- `limit`: Number of results (default: 50)
- `offset`: Starting position (default: 0)
- `status`: Filter by status (pending, verified, approved, rejected)
- `userId`: Filter by owner ID

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "ownerId": 2,
      "name": "Residential Plot A",
      "location": "Yaounde, Cameroon",
      "area": 5000,
      "status": "pending",
      "geometry": [[3.8480, 11.5021], ...],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

**Status Codes:** 200 (OK)

---

### Get Parcel by ID

**GET** `/land/parcels/:parcelId`

Get a specific land parcel.

**URL Parameters:**
- `parcelId`: ID of the parcel

**Response:** Single parcel object

**Status Codes:** 200 (OK), 404 (Not Found)

---

### Update Parcel

**PUT** `/land/parcels/:parcelId`

Update a land parcel.

**Request Body:** Any fields to update
```json
{
  "name": "Updated Name",
  "area": 6000,
  "status": "verified"
}
```

**Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found)

---

### Delete Parcel

**DELETE** `/land/parcels/:parcelId`

Delete a land parcel.

**Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found)

---

### Spatial Query

**POST** `/land/parcels/spatial-query`

Find parcels within geographic bounds.

**Request Body:**
```json
{
  "bounds": {
    "north": 11.5030,
    "south": 11.5010,
    "east": 3.8490,
    "west": 3.8470
  }
}
```

**Response:** Array of parcels within bounds

**Status Codes:** 200 (OK), 400 (Bad Request)

---

## Application Endpoints

### Create Application

**POST** `/land/applications`

Submit a verification application.

**Request Body:**
```json
{
  "parcelId": 1,
  "applicationType": "ownership_verification",
  "description": "Applying for ownership verification"
}
```

**Application Types:** `ownership_verification`, `title_registration`, `boundary_verification`, `document_verification`

**Response:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": 1,
    "parcelId": 1,
    "userId": 2,
    "applicationType": "ownership_verification",
    "status": "pending",
    "submittedDate": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:** 201 (Created), 400 (Bad Request)

---

### Get Applications

**GET** `/land/applications`

Get list of applications.

**Query Parameters:**
```
?limit=50&offset=0&status=pending&userId=2
```

- `limit`: Number of results
- `offset`: Starting position
- `status`: Filter by status (pending, under_review, approved, rejected)
- `userId`: Filter by applicant ID

**Response:** Paginated list of applications

**Status Codes:** 200 (OK)

---

### Get Application by ID

**GET** `/land/applications/:applicationId`

Get a specific application.

**Response:** Single application object with details

**Status Codes:** 200 (OK), 404 (Not Found)

---

### Update Application Status

**PATCH** `/land/applications/:applicationId/status`

Update application status (Officer/Admin only).

**Required Role:** `officer` or `admin`

**Request Body:**
```json
{
  "status": "approved",
  "comments": "All documents verified. Approved for registration."
}
```

**Allowed Statuses:** `pending`, `under_review`, `approved`, `rejected`

**Response:** Updated application object

**Status Codes:** 200 (OK), 403 (Forbidden - role), 404 (Not Found)

---

## Rate Limiting & Pagination

### Pagination Parameters

All list endpoints support pagination:

```
?limit=50&offset=0
```

**Response includes pagination info:**
```json
{
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 50,
    "pages": 4
  }
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error - Internal error |

---

## Example Workflows

### Complete Workflow: Land Registration to Verification

**1. Land Owner registers land (Requires: landowner token)**
```bash
POST /api/land/parcels
{
  "name": "My Plot",
  "location": "Yaounde",
  "area": 5000,
  "geometry": [[3.848, 11.502], [3.849, 11.502], [3.849, 11.503], [3.848, 11.502]]
}
```

**2. Land Owner creates application (Requires: landowner token)**
```bash
POST /api/land/applications
{
  "parcelId": 1,
  "applicationType": "ownership_verification",
  "description": "Verify my ownership"
}
```

**3. Officer reviews application (Requires: officer token)**
```bash
GET /api/land/applications
```

**4. Officer approves application (Requires: officer token)**
```bash
PATCH /api/land/applications/1/status
{
  "status": "approved",
  "comments": "Documentation verified"
}
```

**5. Land Owner views approved application (Requires: landowner token)**
```bash
GET /api/land/applications/1
```

---

## Common Errors & Solutions

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```
**Solution:** Regenerate token with login endpoint

### Permission Error
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```
**Solution:** Ensure user has required role for endpoint

### Validation Error
```json
{
  "success": false,
  "message": "Missing required fields"
}
```
**Solution:** Check required fields in request body

### Resource Not Found
```json
{
  "success": false,
  "message": "Parcel not found"
}
```
**Solution:** Verify resource ID is correct

---

## Testing with Curl

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cameroon.gov.cm","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Use token in request
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, implement rate limiting using middleware like `express-rate-limit`.

---

## CORS

CORS is enabled for configured origin. Default: `http://localhost:5173`

Modify in `.env`:
```
CORS_ORIGIN=http://your-frontend-url.com
```

---

## Future Enhancements

- [ ] File upload endpoints for documents
- [ ] Notification system endpoints
- [ ] Advanced spatial queries (buffering, distance)
- [ ] Analytics and reporting endpoints
- [ ] Audit log retrieval
- [ ] User management endpoints (Admin)
- [ ] Batch operations
- [ ] WebSocket support for real-time updates

---

Last Updated: January 2024
