package handlers

import (
	"context"
	"errors"
	"net/http"
	"time"

	"mentori/internal/models"
	"mentori/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	userRepo  repository.UserRepository
	jwtSecret []byte
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(userRepo repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		userRepo:  userRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

// Register godoc
//
//	@Summary		Register a new user
//	@Description	Create a new user account with email, password, and role
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.RegisterRequest	true	"User registration data"
//	@Success		201		{object}	models.AuthResponse		"User created successfully"
//	@Failure		400		{object}	models.ErrorResponse	"Invalid input data"
//	@Failure		409		{object}	models.ErrorResponse	"User already exists"
//	@Failure		500		{object}	models.ErrorResponse	"Internal server error"
//	@Router			/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid input",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Check if user already exists
	existing, err := h.userRepo.GetByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Database error",
			Message: err.Error(),
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, models.ErrorResponse{
			Error:   "User already exists",
			Message: "User with this email already exists",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Password hashing failed",
			Message: err.Error(),
		})
		return
	}

	// Create user
	user := &models.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.userRepo.Create(ctx, user); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "User creation failed",
			Message: err.Error(),
		})
		return
	}

	// Generate token
	token, err := h.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Token generation failed",
			Message: err.Error(),
		})
		return
	}

	response := &models.AuthResponse{
		User: models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		},
		Token: token,
	}

	c.JSON(http.StatusCreated, response)
}

// Login godoc
//
//	@Summary		User login
//	@Description	Authenticate user with email and password
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.LoginRequest		true	"User login credentials"
//	@Success		200		{object}	models.AuthResponse		"Login successful"
//	@Failure		400		{object}	models.ErrorResponse	"Invalid input data"
//	@Failure		401		{object}	models.ErrorResponse	"Invalid credentials"
//	@Failure		500		{object}	models.ErrorResponse	"Internal server error"
//	@Router			/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid input",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get user by email
	user, err := h.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Authentication failed",
				Message: "Invalid email or password",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Database error",
			Message: err.Error(),
		})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication failed",
			Message: "Invalid email or password",
		})
		return
	}

	// Generate token
	token, err := h.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Token generation failed",
			Message: err.Error(),
		})
		return
	}

	response := &models.AuthResponse{
		User: models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		},
		Token: token,
	}

	c.JSON(http.StatusOK, response)
}

// Logout godoc
//
//	@Summary		User logout
//	@Description	Invalidate user session (client-side token removal)
//	@Tags			auth
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	map[string]string	"Logout successful"
//	@Router			/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is handled client-side
	// by removing the token from storage
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// GetProfile godoc
//
//	@Summary		Get user profile
//	@Description	Get current authenticated user's profile
//	@Tags			auth
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	models.UserResponse		"User profile"
//	@Failure		401	{object}	models.ErrorResponse	"Unauthorized"
//	@Failure		404	{object}	models.ErrorResponse	"User not found"
//	@Router			/auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	// Extract token from Authorization header
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Message: "Missing authorization token",
		})
		return
	}

	// Remove "Bearer " prefix if present
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	userResponse, err := h.validateToken(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Message: "Invalid token",
		})
		return
	}

	c.JSON(http.StatusOK, userResponse)
}

// generateToken creates a JWT token for the user
func (h *AuthHandler) generateToken(userID uuid.UUID, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(), // 24 hours
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.jwtSecret)
}

// validateToken validates a JWT token and returns user info
func (h *AuthHandler) validateToken(ctx context.Context, tokenString string) (*models.UserResponse, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return h.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			return nil, errors.New("invalid token claims")
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return nil, errors.New("invalid user ID in token")
		}

		user, err := h.userRepo.GetByID(ctx, userID)
		if err != nil {
			return nil, err
		}

		response := &models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			Profile:   user.Profile,
			CreatedAt: user.CreatedAt,
		}
		return response, nil
	}

	return nil, errors.New("invalid token")
}

//	@Summary		Create user profile
//	@Description	Create a new profile for the authenticated user
//	@Tags			profiles
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CreateProfileRequest	true	"Profile creation data"
//	@Success		201		{object}	models.Profile				"Profile created successfully"
//	@Failure		400		{object}	models.ErrorResponse		"Invalid input data"
//	@Failure		401		{object}	models.ErrorResponse		"Unauthorized"
//	@Failure		409		{object}	models.ErrorResponse		"Profile already exists"
//	@Failure		500		{object}	models.ErrorResponse		"Internal server error"
//	@Router			/profiles [post]

//	@Summary		Get my profile
//	@Description	Get the authenticated user's profile
//	@Tags			profiles
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	models.Profile			"User profile"
//	@Failure		401	{object}	models.ErrorResponse	"Unauthorized"
//	@Failure		404	{object}	models.ErrorResponse	"Profile not found"
//	@Failure		500	{object}	models.ErrorResponse	"Internal server error"
//	@Router			/profiles [get]

//	@Summary		Update user profile
//	@Description	Update the authenticated user's profile
//	@Tags			profiles
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.UpdateProfileRequest	true	"Profile update data"
//	@Success		200		{object}	models.Profile				"Profile updated successfully"
//	@Failure		400		{object}	models.ErrorResponse		"Invalid input data"
//	@Failure		401		{object}	models.ErrorResponse		"Unauthorized"
//	@Failure		404		{object}	models.ErrorResponse		"Profile not found"
//	@Failure		500		{object}	models.ErrorResponse		"Internal server error"
//	@Router			/profiles [put]

//	@Summary		Delete user profile
//	@Description	Delete the authenticated user's profile
//	@Tags			profiles
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	map[string]string		"Profile deleted successfully"
//	@Failure		401	{object}	models.ErrorResponse	"Unauthorized"
//	@Failure		404	{object}	models.ErrorResponse	"Profile not found"
//	@Failure		500	{object}	models.ErrorResponse	"Internal server error"
//	@Router			/profiles [delete]

//	@Summary		Get public profiles
//	@Description	Search and retrieve public user profiles with optional filters
//	@Tags			profiles
//	@Produce		json
//	@Param			expertise	query		[]string				false	"Filter by expertise areas"
//	@Param			interests	query		[]string				false	"Filter by interests"
//	@Param			location	query		string					false	"Filter by location"
//	@Param			role		query		string					false	"Filter by user role"
//	@Param			limit		query		int						false	"Limit number of results (default 20)"
//	@Param			offset		query		int						false	"Offset for pagination (default 0)"
//	@Success		200			{array}		models.Profile			"List of public profiles"
//	@Failure		500			{object}	models.ErrorResponse	"Internal server error"
//	@Router			/profiles/public [get]
