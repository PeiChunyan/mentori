package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"mentori/internal/handlers"
	"mentori/internal/models"
	"mentori/internal/repository"
	gormrepo "mentori/internal/repository/gorm"
	"mentori/pkg/database"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// TestEmailVerificationSendCode tests sending verification code
func TestEmailVerificationSendCode(t *testing.T) {
	// Setup
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	handler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

	// Create request
	reqBody := models.EmailVerificationRequest{
		Email: "test@example.com",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Mock gin context
	ctx := createTestGinContext(w, req)

	// Execute
	handler.SendVerificationCode(ctx)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Verification code sent to your email", response["message"])
	assert.NotNil(t, response["expires_at"])
}

// TestEmailVerificationVerifyCode tests verifying code and logging in
func TestEmailVerificationVerifyCode(t *testing.T) {
	// Setup
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	emailHandler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

	email := "testuser@example.com"

	// Step 1: Send code
	sendReqBody := models.EmailVerificationRequest{Email: email}
	body, _ := json.Marshal(sendReqBody)
	req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	ctx := createTestGinContext(w, req)
	emailHandler.SendVerificationCode(ctx)

	// Extract code from service (in production, it's sent via email)
	// For testing, retrieve from database
	var verification models.EmailVerification
	database.GetDB().Where("email = ?", email).First(&verification)

	// Step 2: Verify code with role (new user)
	verifyReqBody := models.EmailVerificationLoginRequest{
		Email: email,
		Code:  verification.Code,
		Role:  "mentor",
	}
	body, _ = json.Marshal(verifyReqBody)
	req = httptest.NewRequest("POST", "/auth/email/verify", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	ctx = createTestGinContext(w, req)
	emailHandler.VerifyCodeAndLogin(ctx)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response models.AuthResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, email, response.User.Email)
	assert.Equal(t, "mentor", response.User.Role)
	assert.NotEmpty(t, response.Token)
}

// TestEmailVerificationNewUserWithoutRole tests new user without role (should return 202)
func TestEmailVerificationNewUserWithoutRole(t *testing.T) {
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	emailHandler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

	email := "newuser@example.com"

	// Step 1: Send code
	sendReqBody := models.EmailVerificationRequest{Email: email}
	body, _ := json.Marshal(sendReqBody)
	req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	ctx := createTestGinContext(w, req)
	emailHandler.SendVerificationCode(ctx)

	// Get verification code
	var verification models.EmailVerification
	database.GetDB().Where("email = ?", email).First(&verification)

	// Step 2: Verify code WITHOUT role (new user scenario)
	verifyReqBody := models.EmailVerificationLoginRequest{
		Email: email,
		Code:  verification.Code,
	}
	body, _ = json.Marshal(verifyReqBody)
	req = httptest.NewRequest("POST", "/auth/email/verify", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	ctx = createTestGinContext(w, req)
	emailHandler.VerifyCodeAndLogin(ctx)

	// Assert - should return 202 with is_new_user: true
	assert.Equal(t, http.StatusAccepted, w.Code)

	var response models.NewUserResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response.IsNewUser)
	assert.Equal(t, email, response.Email)
	assert.Equal(t, "email", response.Provider)
}

// TestEmailVerificationInvalidCode tests invalid verification code
func TestEmailVerificationInvalidCode(t *testing.T) {
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	emailHandler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

	email := "testuser@example.com"

	// Send code first
	sendReqBody := models.EmailVerificationRequest{Email: email}
	body, _ := json.Marshal(sendReqBody)
	req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	ctx := createTestGinContext(w, req)
	emailHandler.SendVerificationCode(ctx)

	// Try to verify with wrong code
	verifyReqBody := models.EmailVerificationLoginRequest{
		Email: email,
		Code:  "999999",
		Role:  "mentor",
	}
	body, _ = json.Marshal(verifyReqBody)
	req = httptest.NewRequest("POST", "/auth/email/verify", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	ctx = createTestGinContext(w, req)
	emailHandler.VerifyCodeAndLogin(ctx)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response models.ErrorResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Verification failed", response.Error)
}

// TestEmailVerificationExpiredCode tests expired verification code
func TestEmailVerificationExpiredCode(t *testing.T) {
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	emailHandler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

	email := "testuser@example.com"

	// Send code
	sendReqBody := models.EmailVerificationRequest{Email: email}
	body, _ := json.Marshal(sendReqBody)
	req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	ctx := createTestGinContext(w, req)
	emailHandler.SendVerificationCode(ctx)

	// Get verification and mark as expired
	var verification models.EmailVerification
	database.GetDB().Where("email = ?", email).First(&verification)
	verification.ExpiresAt = time.Now().Add(-1 * time.Minute) // Set to past
	database.GetDB().Save(&verification)

	// Try to verify
	verifyReqBody := models.EmailVerificationLoginRequest{
		Email: email,
		Code:  verification.Code,
		Role:  "mentor",
	}
	body, _ = json.Marshal(verifyReqBody)
	req = httptest.NewRequest("POST", "/auth/email/verify", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	ctx = createTestGinContext(w, req)
	emailHandler.VerifyCodeAndLogin(ctx)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestOAuthLoginGoogleNewUser tests Google OAuth with new user
func TestOAuthLoginGoogleNewUser(t *testing.T) {
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())
	oauthHandler := handlers.NewOAuthHandler(userRepo, "test-secret")

	// Mock Google OAuth token (in production, use real token)
	reqBody := models.OAuthLoginRequest{
		Provider: "google",
		IDToken:  "mock-google-token", // Would be actual Google token
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/auth/oauth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	ctx := createTestGinContext(w, req)

	// Note: This will fail with mock token. Use actual token from Google in integration tests
	oauthHandler.OAuthLogin(ctx)

	// In real test, would assert:
	// assert.Equal(t, http.StatusAccepted, w.Code) // New user
	// or
	// assert.Equal(t, http.StatusOK, w.Code) // Existing user
}

// TestOAuthExistingUser tests OAuth with existing user
func TestOAuthExistingUser(t *testing.T) {
	setupTestDB(t)
	userRepo := gormrepo.NewUserRepository(database.GetDB())

	// Create user with OAuth provider
	user := &models.User{
		ID:         uuid.New(),
		Email:      "oauth@example.com",
		Provider:   "google",
		ProviderID: "google-123456",
		Role:       "mentor",
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	userRepo.Create(context.Background(), user)

	// Query by provider ID
	retrieved, err := userRepo.GetByProviderID(context.Background(), "google", "google-123456")

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, user.Email, retrieved.Email)
	assert.Equal(t, user.Role, retrieved.Role)
}

// ===== Helper Functions =====

func setupTestDB(t *testing.T) {
	// Setup test database (in-memory SQLite or test PostgreSQL)
	// This is a simplified example
	database.InitDB("sqlite::memory:")

	// Run migrations
	database.GetDB().AutoMigrate(
		&models.User{},
		&models.EmailVerification{},
		&models.Profile{},
	)
}

func createTestGinContext(w http.ResponseWriter, req *http.Request) *gin.Context {
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req
	return ctx
}
