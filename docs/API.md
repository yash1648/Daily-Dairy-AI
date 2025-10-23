# API Documentation

This document provides detailed information about the Daily-Dairy-AI REST API endpoints and WebSocket interface.

## Base URL

All REST API endpoints are prefixed with `/api`.

## Authentication

Most API endpoints require authentication using JWT tokens.

### Authentication Headers

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
```

Request body:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User

```
POST /api/auth/login
```

Request body:
```json
{
  "username": "user123",
  "password": "securePassword123"
}
```

Response:
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## AI Endpoints

### Generate AI Text

```
POST /api/ai/generate
```

Request body:
```json
{
  "template": "default",
  "variables": {
    "domain": "journaling",
    "format": "paragraph",
    "keyPoints": "positivity, gratitude",
    "input": "How was my day?"
  }
}
```

Response:
```json
{
  "id": "gen_123456",
  "text": "Today was a wonderful day filled with moments of joy and gratitude...",
  "template": "default",
  "timestamp": "2023-06-15T14:30:45Z"
}
```

### Get WebSocket Status

```
GET /api/ai/websocket/status
```

Response:
```json
{
  "connected": true,
  "sessionId": "ws_789012",
  "lastActivity": "2023-06-15T14:25:30Z"
}
```

## Journal Endpoints

### Get All Journal Entries

```
GET /api/journal
```

Query parameters:
- `page` (default: 0): Page number
- `size` (default: 10): Page size
- `sort` (default: "createdAt,desc"): Sort field and direction

Response:
```json
{
  "content": [
    {
      "id": 1,
      "title": "My Day",
      "content": "Today was a wonderful day...",
      "createdAt": "2023-06-15T10:30:00Z",
      "updatedAt": "2023-06-15T10:30:00Z",
      "tags": ["happy", "productive"]
    },
    {
      "id": 2,
      "title": "Reflections",
      "content": "I've been thinking about...",
      "createdAt": "2023-06-14T09:15:00Z",
      "updatedAt": "2023-06-14T09:15:00Z",
      "tags": ["reflective"]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```

### Get Journal Entry by ID

```
GET /api/journal/{id}
```

Response:
```json
{
  "id": 1,
  "title": "My Day",
  "content": "Today was a wonderful day...",
  "createdAt": "2023-06-15T10:30:00Z",
  "updatedAt": "2023-06-15T10:30:00Z",
  "tags": ["happy", "productive"]
}
```

### Create Journal Entry

```
POST /api/journal
```

Request body:
```json
{
  "title": "New Entry",
  "content": "This is my new journal entry...",
  "tags": ["thoughtful", "creative"]
}
```

Response:
```json
{
  "id": 3,
  "title": "New Entry",
  "content": "This is my new journal entry...",
  "createdAt": "2023-06-16T11:45:00Z",
  "updatedAt": "2023-06-16T11:45:00Z",
  "tags": ["thoughtful", "creative"]
}
```

### Update Journal Entry

```
PUT /api/journal/{id}
```

Request body:
```json
{
  "title": "Updated Entry",
  "content": "I've updated this entry...",
  "tags": ["updated", "revised"]
}
```

Response:
```json
{
  "id": 1,
  "title": "Updated Entry",
  "content": "I've updated this entry...",
  "createdAt": "2023-06-15T10:30:00Z",
  "updatedAt": "2023-06-16T12:15:00Z",
  "tags": ["updated", "revised"]
}
```

### Delete Journal Entry

```
DELETE /api/journal/{id}
```

Response: HTTP 204 No Content

## WebSocket Interface

### Connection

Connect to the WebSocket endpoint:

```
ws://<your-server>/ws/ai
```

Include the JWT token as a query parameter:

```
ws://<your-server>/ws/ai?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Message Format

Send messages in the following format:

```json
{
  "prompt": "Write a happy memory from today.",
  "templateId": "creative"
}
```

Receive messages in the following format:

```json
{
  "type": "AI_RESPONSE",
  "content": "Today, I experienced a moment of pure joy when...",
  "timestamp": "2023-06-16T14:30:45Z"
}
```

### Message Types

- `AI_RESPONSE`: AI-generated text response
- `ERROR`: Error message
- `TYPING`: Indicates the AI is generating a response
- `CONNECTED`: Sent when the client successfully connects
- `DISCONNECTED`: Sent when the client disconnects

## Error Responses

All API endpoints return standard error responses:

```json
{
  "timestamp": "2023-06-16T15:30:45Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input parameters",
  "path": "/api/journal"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The rate limits are:

- Authentication endpoints: 10 requests per minute
- AI generation endpoints: 30 requests per minute
- Journal endpoints: 60 requests per minute

When rate limited, the API returns HTTP 429 Too Many Requests with headers indicating the rate limit and reset time.