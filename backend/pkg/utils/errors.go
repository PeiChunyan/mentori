package utils

import "errors"

// Common error definitions for consistency across the application
var (
	// Authentication errors
	ErrUserNotAuthenticated = errors.New("user not authenticated")
	ErrInvalidToken         = errors.New("invalid or expired token")
	ErrUnauthorized         = errors.New("unauthorized access")
	ErrInvalidCredentials   = errors.New("invalid email or password")

	// User errors
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrInvalidUserID     = errors.New("invalid user ID format")
	ErrInvalidUserRole   = errors.New("invalid user role")
	ErrInvalidUserEmail  = errors.New("invalid user email")

	// Profile errors
	ErrProfileNotFound      = errors.New("profile not found")
	ErrProfileAlreadyExists = errors.New("profile already exists")
	ErrInvalidProfileData   = errors.New("invalid profile data")

	// Validation errors
	ErrValidationFailed = errors.New("validation failed")
	ErrInvalidInput     = errors.New("invalid input data")
	ErrMissingField     = errors.New("required field missing")

	// Database errors
	ErrDatabaseConnection = errors.New("database connection failed")
	ErrDatabaseQuery      = errors.New("database query failed")
	ErrRecordNotFound     = errors.New("record not found")

	// Session errors
	ErrSessionNotFound      = errors.New("session not found")
	ErrSessionAlreadyExists = errors.New("session already exists")
	ErrInvalidSessionStatus = errors.New("invalid session status")

	// General errors
	ErrInternalServer = errors.New("internal server error")
	ErrNotImplemented = errors.New("feature not implemented")
	ErrForbidden      = errors.New("forbidden")
)

// IsNotFoundError checks if an error is a "not found" type error
func IsNotFoundError(err error) bool {
	return errors.Is(err, ErrUserNotFound) ||
		errors.Is(err, ErrProfileNotFound) ||
		errors.Is(err, ErrSessionNotFound) ||
		errors.Is(err, ErrRecordNotFound)
}

// IsConflictError checks if an error is a "conflict" type error
func IsConflictError(err error) bool {
	return errors.Is(err, ErrUserAlreadyExists) ||
		errors.Is(err, ErrProfileAlreadyExists) ||
		errors.Is(err, ErrSessionAlreadyExists)
}

// IsValidationError checks if an error is a validation type error
func IsValidationError(err error) bool {
	return errors.Is(err, ErrValidationFailed) ||
		errors.Is(err, ErrInvalidInput) ||
		errors.Is(err, ErrMissingField)
}

// IsAuthError checks if an error is an authentication type error
func IsAuthError(err error) bool {
	return errors.Is(err, ErrUserNotAuthenticated) ||
		errors.Is(err, ErrInvalidToken) ||
		errors.Is(err, ErrInvalidCredentials) ||
		errors.Is(err, ErrUnauthorized)
}
