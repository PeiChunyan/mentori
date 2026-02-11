package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system (mentor or mentee)
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"not null"` // Never return password in JSON
	Role         string    `json:"role" gorm:"not null;check:role IN ('mentor','mentee','admin')"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	Profile *Profile `json:"profile,omitempty" gorm:"foreignKey:UserID"`
}

// Profile contains additional user information
type Profile struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Bio       string    `json:"bio"`
	AvatarURL string    `json:"avatar_url"`
	Expertise []string  `json:"expertise" gorm:"type:text[]"` // Array of skills/expertise
	Interests []string  `json:"interests" gorm:"type:text[]"` // Array of interests
	Location  string    `json:"location"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// RegisterRequest represents user registration data
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=mentor mentee admin"`
}

// LoginRequest represents user login data
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// UserResponse represents user data returned to client
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Profile   *Profile  `json:"profile,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code,omitempty"`
}

// CreateProfileRequest represents profile creation data
type CreateProfileRequest struct {
	FirstName string   `json:"first_name" binding:"required"`
	LastName  string   `json:"last_name" binding:"required"`
	Bio       string   `json:"bio"`
	AvatarURL string   `json:"avatar_url"`
	Expertise []string `json:"expertise"`
	Interests []string `json:"interests"`
	Location  string   `json:"location"`
}

// UpdateProfileRequest represents profile update data (all fields optional)
type UpdateProfileRequest struct {
	FirstName *string   `json:"first_name,omitempty"`
	LastName  *string   `json:"last_name,omitempty"`
	Bio       *string   `json:"bio,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	Expertise *[]string `json:"expertise,omitempty"`
	Interests *[]string `json:"interests,omitempty"`
	Location  *string   `json:"location,omitempty"`
	IsActive  *bool     `json:"is_active,omitempty"`
}

// ProfileFilters represents filters for profile search
type ProfileFilters struct {
	Expertise *[]string `json:"expertise,omitempty"`
	Interests *[]string `json:"interests,omitempty"`
	Location  string    `json:"location,omitempty"`
	Role      string    `json:"role,omitempty"` // mentor, mentee, admin
}
