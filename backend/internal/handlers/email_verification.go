package handlers

import (
	"errors"
	"net/http"
	"time"

	"mentori/internal/models"
	"mentori/internal/repository"
	"mentori/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// EmailVerificationHandler handles email verification authentication
type EmailVerificationHandler struct {
	userRepo             repository.UserRepository
	verificationService  *services.EmailVerificationService
	jwtSecret            []byte
}

// NewEmailVerificationHandler creates a new email verification handler
func NewEmailVerificationHandler(userRepo repository.UserRepository, jwtSecret string) *EmailVerificationHandler {
	return &EmailVerificationHandler{
		userRepo:            userRepo,
		verificationService: services.NewEmailVerificationService(),
		jwtSecret:           []byte(jwtSecret),
	}
}

// SendVerificationCode godoc
//
//	@Summary		Send verification code
//	@Description	Send a verification code to the user's email
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.EmailVerificationRequest	true	"Email verification request"
//	@Success		200		{object}	map[string]string				"Code sent successfully"
//	@Failure		400		{object}	models.ErrorResponse			"Invalid input data"
//	@Failure		500		{object}	models.ErrorResponse			"Internal server error"
//	@Router			/auth/email/send-code [post]
func (h *EmailVerificationHandler) SendVerificationCode(c *gin.Context) {
	var req models.EmailVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid input",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Create verification code
	verification, err := h.verificationService.CreateVerification(ctx, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to create verification code",
			Message: err.Error(),
		})
		return
	}

	// Send email with verification code
	if err := h.verificationService.SendVerificationEmail(req.Email, verification.Code); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to send verification email",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Verification code sent to your email",
		"expires_at": verification.ExpiresAt,
	})
}

// VerifyCodeAndLogin godoc
//
//	@Summary		Verify code and login
//	@Description	Verify email code and login. New users must provide role.
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.EmailVerificationLoginRequest	true	"Verification login data"
//	@Success		200		{object}	models.AuthResponse						"Login successful"
//	@Success		202		{object}	models.NewUserResponse					"New user - role selection required"
//	@Failure		400		{object}	models.ErrorResponse					"Invalid input data"
//	@Failure		401		{object}	models.ErrorResponse					"Invalid verification code"
//	@Failure		500		{object}	models.ErrorResponse					"Internal server error"
//	@Router			/auth/email/verify [post]
func (h *EmailVerificationHandler) VerifyCodeAndLogin(c *gin.Context) {
	var req models.EmailVerificationLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid input",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Verify the code - don't mark as used yet if no role provided
	markAsUsed := req.Role != ""
	_, err := h.verificationService.VerifyCode(ctx, req.Email, req.Code, markAsUsed)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Verification failed",
			Message: err.Error(),
		})
		return
	}

	// Check if user exists
	user, err := h.userRepo.GetByEmail(ctx, req.Email)
	
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			// New user - check if role is provided
			if req.Role == "" {
				// Return new user response - frontend should show role selection
				c.JSON(http.StatusAccepted, models.NewUserResponse{
					IsNewUser: true,
					Email:     req.Email,
					Provider:  "email",
				})
				return
			}

			// Create new user with selected role
			user = &models.User{
				ID:         uuid.New(),
				Email:      req.Email,
				Provider:   "email",
				Role:       req.Role,
				IsVerified: true, // Email verified through code
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}

			if err := h.userRepo.Create(ctx, user); err != nil {
				c.JSON(http.StatusInternalServerError, models.ErrorResponse{
					Error:   "User creation failed",
					Message: err.Error(),
				})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "Database error",
				Message: err.Error(),
			})
			return
		}
	}

	// Generate JWT token
	authHandler := &AuthHandler{
		userRepo:  h.userRepo,
		jwtSecret: h.jwtSecret,
	}
	token, err := authHandler.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Token generation failed",
			Message: err.Error(),
		})
		return
	}

	response := &models.AuthResponse{
		User: models.UserResponse{
			ID:         user.ID,
			Email:      user.Email,
			Role:       user.Role,
			Profile:    user.Profile,
			CreatedAt:  user.CreatedAt,
		},
		Token: token,
	}

	c.JSON(http.StatusOK, response)
}
