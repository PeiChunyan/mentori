package main

import (
	"encoding/json"
	"log"
	"os"

	"mentori/internal/models"
	"mentori/internal/services"
	"mentori/pkg/config"
	"mentori/pkg/database"

	"github.com/google/uuid"
	"gorm.io/datatypes"
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

	// Create mentor profiles
	log.Println("\nCreating mentor profiles...")

	// Get the actual mentor user ID for profile creation
	var mentorUser models.User
	database.GetDB().Where("email = ?", "mentor@mentori.com").First(&mentorUser)

	// Define mock mentors with new options
	type MentorData struct {
		FirstName string
		LastName  string
		Bio       string
		Expertise []string
		Interests []string
		Location  string
	}

	mockMentorsData := []MentorData{
		{
			FirstName: "Maria",
			LastName:  "Korhonen",
			Bio:       "Finnish HR professional helping newcomers navigate the job market. 10+ years in recruitment and career counseling.",
			Expertise: []string{"Find a Job", "Work-Life Balance", "Networking & Socializing"},
			Interests: []string{"Coffee Culture", "Winter Sports", "Hiking & Outdoor"},
			Location:  "Helsinki",
		},
		{
			FirstName: "Jukka",
			LastName:  "Virtanen",
			Bio:       "Software engineer and startup founder. Love helping people transition into tech careers in Finland.",
			Expertise: []string{"Find a Job", "Starting a Business", "Integration & Culture"},
			Interests: []string{"Tech & Gaming", "Gym & Fitness", "Board Games"},
			Location:  "Tampere",
		},
		{
			FirstName: "Anna",
			LastName:  "Lindström",
			Bio:       "University advisor with experience helping international students. Fluent in 5 languages.",
			Expertise: []string{"Bachelor's Degree", "Master's Degree", "Finnish Language Learning"},
			Interests: []string{"Reading & Books", "Arts & Museums", "Traveling"},
			Location:  "Turku",
		},
		{
			FirstName: "Mikko",
			LastName:  "Salo",
			Bio:       "PhD in environmental science. Happy to guide doctoral students through Finnish academia.",
			Expertise: []string{"Doctoral Studies", "Master's Degree", "Education System"},
			Interests: []string{"Hiking & Outdoor", "Photography", "Cycling"},
			Location:  "Oulu",
		},
		{
			FirstName: "Li",
			LastName:  "Zhang",
			Bio:       "Immigration consultant who moved to Finland 8 years ago. Specialized in YKI preparation.",
			Expertise: []string{"YKI Test Preparation", "Finnish Language Learning", "Housing & Relocation"},
			Interests: []string{"Cooking & Baking", "Foodie & Restaurants", "Coffee Culture"},
			Location:  "Helsinki",
		},
		{
			FirstName: "Ahmed",
			LastName:  "Hassan",
			Bio:       "Family counselor helping with integration. Married to a Finn, understand both cultures well.",
			Expertise: []string{"Finnish Marriage & Family", "Integration & Culture", "Healthcare System"},
			Interests: []string{"Movies & TV Shows", "Indoor Sports", "Cooking & Baking"},
			Location:  "Espoo",
		},
		{
			FirstName: "Sanna",
			LastName:  "Mäkinen",
			Bio:       "Business consultant and entrepreneur. Can help you start your business in Finland.",
			Expertise: []string{"Starting a Business", "Banking & Finance", "Find a Job"},
			Interests: []string{"Running", "Coffee Culture", "Music & Concerts"},
			Location:  "Helsinki",
		},
		{
			FirstName: "Thomas",
			LastName:  "Schmidt",
			Bio:       "Real estate agent specializing in helping foreigners find homes. Know all the tricks!",
			Expertise: []string{"Housing & Relocation", "Banking & Finance", "Integration & Culture"},
			Interests: []string{"Cycling", "Bars & Nightlife", "Foodie & Restaurants"},
			Location:  "Vantaa",
		},
	}

	// Create profiles for each mentor
	for _, data := range mockMentorsData {
		var existingProfile models.Profile
		result := database.GetDB().Where("first_name = ? AND last_name = ?", data.FirstName, data.LastName).First(&existingProfile)
		if result.Error == nil {
			log.Printf("Mentor profile for %s %s already exists, skipping...\n", data.FirstName, data.LastName)
		} else {
			// Convert expertise and interests to JSON
			expertiseJSON, _ := json.Marshal(data.Expertise)
			interestsJSON, _ := json.Marshal(data.Interests)

			profile := models.Profile{
				ID:        uuid.New(),
				UserID:    mentorUser.ID,
				FirstName: data.FirstName,
				LastName:  data.LastName,
				Bio:       data.Bio,
				Expertise: datatypes.JSON(expertiseJSON),
				Interests: datatypes.JSON(interestsJSON),
				Location:  data.Location,
				IsActive:  true,
			}

			log.Printf("Creating mentor profile for %s %s...\n", data.FirstName, data.LastName)
			if err := database.GetDB().Create(&profile).Error; err != nil {
				log.Printf("Warning: Failed to create profile for %s %s: %v\n", data.FirstName, data.LastName, err)
			} else {
				log.Printf("✅ Created profile for %s %s\n", data.FirstName, data.LastName)
			}
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
