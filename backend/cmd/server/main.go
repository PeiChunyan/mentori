package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "mentori/cmd/server/docs"
	"mentori/internal/handlers"
	"mentori/internal/middleware"
	gormrepo "mentori/internal/repository/gorm"
	"mentori/pkg/config"
	"mentori/pkg/database"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Mentori API
// @version         1.0
// @description     Mentorship platform API with JWT authentication
// @host            localhost:8080
// @BasePath        /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter your JWT token (Swagger will automatically add "Bearer" prefix)
func main() {
	// 🚀 OPTIMIZATION: Set Gin mode based on environment
	if os.Getenv("ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	database.InitDB(cfg.DatabaseURL)

	// Initialize repositories
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	profileRepo := gormrepo.NewProfileRepository(database.GetDB())

	// Initialize handlers with repositories directly
	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	oauthHandler := handlers.NewOAuthHandler(userRepo, cfg.JWTSecret)
	emailVerificationHandler := handlers.NewEmailVerificationHandler(userRepo, cfg.JWTSecret)
	profileHandler := handlers.NewProfileHandler(profileRepo, userRepo) // Profile handler for swagger generation
	adminHandler := handlers.NewAdminHandler(userRepo, profileRepo)

	// Initialize Gin router
	r := gin.New() // 🚀 OPTIMIZATION: Use gin.New() instead of gin.Default() for custom middleware

	// 🚀 OPTIMIZATION: Add middleware in optimal order for performance
	r.Use(middleware.SecurityHeaders())       // Security first
	r.Use(middleware.CORS())                  // CORS
	r.Use(gin.Recovery())                     // Recovery
	r.Use(gzip.Gzip(gzip.DefaultCompression)) // Compression
	r.Use(middleware.RateLimit())             // Rate limiting
	r.Use(middleware.Logger())                // Logging last for performance

	// 🚀 OPTIMIZATION: Enhanced health check endpoint
	r.GET("/health", handlers.HealthCheck)
	r.GET("/ready", handlers.ReadinessCheck)

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			// Traditional auth
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/profile", authHandler.GetProfile) // Get current user profile
			
			// OAuth authentication
			auth.POST("/oauth/login", oauthHandler.OAuthLogin)
			
			// Email verification authentication
			auth.POST("/email/send-code", emailVerificationHandler.SendVerificationCode)
			auth.POST("/email/verify", emailVerificationHandler.VerifyCodeAndLogin)
		}

		// Profile routes (require authentication)
		profiles := v1.Group("/profiles")
		profiles.Use(middleware.JWTAuth())
		{
			profiles.POST("", profileHandler.CreateProfile)
			profiles.GET("", profileHandler.GetMyProfile)
			profiles.PUT("", profileHandler.UpdateProfile)
			profiles.DELETE("", profileHandler.DeleteProfile)
			profiles.GET("/public", profileHandler.GetPublicProfiles)
		}

		// Admin routes (require authentication and admin role)
		admin := v1.Group("/admin")
		admin.Use(middleware.JWTAuth())
		admin.Use(middleware.AdminOnly())
		{
			admin.DELETE("/users/:userId", adminHandler.DeleteUser)
		}
	}

	// 🚀 OPTIMIZATION: Graceful shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	// Close database connection
	if err := database.Close(); err != nil {
		log.Printf("Error closing database: %v", err)
	}

	log.Println("Server exited")
}
