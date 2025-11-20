package handlers

import (
	"net/http"
	"strconv"
	"time"

	"mentori/internal/models"
	"mentori/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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
		})
		return
	}

	var req models.CreateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
		})
		return
	}

	if existingProfile, _ := h.profileRepo.GetByUserID(c.Request.Context(), userID); existingProfile != nil {
		c.JSON(http.StatusConflict, models.ErrorResponse{
			Error:   "profile_exists",
			Message: "Profile already exists for this user",
		})
		return
	}

	profile := &models.Profile{
		ID:        uuid.New(),
		UserID:    userID,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Bio:       req.Bio,
		AvatarURL: req.AvatarURL,
		Expertise: req.Expertise,
		Interests: req.Interests,
		Location:  req.Location,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.profileRepo.Create(c.Request.Context(), profile); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to create profile",
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
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "profile_not_found",
			Message: "Profile not found",
		})
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
		})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "profile_not_found",
			Message: "Profile not found",
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
		profile.Expertise = *req.Expertise
	}
	if req.Interests != nil {
		profile.Interests = *req.Interests
	}
	if req.Location != nil {
		profile.Location = *req.Location
	}
	if req.IsActive != nil {
		profile.IsActive = *req.IsActive
	}

	profile.UpdatedAt = time.Now()

	if err := h.profileRepo.Update(c.Request.Context(), profile); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to update profile",
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
		})
		return
	}

	userID, err := uuid.Parse(userClaims.(jwt.MapClaims)["user_id"].(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Invalid user ID",
		})
		return
	}

	profile, err := h.profileRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "profile_not_found",
			Message: "Profile not found",
		})
		return
	}

	if err := h.profileRepo.Delete(c.Request.Context(), profile.ID); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to delete profile",
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
