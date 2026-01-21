# Task Management API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Tokens are stored in HTTP-only cookies for security.

### Headers
After login, the token is automatically included in cookies. For API testing tools like Postman, you may need to:
1. Make a login request first
2. Copy the `token` cookie value
3. Include it in subsequent requests

---

## Auth Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Min 8 characters, must contain uppercase, lowercase, and number
- `firstName`: 2-50 characters, required
- `lastName`: 2-50 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "65f2a1b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "bio": null,
    "createdAt": "2024-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation error or user already exists
- `500`: Server error

---

### Login
Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "65f2a1b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "bio": null,
    "createdAt": "2024-03-14T10:30:00.000Z"
  }
}
```

**Cookie Set:**
- Name: `token`
- HttpOnly: true
- Secure: true (in production)
- SameSite: strict
- Max-Age: 7 days

**Error Responses:**
- `400`: Validation error
- `401`: Invalid credentials
- `500`: Server error

---

### Logout
Clear authentication token.

**Endpoint:** `POST /api/auth/logout`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User
Retrieve the authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "65f2a1b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "bio": null,
    "createdAt": "2024-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (no token or invalid token)
- `404`: User not found

---

## User Endpoints

### Get User Profile
Retrieve the authenticated user's profile.

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "65f2a1b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "bio": "Software developer passionate about building great products",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T10:30:00.000Z"
  }
}
```

---

### Update User Profile
Update the authenticated user's profile information.

**Endpoint:** `PUT /api/user/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio text",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validation Rules:**
- `firstName`: 2-50 characters (optional)
- `lastName`: 2-50 characters (optional)
- `bio`: Max 500 characters (optional)
- `avatar`: Valid URL (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "65f2a1b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Updated bio text",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T11:00:00.000Z"
  }
}
```

---

### Change Password
Update the authenticated user's password.

**Endpoint:** `PATCH /api/user/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Min 8 characters, must contain uppercase, lowercase, and number
- `confirmPassword`: Must match newPassword

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400`: Validation error or passwords don't match
- `401`: Current password is incorrect

---

## Task Endpoints

### List Tasks
Retrieve all tasks for the authenticated user with optional filtering and pagination.

**Endpoint:** `GET /api/tasks`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Number of tasks per page (max: 100) |
| status | string | - | Filter by status: `todo`, `in-progress`, `completed` |
| priority | string | - | Filter by priority: `low`, `medium`, `high`, `urgent` |
| search | string | - | Search in title and description |
| sortBy | string | createdAt | Sort field: `createdAt`, `dueDate`, `priority`, `title` |
| sortOrder | string | desc | Sort order: `asc`, `desc` |

**Example Request:**
```
GET /api/tasks?page=1&limit=10&status=todo&priority=high&search=meeting
```

**Success Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "65f2b1c2d3e4f5g6h7i8j9k0",
      "title": "Prepare meeting notes",
      "description": "Compile notes for the client meeting",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-03-20T09:00:00.000Z",
      "tags": ["work", "meetings"],
      "user": "65f2a1b3c4d5e6f7g8h9i0j1",
      "createdAt": "2024-03-14T10:30:00.000Z",
      "updatedAt": "2024-03-14T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasMore": true
  }
}
```

---

### Create Task
Create a new task.

**Endpoint:** `POST /api/tasks`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the API",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-03-25T17:00:00.000Z",
  "tags": ["documentation", "api"]
}
```

**Validation Rules:**
- `title`: 1-200 characters, required
- `description`: Max 2000 characters (optional)
- `status`: One of `todo`, `in-progress`, `completed` (default: `todo`)
- `priority`: One of `low`, `medium`, `high`, `urgent` (default: `medium`)
- `dueDate`: Valid date string (optional)
- `tags`: Array of strings, max 10 tags, each max 30 characters (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "65f2b1c2d3e4f5g6h7i8j9k0",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-03-25T17:00:00.000Z",
    "tags": ["documentation", "api"],
    "user": "65f2a1b3c4d5e6f7g8h9i0j1",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T10:30:00.000Z"
  }
}
```

---

### Get Task by ID
Retrieve a specific task.

**Endpoint:** `GET /api/tasks/:id`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "65f2b1c2d3e4f5g6h7i8j9k0",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-03-25T17:00:00.000Z",
    "tags": ["documentation", "api"],
    "user": "65f2a1b3c4d5e6f7g8h9i0j1",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid task ID format
- `404`: Task not found or doesn't belong to user

---

### Update Task
Update a task (full update).

**Endpoint:** `PUT /api/tasks/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "urgent",
  "dueDate": "2024-03-22T17:00:00.000Z",
  "tags": ["updated", "important"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "id": "65f2b1c2d3e4f5g6h7i8j9k0",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "urgent",
    "dueDate": "2024-03-22T17:00:00.000Z",
    "tags": ["updated", "important"],
    "user": "65f2a1b3c4d5e6f7g8h9i0j1",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T12:00:00.000Z"
  }
}
```

---

### Partial Update Task
Update specific fields of a task.

**Endpoint:** `PATCH /api/tasks/:id`

**Authentication:** Required

**Request Body (any subset of fields):**
```json
{
  "status": "completed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "id": "65f2b1c2d3e4f5g6h7i8j9k0",
    "title": "Original title",
    "description": "Original description",
    "status": "completed",
    "priority": "high",
    "dueDate": "2024-03-25T17:00:00.000Z",
    "tags": ["documentation", "api"],
    "user": "65f2a1b3c4d5e6f7g8h9i0j1",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T12:00:00.000Z"
  }
}
```

---

### Delete Task
Delete a specific task.

**Endpoint:** `DELETE /api/tasks/:id`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `400`: Invalid task ID format
- `404`: Task not found or doesn't belong to user

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

The API currently does not implement rate limiting, but for production use, consider implementing:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

---

## Postman Collection

Import this collection into Postman for easy testing:

### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000/api"
}
```

### Collection Variables
After login, the token will be automatically stored in cookies. For Postman, enable "Automatically follow redirects" and "Send cookies" in settings.

---

## Testing Workflow

1. **Register a new user:**
   ```
   POST {{baseUrl}}/auth/register
   ```

2. **Login:**
   ```
   POST {{baseUrl}}/auth/login
   ```

3. **Create tasks:**
   ```
   POST {{baseUrl}}/tasks
   ```

4. **List tasks with filters:**
   ```
   GET {{baseUrl}}/tasks?status=todo&priority=high
   ```

5. **Update task status:**
   ```
   PATCH {{baseUrl}}/tasks/:id
   Body: { "status": "completed" }
   ```

6. **Delete a task:**
   ```
   DELETE {{baseUrl}}/tasks/:id
   ```

7. **Logout:**
   ```
   POST {{baseUrl}}/auth/logout
   ```
