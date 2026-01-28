package services

import (
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"time"

	"mentori/internal/models"
	"mentori/pkg/database"

	"github.com/google/uuid"
)

type EmailVerificationService struct{}

func NewEmailVerificationService() *EmailVerificationService {
	return &EmailVerificationService{}
}

// GenerateCode generates a random 6-digit verification code
func (s *EmailVerificationService) GenerateCode() (string, error) {
	const digits = "0123456789"
	code := make([]byte, 6)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		code[i] = digits[num.Int64()]
	}
	return string(code), nil
}

// CreateVerification creates a new email verification record
func (s *EmailVerificationService) CreateVerification(ctx context.Context, email string) (*models.EmailVerification, error) {
	code, err := s.GenerateCode()
	if err != nil {
		return nil, err
	}

	verification := &models.EmailVerification{
		ID:        uuid.New(),
		Email:     email,
		Code:      code,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		IsUsed:    false,
	}

	if err := database.GetDB().Create(verification).Error; err != nil {
		return nil, err
	}

	return verification, nil
}

// VerifyCode verifies a code for an email address
// When role is provided (new user completing signup), mark as used
// When role is not provided (just checking code), don't mark as used yet
func (s *EmailVerificationService) VerifyCode(ctx context.Context, email, code string, markAsUsed bool) (*models.EmailVerification, error) {
	var verification models.EmailVerification
	
	result := database.GetDB().Where("email = ? AND code = ? AND is_used = ? AND expires_at > ?",
		email, code, false, time.Now()).First(&verification)
	
	if result.Error != nil {
		return nil, fmt.Errorf("invalid or expired verification code")
	}

	// Only mark as used if markAsUsed is true
	if markAsUsed {
		verification.IsUsed = true
		if err := database.GetDB().Save(&verification).Error; err != nil {
			return nil, err
		}
	}

	return &verification, nil
}

// SendVerificationEmail sends the verification code via email
// In development, it just prints to console
func (s *EmailVerificationService) SendVerificationEmail(email, code string) error {
	// Development: Print verification code to console
	// TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
	// In production, this should send an email instead
	log.Printf("[VERIFICATION] Code for %s: %s (expires in 10 minutes)\n", email, code)
	return nil
}
