package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	Environment string

	// Database credentials (used by Docker Compose)
	PostgresUser string
	PostgresPass string
	PostgresDB   string

	// Test user passwords (ONLY used by seed script for creating test accounts)
	// NOT used by the server at runtime - real users set their own passwords via registration
	AdminPassword  string
	MentorPassword string
	MenteePassword string
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	goEnv := getEnv("GO_ENV", "development")

	// Validate critical secrets in production
	if goEnv == "production" {
		if os.Getenv("JWT_SECRET") == "" {
			log.Fatal("❌ FATAL: JWT_SECRET must be set in production!")
		}
		if os.Getenv("DATABASE_URL") == "" {
			log.Fatal("❌ FATAL: DATABASE_URL must be set in production!")
		}
	}

	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/mentori?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		Environment: goEnv,

		// Database credentials (for Docker Compose)
		PostgresUser: getEnv("POSTGRES_USER", "user"),
		PostgresPass: getEnv("POSTGRES_PASSWORD", "password"),
		PostgresDB:   getEnv("POSTGRES_DB", "mentori"),

		// Test passwords (only for seed script - server never reads these)
		AdminPassword:  getEnv("ADMIN_PASSWORD", ""),
		MentorPassword: getEnv("MENTOR_PASSWORD", ""),
		MenteePassword: getEnv("MENTEE_PASSWORD", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
