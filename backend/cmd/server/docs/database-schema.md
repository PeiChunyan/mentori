# Database Schema# Database Schema - Mentori MVP



## 1. Overview## 1. Overview

This document defines the database schema for the Mentori platform using a relational database approach (PostgreSQL recommended).

Mentori uses PostgreSQL 15 as the primary database. The schema is managed through GORM migrations and follows a normalized design with clear relationships between entities.

### 3.4 Profiles Table a relational database approach (PostgreSQL recommended).

**Database Name:** `mentori`  

**ORM:** GORM v1.31.1  ## 2. Entity Relationship Diagram (ERD)

**Migration Strategy:** Auto-migration on server startup

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │◄─────┐
│ email           │      │
│ password_hash   │      │
│ role            │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
         │               │
         │ 1:1           │
         ▼               │
┌─────────────────┐      │
│   Profiles      │      │
│─────────────────│      │
│ id (PK)         │      │
│ user_id (FK)    │──────┘
│ first_name      │
│ last_name       │
│ bio             │
│ profile_image   │
│ expertise       │ (JSON/TEXT for mentors)
│ interests       │ (JSON/TEXT for mentees)
│ availability    │ (JSON for mentors)
│ goals           │ (TEXT for mentees)
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐        ┌─────────────────┐
│    Sessions     │        │    Messages     │
│─────────────────│        │─────────────────│
│ id (PK)         │        │ id (PK)         │
│ mentor_id (FK)  │◄───┐   │ session_id (FK) │
│ mentee_id (FK)  │    │   │ sender_id (FK)  │
│ status          │    │   │ content         │
│ scheduled_at    │    │   │ read_at         │
│ duration        │    └───│ created_at      │
│ notes           │        └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## 3. Table Definitions

### 3.1 Users Table
Stores authentication and basic user information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee', 'admin')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique)
- `password_hash`: Hashed password (bcrypt)
- `role`: User type (mentor, mentee, or admin)
- `is_active`: Account status
- `is_verified`: Email verification status
- `last_login`: Last login timestamp
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### 3.2 Profiles Table
Stores detailed profile information for both mentors and mentees.

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(500),
    phone VARCHAR(20),
    location VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Mentor-specific fields
    expertise JSONB,  -- ["JavaScript", "React", "Career Development"]
    availability JSONB,  -- {"monday": ["9:00-12:00", "14:00-17:00"], ...}
    hourly_rate DECIMAL(10, 2),
    years_experience INTEGER,
    
    -- Mentee-specific fields
    interests JSONB,  -- ["Web Development", "Career Transition"]
    goals TEXT,
    experience_level VARCHAR(50),  -- beginner, intermediate, advanced
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_expertise ON profiles USING GIN(expertise);
CREATE INDEX idx_profiles_interests ON profiles USING GIN(interests);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Reference to users table
- `first_name`, `last_name`: User's name
- `bio`: Profile description
- `profile_image`: URL to profile picture
- `expertise`: Array of mentor's skills (for mentors)
- `availability`: Weekly availability schedule (for mentors)
- `interests`: Array of mentee's interests (for mentees)
- `goals`: Learning objectives (for mentees)

### 3.3 Sessions Table
Stores mentoring session information.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    duration INTEGER DEFAULT 60,  -- in minutes
    meeting_link VARCHAR(500),
    notes TEXT,
    mentee_notes TEXT,  -- Notes from mentee about what they want to discuss
    mentor_notes TEXT,  -- Notes from mentor after session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX idx_sessions_mentee_id ON sessions(mentee_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);

