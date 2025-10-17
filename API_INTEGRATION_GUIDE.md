# API Integration Guide

## Overview

This guide explains the API integration setup for the Texel Frontend App, including the axios interceptor configuration and pattern service implementation.

## Setup Complete

### 1. Axios Installation
Axios has been added to the project dependencies.

### 2. API Interceptor (`src/services/api.ts`)

The base API configuration includes:

#### Features:
- **Base URL Configuration**: Reads from `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8000`)
- **Request Timeout**: 30 seconds default timeout
- **Authentication**: Automatically adds Bearer token from localStorage to all requests
- **Request/Response Logging**: Debug logs in development mode
- **Error Handling**: Comprehensive error handling with user-friendly messages

#### Error Handling:
- **400**: Bad Request - Input validation errors
- **401**: Unauthorized - Clears token and redirects to login
- **403**: Forbidden - Permission errors
- **404**: Not Found - Resource errors
- **422**: Validation Error - Detailed validation messages
- **429**: Rate Limiting - Too many requests
- **500**: Internal Server Error
- **503**: Service Unavailable
- **Network Errors**: Connection refused, timeout, etc.

#### Usage:
```typescript
import api from './services/api';

// GET request
const response = await api.get('/api/patterns/');

// POST request
const response = await api.post('/api/patterns/create/', data);

// With auth token
import { setAuthToken } from './services/api';
setAuthToken('your-jwt-token');
```

### 3. Pattern Service (`src/services/patternService.ts`)

All API endpoints have been migrated from fetch to axios:

#### Available Methods:

##### Get Pattern by ID
```typescript
const response = await patternService.getPattern(1);
console.log(response.pattern);
```

##### Get All Patterns
```typescript
const { results, count } = await patternService.getPatterns();
console.log(`Found ${count} patterns`);
```

##### Create Pattern
```typescript
const formData = new FormData();
formData.append('name', 'My Pattern');
formData.append('description', 'Optional description');
formData.append('original_image', imageFile);

const response = await patternService.createPattern(formData);
console.log('Pattern created:', response.pattern.id);
```

##### Update Pattern (NEW)
```typescript
await patternService.updatePattern(patternId, {
  region: 'US',
  size: 'M'
});
```

##### Download DXF
```typescript
const { file_url, filename } = await patternService.downloadDXF(patternId);
window.open(file_url, '_blank');
```

##### Download PDF
```typescript
const { file_url, filename } = await patternService.downloadPDF(patternId);
window.open(file_url, '_blank');
```

##### Reprocess Pattern
```typescript
const response = await patternService.reprocessPattern(patternId);
```

##### Delete Pattern (NEW)
```typescript
await patternService.deletePattern(patternId);
```

## Backend API Requirements

Your backend should implement the following endpoints:

### Pattern Endpoints

#### `POST /api/patterns/create/`
Create a new pattern with file upload.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `name` (string, required)
  - `description` (string, optional)
  - `original_image` (file, required)

**Response:**
```json
{
  "success": true,
  "pattern": {
    "id": 1,
    "name": "My Pattern",
    "status": "pending",
    "created_at": "2025-01-14T10:00:00Z",
    ...
  }
}
```

#### `GET /api/patterns/{id}/`
Get pattern details and status.

**Response:**
```json
{
  "success": true,
  "pattern": {
    "id": 1,
    "name": "My Pattern",
    "status": "completed",
    "pattern_2d_data": {...},
    "pattern_3d_data": {...},
    ...
  }
}
```

#### `PATCH /api/patterns/{id}/`
Update pattern with new measurements.

**Request:**
```json
{
  "region": "US",
  "size": "M"
}
```

**Response:**
```json
{
  "success": true,
  "pattern": {...}
}
```

#### `GET /api/patterns/`
Get all patterns (paginated).

**Response:**
```json
{
  "count": 10,
  "results": [...]
}
```

#### `POST /api/patterns/{id}/reprocess/`
Reprocess an existing pattern.

#### `GET /api/patterns/{id}/download-dxf/`
Get DXF file download URL.

**Response:**
```json
{
  "file_url": "https://...",
  "filename": "pattern.dxf"
}
```

#### `GET /api/patterns/{id}/download-pdf/`
Get PDF file download URL.

#### `DELETE /api/patterns/{id}/`
Delete a pattern.

## Pattern Status Flow

The frontend expects the following status progression:

1. `pending` → Initial state after upload
2. `processing` → Backend is processing
3. `outline_extracted` → Outlines extracted
4. `pattern_generated` → Pattern pieces generated
5. `completed` → Processing complete, ready to view
6. `failed` → Processing failed (with `error_message`)

## Environment Configuration

Update your `.env` file:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Or for production
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Error Handling Example

All API calls are wrapped with try-catch in components:

```typescript
try {
  const response = await patternService.createPattern(formData);
  // Handle success
} catch (err) {
  // Error is already formatted by the interceptor
  console.error('Error:', err);
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

## Testing the Connection

To test if the backend is running:

1. Check your backend is running at `http://localhost:8000`
2. Try accessing `http://localhost:8000/api/patterns/` in your browser
3. The frontend will show clear error messages if connection fails

## Common Issues

### Connection Refused Error
```
Cannot connect to server. Please check if the backend is running...
```

**Solution:**
- Ensure your Django/backend server is running
- Check the port matches your `.env` file
- Verify CORS is configured on the backend

### CORS Errors

If you see CORS errors in the browser console, configure your backend:

**Django Example:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]

# Or for development
CORS_ALLOW_ALL_ORIGINS = True
```

### Authentication

When you implement authentication:

```typescript
import { setAuthToken } from './services/api';

// After successful login
const token = response.data.access_token;
setAuthToken(token);

// After logout
import { clearAuthToken } from './services/api';
clearAuthToken();
```

## Next Steps

1. ✅ Axios installed and configured
2. ✅ API interceptor with error handling
3. ✅ Pattern service migrated to axios
4. ✅ Processing screen with polling
5. ✅ Pattern viewer with 3D/2D toggle
6. ✅ Size options panel

### Remaining Backend Integration:
- Implement authentication endpoints (login/signup)
- Add token refresh logic
- Implement file upload progress tracking
- Add caching strategy for pattern data
- Implement WebSocket for real-time processing updates (optional)

## Support

For issues or questions, refer to:
- Axios Documentation: https://axios-http.com/
- Backend API documentation
- Project README.md
