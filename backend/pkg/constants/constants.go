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

// Expertise options for mentors/mentees
var ExpertiseOptions = []string{
	"Find a Job",
	"Bachelor's Degree",
	"Master's Degree",
	"Doctoral Studies",
	"YKI Test Preparation",
	"Finnish Marriage & Family",
	"Work-Life Balance",
	"Starting a Business",
	"Housing & Relocation",
	"Finnish Language Learning",
	"Healthcare System",
	"Education System",
	"Banking & Finance",
	"Integration & Culture",
	"Networking & Socializing",
}

// Interest options for mentors/mentees
var InterestOptions = []string{
	"Reading & Books",
	"Bars & Nightlife",
	"Musical Instruments",
	"Hiking & Outdoor",
	"Indoor Sports",
	"Gym & Fitness",
	"Winter Sports",
	"Board Games",
	"Coffee Culture",
	"Foodie & Restaurants",
	"Arts & Museums",
	"Tech & Gaming",
	"Music & Concerts",
	"Photography",
	"Crafts & DIY",
	"Movies & TV Shows",
	"Cooking & Baking",
	"Traveling",
	"Cycling",
	"Running",
}
