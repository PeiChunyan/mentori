# API Endpoints Specification - Mentori MVP

## 1. Overview
RESTful API design for the Mentori platform with JWT-based authentication.

**Base URL**: `/api/v1`

## 2. Authentication Endpoints

### 2.1 Register User
**POST** `/auth/register`

Register a new user (mentor or mentee).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "mentor",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "mentor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### 2.2 Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "mentor",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "https://..."
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 2.3 Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2.4 Verify Email
**POST** `/auth/verify-email`

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 2.5 Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 2.6 Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 3. Profile Endpoints

### 3.1 Get Current User Profile
**GET** `/profiles/me`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "profile-id",
    "userId": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Experienced software engineer...",
    "profileImage": "https://...",
    "expertise": ["JavaScript", "React", "Node.js"],
    "availability": {
      "monday": ["9:00-12:00", "14:00-17:00"],
      "wednesday": ["10:00-16:00"]
    },
    "yearsExperience": 10
  }
}
```

### 3.2 Update Profile
**PUT** `/profiles/me`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio...",
  "expertise": ["JavaScript", "React", "Node.js", "TypeScript"],
  "availability": {
    "monday": ["9:00-12:00"],
    "friday": ["14:00-17:00"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "profile-id",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio...",
    "expertise": ["JavaScript", "React", "Node.js", "TypeScript"]
  },
  "message": "Profile updated successfully"
}
```

### 3.3 Get Profile by ID
**GET** `/profiles/:id`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "profile-id",
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Senior developer...",
    "profileImage": "https://...",
    "expertise": ["Python", "Django", "Machine Learning"],
    "yearsExperience": 8
  }
}
```

### 3.4 Upload Profile Image
**POST** `/profiles/me/image`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body:**
- `image`: File (max 5MB, jpg/png)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profileImage": "https://storage.example.com/profiles/user-id.jpg"
  },
  "message": "Profile image uploaded successfully"
}
```

---

## 4. Mentor Discovery Endpoints

### 4.1 Search Mentors
**GET** `/mentors/search`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `expertise`: string (e.g., "JavaScript")
- `availability`: string (e.g., "monday")
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `sortBy`: string (e.g., "yearsExperience", "rating")

**Example:** `/mentors/search?expertise=JavaScript&page=1&limit=10`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "id": "mentor-id-1",
        "userId": "user-id-1",
        "firstName": "Jane",
        "lastName": "Smith",
        "bio": "Senior developer...",
        "profileImage": "https://...",
        "expertise": ["JavaScript", "React", "Node.js"],
        "yearsExperience": 10,
        "averageRating": 4.8
      },
      {
        "id": "mentor-id-2",
        "userId": "user-id-2",
        "firstName": "Bob",
        "lastName": "Johnson",
        "bio": "Full-stack engineer...",
        "profileImage": "https://...",
        "expertise": ["JavaScript", "Vue.js", "Python"],
        "yearsExperience": 7,
        "averageRating": 4.6
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10
    }
  }
}
```

### 4.2 Get All Mentors
**GET** `/mentors`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page`: number
- `limit`: number

**Response:** Same as search mentors

---

## 5. Session Endpoints

