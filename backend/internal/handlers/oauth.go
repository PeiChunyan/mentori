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

// OAuthHandler handles OAuth authentication
type OAuthHandler struct {
	userRepo     repository.UserRepository
	oauthService *services.OAuthService
	jwtSecret    []byte
}

// NewOAuthHandler creates a new OAuth handler
func NewOAuthHandler(userRepo repository.UserRepository, jwtSecret string) *OAuthHandler {
	return &OAuthHandler{
		userRepo:     userRepo,
		oauthService: services.NewOAuthService(),
		jwtSecret:    []byte(jwtSecret),
	}
}

// OAuthLogin godoc
//
//	@Summary		OAuth login (Google/Apple)
//	@Description	Authenticate user with OAuth provider. New users must provide role.
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.OAuthLoginRequest	true	"OAuth login data"
//	@Success		200		{object}	models.AuthResponse			"Login successful"
//	@Success		202		{object}	models.NewUserResponse		"New user - role selection required"
//	@Failure		400		{object}	models.ErrorResponse		"Invalid input data"
//	@Failure		401		{object}	models.ErrorResponse		"Invalid OAuth token"
//	@Failure		500		{object}	models.ErrorResponse		"Internal server error"
//	@Router			/auth/oauth/login [post]
func (h *OAuthHandler) OAuthLogin(c *gin.Context) {
	var req models.OAuthLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid input",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Verify OAuth token
	oauthUser, err := h.oauthService.VerifyToken(ctx, req.Provider, req.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "OAuth verification failed",
			Message: err.Error(),
		})
		return
	}

	// Check if user exists by provider ID
	user, err := h.userRepo.GetByProviderID(ctx, req.Provider, oauthUser.ProviderID)
	
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			// New user - check if role is provided
			if req.Role == "" {
				// Return new user response - frontend should show role selection
				c.JSON(http.StatusAccepted, models.NewUserResponse{
					IsNewUser: true,
					Email:     oauthUser.Email,
					Provider:  req.Provider,
				})
				return
			}

			// Create new user with selected role
			user = &models.User{
				ID:         uuid.New(),
				Email:      oauthUser.Email,
				Provider:   req.Provider,
				ProviderID: oauthUser.ProviderID,
				Role:       req.Role,
				IsVerified: oauthUser.IsVerified,
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