-- Composite indexes for common queries
CREATE INDEX idx_sessions_mentor_status ON sessions(mentor_id, status);
CREATE INDEX idx_sessions_mentee_status ON sessions(mentee_id, status);
```

**Fields:**
- `id`: Unique identifier
- `mentor_id`: Reference to mentor user
- `mentee_id`: Reference to mentee user
- `status`: Session state (pending, accepted, declined, completed, cancelled)
- `scheduled_at`: Scheduled date/time for session
- `duration`: Session length in minutes
- `meeting_link`: Video conference URL
- `notes`: General session notes
- `mentee_notes`: What mentee wants to discuss
- `mentor_notes`: Post-session notes from mentor

### 3.4 Messages Table
Stores messages between mentors and mentees.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),  -- Limit to 2000 characters
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type = 'text'),  -- Text only for MVP
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

**Fields:**
- `id`: Unique identifier
- `session_id`: Optional reference to related session
- `sender_id`: User who sent the message
- `receiver_id`: User who receives the message
- `content`: Message text (max 2000 characters for MVP)
- `message_type`: Always 'text' for MVP (can support 'file', 'image' in future)
- `is_read`: Read status
- `read_at`: When message was read
- `created_at`: Message timestamp

### 3.5 Ratings Table (Optional for MVP, recommended for future)
Stores feedback and ratings for completed sessions.

```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ratings_session_id ON ratings(session_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
```

**Fields:**
- `id`: Unique identifier
- `session_id`: Reference to rated session
- `rater_id`: User giving the rating
- `rated_id`: User being rated
- `rating`: Score (1-5)
- `feedback`: Text feedback

## 4. Data Models (ORM/ODM Representation)

### 4.1 User Model
```javascript
{
  id: UUID,
  email: String,
  passwordHash: String,
  role: Enum['mentor', 'mentee', 'admin'],
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  
  // Relations
  profile: Profile,
  mentorSessions: [Session],
  menteeSessions: [Session],
  sentMessages: [Message],
  receivedMessages: [Message]
}
```

### 4.2 Profile Model
```javascript
{
  id: UUID,
  userId: UUID,
  firstName: String,
  lastName: String,
  bio: String,
  profileImage: String,
  phone: String,
  location: String,
  timezone: String,
  
  // Mentor-specific
  expertise: [String],
  availability: Object,
  hourlyRate: Number,
  yearsExperience: Number,
  
  // Mentee-specific
  interests: [String],
  goals: String,
  experienceLevel: String,
  
  createdAt: Date,
  updatedAt: Date,
  
  // Relations
  user: User
}
```

### 4.3 Session Model
```javascript
{
  id: UUID,
  mentorId: UUID,
  menteeId: UUID,
  status: Enum['pending', 'accepted', 'declined', 'completed', 'cancelled'],
  scheduledAt: Date,
  duration: Number,
  meetingLink: String,
  notes: String,
  menteeNotes: String,
  mentorNotes: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Relations
  mentor: User,
  mentee: User,
  messages: [Message],
  rating: Rating
}
```

### 4.4 Message Model
```javascript
{
  id: UUID,
  sessionId: UUID,
  senderId: UUID,
  receiverId: UUID,
  content: String,  // Max 2000 characters
  messageType: 'text',  // Only 'text' for MVP
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  
  // Relations
  session: Session,
  sender: User,
  receiver: User
}
```

## 5. Sample Data

### Sample User (Mentor)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "jane.mentor@example.com",
  "role": "mentor",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Senior software engineer with 10 years of experience",
    "expertise": ["JavaScript", "React", "Node.js", "Career Development"],
    "availability": {
      "monday": ["9:00-12:00", "14:00-17:00"],
      "wednesday": ["10:00-16:00"],
      "friday": ["9:00-13:00"]
    },
    "yearsExperience": 10
  }
}
```

### Sample User (Mentee)
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "john.mentee@example.com",
  "role": "mentee",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Aspiring full-stack developer",
    "interests": ["Web Development", "JavaScript", "Career Transition"],
    "goals": "Learn modern web development and transition to tech career",
    "experienceLevel": "beginner"
  }
}
```

## 6. Database Constraints and Business Rules

### Constraints
1. Email must be unique across all users
2. User can only have one profile
3. Sessions must have both a mentor and mentee
4. Messages must have both sender and receiver
5. Ratings can only be for completed sessions
6. A session can only have one rating per user

### Business Rules
1. Mentors cannot create sessions with themselves
2. Only mentees can request sessions
3. Only mentors can accept/decline session requests
4. Both parties can cancel sessions
5. Messages can only be sent between users with an existing session
6. Ratings can only be submitted after session is completed

## 7. Data Validation Rules

### Email
- Valid email format
- Unique in system
- Required

### Password
- Minimum 8 characters
- Must contain uppercase, lowercase, number
- Hashed using bcrypt

### Profile
- First name and last name required
- Bio max 1000 characters
- Expertise/interests: max 10 items

### Session
- Scheduled time must be in the future
- Duration: 30-180 minutes
- Status transitions: pending → accepted → completed
                       pending → declined
                       accepted → cancelled

### Message
- Content max 2000 characters
- Text only (no files, images, or attachments for MVP)
- Must have both sender and receiver

## 8. Backup and Migration Strategy

### Backup
- Daily automated backups
- Point-in-time recovery enabled
- 30-day retention period

### Migrations
- Use migration tool (e.g., Flyway, Liquibase, or ORM migrations)
- Version control all schema changes
- Test migrations in staging before production

---

**Next**: Review API endpoints specification for CRUD operations on these models.
