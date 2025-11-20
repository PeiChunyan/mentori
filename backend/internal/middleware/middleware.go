package middleware

import (
	"fmt"
	"net/http"
	"time"

	"mentori/internal/models"
	"mentori/pkg/constants"
	"mentori/pkg/logger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS middleware with security
func CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "https://mentori.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	return cors.New(config)
}

// Logger with structured output
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[%s] %s %s %d %s %s %d\n",
			param.TimeStamp.Format("2006/01/02 15:04:05"),
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
			param.ClientIP,
			param.BodySize,
		)
	})
}

// RateLimit middleware
func RateLimit() gin.HandlerFunc {
	// Simple in-memory rate limiter
	type clientInfo struct {
		count     int
		resetTime time.Time
	}

	clients := make(map[string]*clientInfo)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		if cli, exists := clients[ip]; exists {
			if now.After(cli.resetTime) {
				cli.count = 1
				cli.resetTime = now.Add(time.Minute)
			} else if cli.count >= 100 { // 100 requests per minute
				c.JSON(429, gin.H{
					"error":   "Too many requests",
					"message": "Rate limit exceeded. Try again later.",
				})
				c.Abort()
				return
			} else {
				cli.count++
			}
		} else {
			clients[ip] = &clientInfo{
				count:     1,
				resetTime: now.Add(time.Minute),
			}
		}

		c.Next()
	}
}

// SecurityHeaders middleware
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	}
}

// AdminOnly middleware ensures only admin users can access the endpoint
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(constants.ContextKeyUserRole)
		if !exists {
			logger.Warn("User role not found in context")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Unauthorized",
				Message: "Authentication required",
			})
			c.Abort()
			return
		}

		if userRole.(string) != "admin" {
			logger.Warn("Non-admin user attempted to access admin endpoint: %s", userRole)
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error:   "Forbidden",
				Message: "Admin access required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
