package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"mentori/internal/models"

	"github.com/golang-jwt/jwt/v5"
)

// OAuthService handles OAuth authentication
type OAuthService struct {
	httpClient *http.Client
}

// NewOAuthService creates a new OAuth service
func NewOAuthService() *OAuthService {
	return &OAuthService{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GoogleUserInfo represents Google user info response
type GoogleUserInfo struct {
	Sub           string      `json:"sub"` // User ID
	Email         string      `json:"email"`
	EmailVerified interface{} `json:"email_verified"` // Can be bool or string
	Name          string      `json:"name"`
	Picture       string      `json:"picture"`
}

// IsEmailVerified returns the email_verified value as a boolean
func (g *GoogleUserInfo) IsEmailVerified() bool {
	switch v := g.EmailVerified.(type) {
	case bool:
		return v
	case string:
		return v == "true"
	default:
		return false
	}
}

// AppleTokenClaims represents Apple ID token claims
type AppleTokenClaims struct {
	Iss            string `json:"iss"`
	Sub            string `json:"sub"` // User ID
	Aud            string `json:"aud"`
	Email          string `json:"email"`
	EmailVerified  string `json:"email_verified"`
	IsPrivateEmail string `json:"is_private_email"`
	jwt.RegisteredClaims
}

// VerifyGoogleToken verifies Google ID token and returns user info
func (s *OAuthService) VerifyGoogleToken(ctx context.Context, idToken string) (*models.OAuthUser, error) {
	// Call Google's tokeninfo endpoint to verify the token
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to verify token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("invalid token: %s", string(body))
	}

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if userInfo.Email == "" || userInfo.Sub == "" {
		return nil, errors.New("invalid token: missing required fields")
	}

	return &models.OAuthUser{
		Email:      userInfo.Email,
		ProviderID: userInfo.Sub,
		IsVerified: userInfo.IsEmailVerified(),
		Name:       userInfo.Name,
	}, nil
}

// VerifyAppleToken verifies Apple ID token and returns user info
// Note: For production, you should verify the signature using Apple's public keys
func (s *OAuthService) VerifyAppleToken(ctx context.Context, idToken string) (*models.OAuthUser, error) {
	// Parse the token without verification (for development)
	// In production, verify signature with Apple's public keys from https://appleid.apple.com/auth/keys
	token, _, err := new(jwt.Parser).ParseUnverified(idToken, &AppleTokenClaims{})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*AppleTokenClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	if claims.Email == "" || claims.Sub == "" {
		return nil, errors.New("invalid token: missing required fields")
	}

	// Apple's email_verified is a string "true" or "false"
	emailVerified := claims.EmailVerified == "true"

	return &models.OAuthUser{
		Email:      claims.Email,
		ProviderID: claims.Sub,
		IsVerified: emailVerified,
		Name:       "", // Apple may not provide name in token
	}, nil
}

// VerifyToken verifies OAuth token based on provider
func (s *OAuthService) VerifyToken(ctx context.Context, provider, idToken string) (*models.OAuthUser, error) {
	switch provider {
	case "google":
		return s.VerifyGoogleToken(ctx, idToken)
	case "apple":
		return s.VerifyAppleToken(ctx, idToken)
	default:
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}
}
