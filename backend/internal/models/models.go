package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// User represents a user in the system (mentor or mentee)
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:""` // Nullable for OAuth users
	Role         string    `json:"role" gorm:"check:role IN ('mentor','mentee','admin')"`
	
	// OAuth and verification fields
	Provider     string    `json:"provider" gorm:"default:'local';index:idx_provider_user"` // local, google, apple
	ProviderID   string    `json:"-" gorm:"index:idx_provider_user"`                        // OAuth provider user ID
	IsVerified   bool      `json:"is_verified" gorm:"default:false"`
	
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	Profile *Profile `json:"profile,omitempty" gorm:"foreignKey:UserID"`
}

// EmailVerification stores verification codes for email authentication
type EmailVerification struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email      string    `json:"email" gorm:"index;not null"`
	Code       string    `json:"-" gorm:"not null"`
	ExpiresAt  time.Time `json:"expires_at" gorm:"not null"`
	IsUsed     bool      `json:"is_used" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at"`
}

// Profile contains additional user information
type Profile struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Bio       string    `json:"bio"`
	AvatarURL string    `json:"avatar_url"`
	Expertise datatypes.JSON `json:"expertise" gorm:"type:jsonb"`
	Interests datatypes.JSON `json:"interests" gorm:"type:jsonb"`
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

// OAuthLoginRequest represents OAuth login data
type OAuthLoginRequest struct {
	Provider string `json:"provider" binding:"required,oneof=google apple"`
	IDToken  string `json:"id_token" binding:"required"`
	Role     string `json:"role" binding:"omitempty,oneof=mentor mentee"` // Only for new users
}

// EmailVerificationRequest requests a verification code
type EmailVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// EmailVerificationLoginRequest verifies code and logs in
type EmailVerificationLoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
	Role  string `json:"role" binding:"omitempty,oneof=mentor mentee"` // Only for new users
}

// OAuthUser represents user data from OAuth provider
type OAuthUser struct {
	Email      string
	ProviderID string
	IsVerified bool
	Name       string
}

// NewUserResponse indicates a new user needs role selection
type NewUserResponse struct {
	IsNewUser bool   `json:"is_new_user"`
	Email     string `json:"email"`
	Provider  string `json:"provider"`
	Token     string `json:"temp_token,omitempty"` // Temporary token for role selection
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
