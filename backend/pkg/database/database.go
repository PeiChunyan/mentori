package database

import (
	"log"
	"time"

	"mentori/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(databaseURL string) {
	var err error
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 🚀 OPTIMIZATION: Configure connection pooling for better performance
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get generic database object:", err)
	}

	// Set optimal connection pool settings
	sqlDB.SetMaxIdleConns(10)           // Maximum idle connections
	sqlDB.SetMaxOpenConns(100)          // Maximum open connections
	sqlDB.SetConnMaxLifetime(time.Hour) // Connection max lifetime (1 hour)

	// Auto-migrate the schema
	// Drop tables if they exist to avoid migration issues during development
	DB.Migrator().DropTable(&models.User{}, &models.Profile{})
	if err := DB.AutoMigrate(&models.User{}, &models.Profile{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database connected successfully with optimized connection pooling")
}

func GetDB() *gorm.DB {
	return DB
}

// 🚀 OPTIMIZATION: Add health check function
func HealthCheck() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// 🚀 OPTIMIZATION: Add graceful shutdown
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
