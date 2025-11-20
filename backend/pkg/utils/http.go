package utils

import (
	"mentori/internal/models"
	"mentori/pkg/constants"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetUserIDFromContext extracts and validates user ID from Gin context
func GetUserIDFromContext(c *gin.Context) (uuid.UUID, error) {
	userID, exists := c.Get(constants.ContextKeyUserID)
	if !exists {
		return uuid.Nil, ErrUserNotAuthenticated
	}

	// Handle both string and uuid.UUID types
	switch v := userID.(type) {
	case string:
		return uuid.Parse(v)
	case uuid.UUID:
		return v, nil
	default:
		return uuid.Nil, ErrInvalidUserID
	}
}

// GetUserRoleFromContext extracts user role from context
func GetUserRoleFromContext(c *gin.Context) (string, error) {
	role, exists := c.Get(constants.ContextKeyUserRole)
	if !exists {
		return "", ErrUserNotAuthenticated
	}

	roleStr, ok := role.(string)
	if !ok {
		return "", ErrInvalidUserRole
	}

	return roleStr, nil
}

// GetUserEmailFromContext extracts user email from context
func GetUserEmailFromContext(c *gin.Context) (string, error) {
	email, exists := c.Get(constants.ContextKeyUserEmail)
	if !exists {
		return "", ErrUserNotAuthenticated
	}

	emailStr, ok := email.(string)
	if !ok {
		return "", ErrInvalidUserEmail
	}

	return emailStr, nil
}

// RespondWithError sends a standardized error response
func RespondWithError(c *gin.Context, statusCode int, err error, message string) {
	c.JSON(statusCode, models.ErrorResponse{
		Error:   err.Error(),
		Message: message,
		Code:    statusCode,
	})
}

// RespondWithValidationError sends a validation error response
func RespondWithValidationError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{
		Error:   "Validation failed",
		Message: err.Error(),
		Code:    http.StatusBadRequest,
	})
}

// RespondWithSuccess sends a standardized success response
func RespondWithSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}

// RespondWithMessage sends a simple message response
func RespondWithMessage(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"message": message,
	})
}
