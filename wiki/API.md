# API Documentation

This document provides comprehensive documentation for the UPassManager API endpoints.

## API Overview

The UPassManager API is a RESTful API that provides programmatic access to the UPassManager system. It allows you to:

- Authenticate users
- Manage student data
- Check eligibility
- Manage U-Pass cards
- Generate reports
- Send notifications

## Base URL

```
https://api.upassmanager.example.com/v1
```

## Authentication

All API requests require authentication using JSON Web Tokens (JWT).

### Obtaining a Token

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Using the Token

Include the token in the Authorization header of all API requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refreshing a Token

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

## User Endpoints

### Get Current User

```
GET /users/me
```

**Response:**
```json
{
  "id": "123456",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "distributor",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Update User

```
PUT /users/me
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "id": "123456",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "distributor",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-03-01T00:00:00Z"
}
```

### Change Password

```
POST /users/me/change-password
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

## Student Endpoints

### Get Students

```
GET /students
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20)
- `search`: Search term for name or ID
- `eligibility`: Filter by eligibility status

**Response:**
```json
{
  "data": [
    {
      "id": "123456",
      "studentId": "S12345",
      "firstName": "Jane",
      "lastName": "Smith",
      "eligibilityStatus": "eligible",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    // More students...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Get Student by ID

```
GET /students/{id}
```

**Response:**
```json
{
  "id": "123456",
  "studentId": "S12345",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "eligibilityStatus": "eligible",
  "upass": {
    "id": "789012",
    "passNumber": "UP123456",
    "issueDate": "2025-01-15T00:00:00Z",
    "expiryDate": "2025-05-15T00:00:00Z",
    "status": "active"
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Update Student

```
PUT /students/{id}
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "eligibilityStatus": "eligible"
}
```

**Response:**
```json
{
  "id": "123456",
  "studentId": "S12345",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "eligibilityStatus": "eligible",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-03-01T00:00:00Z"
}
```

### Import Students

```
POST /students/import
```

**Request Body:**
```json
{
  "students": [
    {
      "studentId": "S12345",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "eligibilityStatus": "eligible"
    },
    // More students...
  ]
}
```

**Response:**
```json
{
  "imported": 10,
  "failed": 0,
  "errors": []
}
```

## U-Pass Endpoints

### Issue U-Pass

```
POST /upasses/issue
```

**Request Body:**
```json
{
  "studentId": "123456",
  "passNumber": "UP123456"
}
```

**Response:**
```json
{
  "id": "789012",
  "studentId": "123456",
  "passNumber": "UP123456",
  "issueDate": "2025-03-01T00:00:00Z",
  "expiryDate": "2025-07-01T00:00:00Z",
  "status": "active",
  "distributorId": "456789",
  "createdAt": "2025-03-01T00:00:00Z",
  "updatedAt": "2025-03-01T00:00:00Z"
}
```

### Get U-Pass by ID

```
GET /upasses/{id}
```

**Response:**
```json
{
  "id": "789012",
  "studentId": "123456",
  "passNumber": "UP123456",
  "issueDate": "2025-03-01T00:00:00Z",
  "expiryDate": "2025-07-01T00:00:00Z",
  "status": "active",
  "distributorId": "456789",
  "student": {
    "id": "123456",
    "studentId": "S12345",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "createdAt": "2025-03-01T00:00:00Z",
  "updatedAt": "2025-03-01T00:00:00Z"
}
```

### Update U-Pass Status

```
PUT /upasses/{id}/status
```

**Request Body:**
```json
{
  "status": "lost",
  "reason": "Student reported card lost"
}
```

**Response:**
```json
{
  "id": "789012",
  "studentId": "123456",
  "passNumber": "UP123456",
  "issueDate": "2025-03-01T00:00:00Z",
  "expiryDate": "2025-07-01T00:00:00Z",
  "status": "lost",
  "distributorId": "456789",
  "createdAt": "2025-03-01T00:00:00Z",
  "updatedAt": "2025-03-15T00:00:00Z"
}
```

## Notification Endpoints

### Send Notification

```
POST /notifications
```

**Request Body:**
```json
{
  "studentId": "123456",
  "type": "pickup",
  "message": "Your U-Pass is ready for pickup"
}
```

**Response:**
```json
{
  "id": "345678",
  "studentId": "123456",
  "type": "pickup",
  "message": "Your U-Pass is ready for pickup",
  "read": false,
  "createdAt": "2025-03-01T00:00:00Z"
}
```

### Get Notifications

```
GET /notifications
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20)
- `studentId`: Filter by student ID
- `type`: Filter by notification type
- `read`: Filter by read status

**Response:**
```json
{
  "data": [
    {
      "id": "345678",
      "studentId": "123456",
      "type": "pickup",
      "message": "Your U-Pass is ready for pickup",
      "read": false,
      "createdAt": "2025-03-01T00:00:00Z"
    },
    // More notifications...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Mark Notification as Read

```
PUT /notifications/{id}/read
```

**Response:**
```json
{
  "id": "345678",
  "studentId": "123456",
  "type": "pickup",
  "message": "Your U-Pass is ready for pickup",
  "read": true,
  "createdAt": "2025-03-01T00:00:00Z",
  "updatedAt": "2025-03-02T00:00:00Z"
}
```

## Report Endpoints

### Generate Report

```
POST /reports/generate
```

**Request Body:**
```json
{
  "type": "distribution",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "format": "csv"
}
```

**Response:**
```json
{
  "id": "567890",
  "type": "distribution",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "format": "csv",
  "status": "processing",
  "createdAt": "2025-04-01T00:00:00Z"
}
```

### Get Report Status

```
GET /reports/{id}
```

**Response:**
```json
{
  "id": "567890",
  "type": "distribution",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "format": "csv",
  "status": "completed",
  "url": "https://api.upassmanager.example.com/v1/reports/567890/download",
  "createdAt": "2025-04-01T00:00:00Z",
  "completedAt": "2025-04-01T00:05:00Z"
}
```

### Download Report

```
GET /reports/{id}/download
```

**Response:**
Binary file download

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication is required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1614556800
```

## Versioning

The API is versioned using URL path versioning. The current version is `v1`.

## Pagination

List endpoints support pagination using the `page` and `limit` query parameters. The response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## Filtering and Sorting

Many list endpoints support filtering and sorting using query parameters:

- `search`: Search term for text fields
- `sort`: Field to sort by (prefix with `-` for descending order)
- Additional endpoint-specific filters

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for browser-based clients.