### 5.1 Create Session Request
**POST** `/sessions`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "mentorId": "mentor-user-id",
  "scheduledAt": "2025-11-20T10:00:00Z",
  "duration": 60,
  "menteeNotes": "I'd like to discuss React best practices..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "mentorId": "mentor-user-id",
    "menteeId": "current-user-id",
    "status": "pending",
    "scheduledAt": "2025-11-20T10:00:00Z",
    "duration": 60,
    "menteeNotes": "I'd like to discuss React best practices...",
    "createdAt": "2025-11-13T08:00:00Z"
  },
  "message": "Session request created successfully"
}
```

### 5.2 Get All Sessions (for current user)
**GET** `/sessions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status`: string (pending, accepted, completed, cancelled)
- `role`: string (mentor, mentee) - filter by user's role in session
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "mentor": {
          "id": "mentor-id",
          "firstName": "Jane",
          "lastName": "Smith",
          "profileImage": "https://..."
        },
        "mentee": {
          "id": "mentee-id",
          "firstName": "John",
          "lastName": "Doe",
          "profileImage": "https://..."
        },
        "status": "accepted",
        "scheduledAt": "2025-11-20T10:00:00Z",
        "duration": 60,
        "createdAt": "2025-11-13T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### 5.3 Get Session by ID
**GET** `/sessions/:id`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "mentor": {
      "id": "mentor-id",
      "firstName": "Jane",
      "lastName": "Smith",
      "profileImage": "https://...",
      "email": "jane@example.com"
    },
    "mentee": {
      "id": "mentee-id",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://...",
      "email": "john@example.com"
    },
    "status": "accepted",
    "scheduledAt": "2025-11-20T10:00:00Z",
    "duration": 60,
    "meetingLink": "https://zoom.us/j/...",
    "menteeNotes": "Want to discuss React hooks...",
    "mentorNotes": "Discussed useState and useEffect...",
    "createdAt": "2025-11-13T08:00:00Z",
    "updatedAt": "2025-11-13T09:00:00Z"
  }
}
```

### 5.4 Accept Session Request
**PUT** `/sessions/:id/accept`

**Headers:** `Authorization: Bearer {token}`

**Request Body (Optional):**
```json
{
  "meetingLink": "https://zoom.us/j/123456789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "status": "accepted",
    "meetingLink": "https://zoom.us/j/123456789"
  },
  "message": "Session accepted successfully"
}
```

**Authorization:** Only the mentor can accept

### 5.5 Decline Session Request
**PUT** `/sessions/:id/decline`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "status": "declined"
  },
  "message": "Session declined"
}
```

**Authorization:** Only the mentor can decline

### 5.6 Cancel Session
**PUT** `/sessions/:id/cancel`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "status": "cancelled"
  },
  "message": "Session cancelled successfully"
}
```

**Authorization:** Both mentor and mentee can cancel

### 5.7 Complete Session
**PUT** `/sessions/:id/complete`

**Headers:** `Authorization: Bearer {token}`

**Request Body (Optional):**
```json
{
  "mentorNotes": "Great session, covered React hooks in depth..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "status": "completed",
    "mentorNotes": "Great session, covered React hooks in depth..."
  },
  "message": "Session marked as completed"
}
```

**Authorization:** Only the mentor can mark as completed

### 5.8 Update Session
**PUT** `/sessions/:id`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "scheduledAt": "2025-11-21T10:00:00Z",
  "duration": 90,
  "menteeNotes": "Updated notes..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "scheduledAt": "2025-11-21T10:00:00Z",
    "duration": 90,
    "menteeNotes": "Updated notes..."
  },
  "message": "Session updated successfully"
}
```

---

## 6. Messaging Endpoints

### 6.1 Send Message
**POST** `/messages`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "receiverId": "receiver-user-id",
  "sessionId": "session-id",
  "content": "Hi, looking forward to our session!"
}
```

**Validation:**
- `content`: Required, max 2000 characters, text only
- `receiverId`: Required, valid user ID
- `sessionId`: Optional

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "message-id",
    "senderId": "current-user-id",
    "receiverId": "receiver-user-id",
    "sessionId": "session-id",
    "content": "Hi, looking forward to our session!",
    "messageType": "text",
    "isRead": false,
    "createdAt": "2025-11-13T08:00:00Z"
  },
  "message": "Message sent successfully"
}
```

**Note:** MVP supports text-only messages. File/image attachments will be added in future versions.

### 6.2 Get Messages (Conversation)
**GET** `/messages`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `userId`: string (other user's ID)
- `sessionId`: string (optional)
- `page`: number
- `limit`: number

**Example:** `/messages?userId=other-user-id&sessionId=session-id`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-id-1",
        "senderId": "user-id-1",
        "receiverId": "user-id-2",
        "content": "Hi, looking forward to our session!",
        "isRead": true,
        "readAt": "2025-11-13T08:05:00Z",
        "createdAt": "2025-11-13T08:00:00Z"
      },
      {
        "id": "message-id-2",
        "senderId": "user-id-2",
        "receiverId": "user-id-1",
        "content": "Me too! See you then.",
        "isRead": false,
        "createdAt": "2025-11-13T08:10:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

### 6.3 Get All Conversations
**GET** `/messages/conversations`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "userId": "other-user-id",
        "user": {
          "id": "other-user-id",
          "firstName": "Jane",
          "lastName": "Smith",
          "profileImage": "https://..."
        },
        "lastMessage": {
          "content": "Me too! See you then.",
          "createdAt": "2025-11-13T08:10:00Z",
          "isRead": false
        },
        "unreadCount": 3
      }
    ]
  }
}
```

