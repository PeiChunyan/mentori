package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"mentori/internal/models"
	"mentori/internal/repository"
	"mentori/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type ProfileHandler struct {
	profileRepo repository.ProfileRepository
	userRepo    repository.UserRepository
}

func NewProfileHandler(profileRepo repository.ProfileRepository, userRepo repository.UserRepository) *ProfileHandler {
	return &ProfileHandler{
		profileRepo: profileRepo,
		userRepo:    userRepo,
	}
}

// CreateProfile godoc
// @Summary Create user profile
// @Description Create a new profile for the authenticated user
// @Tags profiles
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body models.CreateProfileRequest true "Profile creation data"
// @Success 201 {object} models.Profile "Profile created successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid input data"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 409 {object} models.ErrorResponse "Profile already exists"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /profiles [post]
func (h *ProfileHandler) CreateProfile(c *gin.Context) {
	userClaims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found in context",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	var req models.CreateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		logger.Error("CreateProfile: invalid user ID: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Ensure the user exists to avoid FK violations when creating the profile
	if _, err := h.userRepo.GetByID(c.Request.Context(), userID); err != nil {
		if err == repository.ErrNotFound {
			logger.Warn("CreateProfile: user does not exist for user_id=%s", userID.String())
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "User not found. Please log in again.",
				Code:    http.StatusUnauthorized,
			})
			return
		}
		logger.Error("CreateProfile: failed to verify user existence: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to verify user",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	if existingProfile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID); existingProfile != nil {
		c.JSON(http.StatusConflict, models.ErrorResponse{
			Error:   "profile_exists",
			Message: "Profile already exists for this user",
			Code:    http.StatusConflict,
		})
		return
	} else if err != nil && err != repository.ErrNotFound {
		logger.Error("CreateProfile: failed to check existing profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to check existing profile",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Marshal arrays to JSON
	expJSON, _ := json.Marshal(req.Expertise)
	intJSON, _ := json.Marshal(req.Interests)

	profile := &models.Profile{
		ID:        uuid.New(),
		UserID:    userID,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Bio:       req.Bio,
		AvatarURL: req.AvatarURL,
		Expertise: datatypes.JSON(expJSON),
		Interests: datatypes.JSON(intJSON),
		Location:  req.Location,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.profileRepo.Create(c.Request.Context(), profile); err != nil {
		logger.Error("CreateProfile: failed to create profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to create profile",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

// GetMyProfile godoc
// @Summary Get my profile
// @Description Get the authenticated user's profile
// @Tags profiles
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.Profile "User profile"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Profile not found"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /profiles [get]
func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userClaims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found in context",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		logger.Error("GetMyProfile: invalid user ID: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "profile_not_found",
				Message: "Profile not found",
				Code:    http.StatusNotFound,
			})
		} else {
			logger.Error("GetMyProfile: failed to retrieve profile: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "internal_error",
				Message: "Failed to retrieve profile",
				Code:    http.StatusInternalServerError,
			})
		}
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update the authenticated user's profile
// @Tags profiles
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body models.UpdateProfileRequest true "Profile update data"
// @Success 200 {object} models.Profile "Profile updated successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid input data"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Profile not found"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /profiles [put]
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userClaims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found in context",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		logger.Error("UpdateProfile: invalid user ID: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Ensure user exists before update/upsert
	if _, err := h.userRepo.GetByID(c.Request.Context(), userID); err != nil {
		if err == repository.ErrNotFound {
			logger.Warn("UpdateProfile: user does not exist for user_id=%s", userID.String())
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "User not found. Please log in again.",
				Code:    http.StatusUnauthorized,
			})
			return
		}
		logger.Error("UpdateProfile: failed to verify user existence: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to verify user",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		if err == repository.ErrNotFound {
			// Upsert behavior: create a new profile if none exists
			newProfile := &models.Profile{
				ID:        uuid.New(),
				UserID:    userID,
				FirstName: "",
				LastName:  "",
				Bio:       "",
				AvatarURL: "",
				Expertise: datatypes.JSON([]byte("[]")),
				Interests: datatypes.JSON([]byte("[]")),
				Location:  "",
				IsActive:  true,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			// Apply provided fields
			if req.FirstName != nil {
				newProfile.FirstName = *req.FirstName
			}
			if req.LastName != nil {
				newProfile.LastName = *req.LastName
			}
			if req.Bio != nil {
				newProfile.Bio = *req.Bio
			}
			if req.AvatarURL != nil {
				newProfile.AvatarURL = *req.AvatarURL
			}
			if req.Expertise != nil {
				expJSON, _ := json.Marshal(req.Expertise)
				newProfile.Expertise = datatypes.JSON(expJSON)
			}
			if req.Interests != nil {
				intJSON, _ := json.Marshal(req.Interests)
				newProfile.Interests = datatypes.JSON(intJSON)
			}
			if req.Location != nil {
				newProfile.Location = *req.Location
			}
			if req.IsActive != nil {
				newProfile.IsActive = *req.IsActive
			}

			if err := h.profileRepo.Create(c.Request.Context(), newProfile); err != nil {
				logger.Error("UpdateProfile upsert: failed to create profile: %v", err)
				c.JSON(http.StatusInternalServerError, models.ErrorResponse{
					Error:   "internal_error",
					Message: "Failed to create profile",
					Code:    http.StatusInternalServerError,
				})
				return
			}
			c.JSON(http.StatusOK, newProfile)
			return
		}
		logger.Error("UpdateProfile: failed to retrieve profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to retrieve profile",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	if req.FirstName != nil {
		profile.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		profile.LastName = *req.LastName
	}
	if req.Bio != nil {
		profile.Bio = *req.Bio
	}
	if req.AvatarURL != nil {
		profile.AvatarURL = *req.AvatarURL
	}
	if req.Expertise != nil {
		if b, err := json.Marshal(*req.Expertise); err == nil {
			profile.Expertise = datatypes.JSON(b)
		}
	}
	if req.Interests != nil {
		if b, err := json.Marshal(*req.Interests); err == nil {
			profile.Interests = datatypes.JSON(b)
		}
	}
	if req.Location != nil {
		profile.Location = *req.Location
	}
	if req.IsActive != nil {
		profile.IsActive = *req.IsActive
	}

	profile.UpdatedAt = time.Now()

	if err := h.profileRepo.Update(c.Request.Context(), profile); err != nil {
		logger.Error("UpdateProfile: failed to update profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to update profile",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// DeleteProfile godoc
// @Summary Delete user profile
// @Description Delete the authenticated user's profile
// @Tags profiles
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]string "Profile deleted successfully"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Profile not found"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /profiles [delete]
func (h *ProfileHandler) DeleteProfile(c *gin.Context) {
	userClaims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found in context",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		logger.Error("DeleteProfile: invalid user ID: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Ensure user exists before delete
	if _, err := h.userRepo.GetByID(c.Request.Context(), userID); err != nil {
		if err == repository.ErrNotFound {
			logger.Warn("DeleteProfile: user does not exist for user_id=%s", userID.String())
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "User not found. Please log in again.",
				Code:    http.StatusUnauthorized,
			})
			return
		}
		logger.Error("DeleteProfile: failed to verify user existence: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to verify user",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "profile_not_found",
				Message: "Profile not found",
				Code:    http.StatusNotFound,
			})
		} else {
			logger.Error("DeleteProfile: failed to retrieve profile: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "internal_error",
				Message: "Failed to retrieve profile",
				Code:    http.StatusInternalServerError,
			})
		}
		return
	}

	if err := h.profileRepo.Delete(c.Request.Context(), profile.ID); err != nil {
		logger.Error("DeleteProfile: failed to delete profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to delete profile",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile deleted successfully"})
}

// GetPublicProfiles godoc
// @Summary Get public profiles
// @Description Search and retrieve public user profiles with optional filters
// @Tags profiles
// @Produce json
// @Param expertise query []string false "Filter by expertise areas"
// @Param interests query []string false "Filter by interests"
// @Param location query string false "Filter by location"
// @Param role query string false "Filter by user role"
// @Param limit query int false "Limit number of results (default 20)"
// @Param offset query int false "Offset for pagination (default 0)"
// @Success 200 {array} models.Profile "List of public profiles"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /profiles/public [get]
func (h *ProfileHandler) GetPublicProfiles(c *gin.Context) {
	var filters models.ProfileFilters

	if expertise := c.QueryArray("expertise"); len(expertise) > 0 {
		filters.Expertise = &expertise
	}
	if interests := c.QueryArray("interests"); len(interests) > 0 {
		filters.Interests = &interests
	}
	if location := c.Query("location"); location != "" {
		filters.Location = location
	}
	if role := c.Query("role"); role != "" {
		filters.Role = role
	}

	limit := 20
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	repoFilters := &models.ProfileFilters{}
	if filters.Expertise != nil {
		repoFilters.Expertise = filters.Expertise
	}
	if filters.Interests != nil {
		repoFilters.Interests = filters.Interests
	}
	repoFilters.Location = filters.Location
	repoFilters.Role = filters.Role

	profiles, err := h.profileRepo.Search(c.Request.Context(), repoFilters, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to search profiles",
		})
		return
	}

	c.JSON(http.StatusOK, profiles)
}
