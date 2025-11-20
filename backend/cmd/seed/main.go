package main

import (
	"log"
	"os"

	"mentori/internal/models"
	"mentori/internal/services"
	"mentori/pkg/config"
	"mentori/pkg/database"

	"github.com/google/uuid"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	database.InitDB(cfg.DatabaseURL)

	log.Println("Starting database seeding...")

	authService := services.NewAuthService()

	// Get test user passwords from environment variables
	// These are ONLY used for creating test accounts - not used by the server
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		log.Fatal("❌ ADMIN_PASSWORD environment variable is required for seeding")
	}

	mentorPassword := os.Getenv("MENTOR_PASSWORD")
	if mentorPassword == "" {
		log.Fatal("❌ MENTOR_PASSWORD environment variable is required for seeding")
	}

	menteePassword := os.Getenv("MENTEE_PASSWORD")
	if menteePassword == "" {
		log.Fatal("❌ MENTEE_PASSWORD environment variable is required for seeding")
	}

	// Create admin user
	adminPasswordHash, err := authService.HashPassword(adminPassword)
	if err != nil {
		log.Fatal("Failed to hash admin password:", err)
	}

	admin := &models.User{
		ID:           uuid.New(),
		Email:        "admin@mentori.com",
		PasswordHash: adminPasswordHash,
		Role:         "admin",
	}

	// Check if admin already exists
	var existingAdmin models.User
	result := database.GetDB().Where("email = ?", admin.Email).First(&existingAdmin)
	if result.Error == nil {
		log.Println("Admin user already exists, updating password...")
		existingAdmin.PasswordHash = adminPasswordHash
		if err := database.GetDB().Save(&existingAdmin).Error; err != nil {
			log.Fatal("Failed to update admin password:", err)
		}
	} else {
		log.Println("Creating admin user...")
		if err := database.GetDB().Create(admin).Error; err != nil {
			log.Fatal("Failed to create admin user:", err)
		}
	}

	// Create test mentor
	mentorPasswordHash, err := authService.HashPassword(mentorPassword)
	if err != nil {
		log.Fatal("Failed to hash mentor password:", err)
	}

	mentor := &models.User{
		ID:           uuid.New(),
		Email:        "mentor@mentori.com",
		PasswordHash: mentorPasswordHash,
		Role:         "mentor",
	}

	var existingMentor models.User
	result = database.GetDB().Where("email = ?", mentor.Email).First(&existingMentor)
	if result.Error == nil {
		log.Println("Test mentor already exists, skipping...")
	} else {
		log.Println("Creating test mentor...")
		if err := database.GetDB().Create(mentor).Error; err != nil {
			log.Fatal("Failed to create test mentor:", err)
		}
	}

	// Create test mentee
	menteePasswordHash, err := authService.HashPassword(menteePassword)
	if err != nil {
		log.Fatal("Failed to hash mentee password:", err)
	}

	mentee := &models.User{
		ID:           uuid.New(),
		Email:        "mentee@mentori.com",
		PasswordHash: menteePasswordHash,
		Role:         "mentee",
	}

	var existingMentee models.User
	result = database.GetDB().Where("email = ?", mentee.Email).First(&existingMentee)
	if result.Error == nil {
		log.Println("Test mentee already exists, skipping...")
	} else {
		log.Println("Creating test mentee...")
		if err := database.GetDB().Create(mentee).Error; err != nil {
			log.Fatal("Failed to create test mentee:", err)
		}
	}

	log.Println("✅ Database seeding completed successfully!")
	log.Println("\n🔐 Test Credentials:")
	log.Println("-------------------")
	log.Println("Admin:  admin@mentori.com  / (check your .env file for ADMIN_PASSWORD)")
	log.Println("Mentor: mentor@mentori.com / (check your .env file for MENTOR_PASSWORD)")
	log.Println("Mentee: mentee@mentori.com / (check your .env file for MENTEE_PASSWORD)")
	log.Println("\n⚠️  WARNING: These passwords are stored in your .env file")
	log.Println("   Change them before deploying to production!")
}