### 6.4 Mark Message as Read
**PUT** `/messages/:id/read`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "message-id",
    "isRead": true,
    "readAt": "2025-11-13T08:15:00Z"
  },
  "message": "Message marked as read"
}
```

### 6.5 Mark All Messages as Read
**PUT** `/messages/read-all`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "userId": "sender-user-id"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "All messages marked as read"
}
```

---

## 7. Rating Endpoints (Optional for MVP)

### 7.1 Create Rating
**POST** `/ratings`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "sessionId": "session-id",
  "ratedId": "user-id-to-rate",
  "rating": 5,
  "feedback": "Excellent mentor, very helpful!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "rating-id",
    "sessionId": "session-id",
    "rating": 5,
    "feedback": "Excellent mentor, very helpful!",
    "createdAt": "2025-11-13T08:00:00Z"
  },
  "message": "Rating submitted successfully"
}
```

### 7.2 Get Ratings for User
**GET** `/ratings/user/:userId`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalRatings": 25,
    "ratings": [
      {
        "id": "rating-id",
        "rating": 5,
        "feedback": "Excellent mentor!",
        "createdAt": "2025-11-13T08:00:00Z"
      }
    ]
  }
}
```

---

## 8. Admin Endpoints (Optional for MVP)

### 8.1 Get All Users
**GET** `/admin/users`

**Headers:** `Authorization: Bearer {token}`

**Authorization:** Admin only

**Query Parameters:**
- `role`: string
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "email": "user@example.com",
        "role": "mentor",
        "isActive": true,
        "createdAt": "2025-11-01T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

### 8.2 Deactivate User
**PUT** `/admin/users/:id/deactivate`

**Headers:** `Authorization: Bearer {token}`

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### 8.3 Get Platform Statistics
**GET** `/admin/stats`

**Headers:** `Authorization: Bearer {token}`

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "totalMentors": 150,
    "totalMentees": 350,
    "totalSessions": 1200,
    "completedSessions": 800,
    "activeUsers": 320
  }
}
```

---

## 9. WebSocket Events (Real-time Messaging)

### Connection
```javascript
// Client connects with JWT token
socket.connect({
  auth: {
    token: 'jwt-token-here'
  }
});
```

### Events

#### Send Message
```javascript
socket.emit('send_message', {
  receiverId: 'user-id',
  sessionId: 'session-id',
  content: 'Message content'
});
```

#### Receive Message
```javascript
socket.on('new_message', (message) => {
  // message: { id, senderId, content, createdAt, ... }
});
```

#### User Online/Offline
```javascript
socket.on('user_status', (data) => {
  // data: { userId, status: 'online' | 'offline' }
});
```

#### Typing Indicator
```javascript
// Emit typing
socket.emit('typing', { receiverId: 'user-id' });

// Receive typing
socket.on('user_typing', (data) => {
  // data: { userId }
});
```

---

## 10. Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ]
}
```

### HTTP Status Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

---

## 11. Rate Limiting

### Limits
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- Search endpoints: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699891200
```

---

**Next**: Review user flows and UI/UX design considerations.
