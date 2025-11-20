package constants

// User roles
const (
	RoleMentor = "mentor"
	RoleMentee = "mentee"
	RoleAdmin  = "admin"
)

// Valid roles for validation
var ValidRoles = []string{RoleMentor, RoleMentee, RoleAdmin}

// Session status
const (
	SessionStatusPending   = "pending"
	SessionStatusAccepted  = "accepted"
	SessionStatusRejected  = "rejected"
	SessionStatusScheduled = "scheduled"
	SessionStatusCompleted = "completed"
	SessionStatusCancelled = "cancelled"
)

// Valid session statuses
var ValidSessionStatuses = []string{
	SessionStatusPending,
	SessionStatusAccepted,
	SessionStatusRejected,
	SessionStatusScheduled,
	SessionStatusCompleted,
	SessionStatusCancelled,
}

// API versioning
const (
	APIVersion = "v1"
	APIPrefix  = "/api"
)

// Pagination defaults
const (
	DefaultPageSize = 20
	MaxPageSize     = 100
)

// Token expiration (in hours)
const (
	AccessTokenExpiry  = 24  // 24 hours
	RefreshTokenExpiry = 168 // 7 days
)

// HTTP header names
const (
	HeaderAuthorization = "Authorization"
	HeaderContentType   = "Content-Type"
	HeaderAccept        = "Accept"
)

// Content types
const (
	ContentTypeJSON = "application/json"
)

// Context keys
const (
	ContextKeyUserID    = "user_id"
	ContextKeyUserEmail = "user_email"
	ContextKeyUserRole  = "user_role"
)

// Environment values
const (
	EnvDevelopment = "development"
	EnvStaging     = "staging"
	EnvProduction  = "production"
)

// Log levels
const (
	LogLevelDebug = "debug"
	LogLevelInfo  = "info"
	LogLevelWarn  = "warn"
	LogLevelError = "error"
)
