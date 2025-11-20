package handlers

import (
	"net/http"

	"mentori/internal/models"
	"mentori/internal/repository"
	"mentori/pkg/constants"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AdminHandler handles admin-only endpoints
type AdminHandler struct {
	userRepo    repository.UserRepository
	profileRepo repository.ProfileRepository
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(userRepo repository.UserRepository, profileRepo repository.ProfileRepository) *AdminHandler {
	return &AdminHandler{
		userRepo:    userRepo,
		profileRepo: profileRepo,
	}
}

// DeleteUser godoc
//
//	@Summary		Delete user and profile
//	@Description	Delete a user and their associated profile from the system (Admin only)
//	@Tags			admin
//	@Security		BearerAuth
//	@Produce		json
//	@Param			userId	path		string					true	"User ID to delete"
//	@Success		200		{object}	map[string]string		"User and profile deleted successfully"
//	@Failure		400		{object}	models.ErrorResponse	"Invalid user ID"
//	@Failure		403		{object}	models.ErrorResponse	"Forbidden - Admin access required"
//	@Failure		404		{object}	models.ErrorResponse	"User not found"
//	@Failure		500		{object}	models.ErrorResponse	"Internal server error"
//	@Router			/admin/users/{userId} [delete]
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	// Check if user is admin
	userRole, exists := c.Get(constants.ContextKeyUserRole)
	if !exists || userRole.(string) != "admin" {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "Forbidden",
			Message: "Admin access required",
		})
		return
	}

	// Get user ID from path parameter
	userIDStr := c.Param("userId")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid user ID",
			Message: "User ID must be a valid UUID",
		})
		return
	}

	ctx := c.Request.Context()

	// Check if user exists
	user, err := h.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "User not found",
				Message: "User does not exist",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Database error",
			Message: err.Error(),
		})
		return
	}

	// Delete user's profile if it exists
	if user.Profile != nil {
		if err := h.profileRepo.Delete(ctx, user.Profile.ID); err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "Profile deletion failed",
				Message: err.Error(),
			})
			return
		}
	}

	// Delete user
	if err := h.userRepo.Delete(ctx, userID); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "User deletion failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User and profile deleted successfully",
	})
}
