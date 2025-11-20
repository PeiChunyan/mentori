package middleware

import (
	"errors"
	"net/http"
	"os"
	"strings"

	"mentori/internal/models"
	"mentori/pkg/constants"
	"mentori/pkg/logger"
	"mentori/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWTAuth middleware validates JWT tokens
func JWTAuth() gin.HandlerFunc {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		// Check environment mode
		goEnv := os.Getenv("GO_ENV")
		if goEnv == "production" {
			panic("❌ FATAL: JWT_SECRET must be set in production environment!")
		}
		// Warn in development
		logger.Warn("Using default JWT secret (development only)")
		jwtSecret = []byte("dev-only-secret-not-for-production")
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader(constants.HeaderAuthorization)
		if authHeader == "" {
			logger.Warn("Authorization header missing")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   utils.ErrUserNotAuthenticated.Error(),
				Message: "Please provide a Bearer token",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if it starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			logger.Warn("Invalid authorization format")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   utils.ErrInvalidToken.Error(),
				Message: "Authorization header must start with 'Bearer '",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Extract token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			logger.Warn("Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   utils.ErrInvalidToken.Error(),
				Message: "Token is invalid or expired",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			logger.Warn("Failed to extract claims")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   utils.ErrInvalidToken.Error(),
				Message: "Token claims are invalid",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Set user information in context using constants
		c.Set(constants.ContextKeyUserID, claims["user_id"].(string))
		c.Set(constants.ContextKeyUserEmail, claims["email"].(string))
		c.Set(constants.ContextKeyUserRole, claims["role"].(string))
		c.Set("user", claims) // Also set full claims for handlers

		logger.Debug("User authenticated: %s", claims["email"])
		c.Next()
	}
}
