package handlers

import (
	"net/http"
	"time"

	"mentori/pkg/database"

	"github.com/gin-gonic/gin"
)

// 🚀 OPTIMIZATION: Enhanced health check with database connectivity
func HealthCheck(c *gin.Context) {
	// Check database health
	dbHealthy := true
	if err := database.HealthCheck(); err != nil {
		dbHealthy = false
	}

	status := "healthy"
	statusCode := http.StatusOK

	if !dbHealthy {
		status = "unhealthy"
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, gin.H{
		"status":    status,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"version":   "1.0.0",
		"services": gin.H{
			"database": dbHealthy,
		},
		"uptime": "unknown", // Would be tracked in production
	})
}

// 🚀 OPTIMIZATION: Add readiness check for Kubernetes/load balancers
func ReadinessCheck(c *gin.Context) {
	// Readiness check - ensure app can handle requests
	// In production, check dependencies like Redis, external APIs, etc.

	if err := database.HealthCheck(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    "not ready",
			"reason":    "database unavailable",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "ready",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}
