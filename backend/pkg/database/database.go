package database

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
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
	// Optional: reset DB when explicitly requested (development only)
	if os.Getenv("RESET_DB") == "true" {
		log.Println("RESET_DB=true: Dropping tables before migration (development only)")
		DB.Migrator().DropTable(&models.User{}, &models.Profile{}, &models.EmailVerification{})
	}

	if err := DB.AutoMigrate(&models.User{}, &models.Profile{}, &models.EmailVerification{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Run SQL migration files AFTER AutoMigrate (to alter/fix tables)
	if err := runSQLMigrations(); err != nil {
		log.Fatal("Failed to run SQL migrations:", err)
	}

	log.Println("Database connected successfully with optimized connection pooling")
}

// runSQLMigrations executes all .sql files in the migrations directory
func runSQLMigrations() error {
	migrationsDir := "migrations"

	// Read migration files
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		if os.IsNotExist(err) {
			// Migration directory doesn't exist, skip
			return nil
		}
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Sort files to ensure consistent order
	var sqlFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			sqlFiles = append(sqlFiles, file.Name())
		}
	}
	sort.Strings(sqlFiles)

	// Execute each migration file
	for _, fileName := range sqlFiles {
		filePath := filepath.Join(migrationsDir, fileName)
		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", fileName, err)
		}

		log.Printf("Running migration: %s", fileName)
		if err := DB.Exec(string(content)).Error; err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", fileName, err)
		}
	}

	return nil
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
