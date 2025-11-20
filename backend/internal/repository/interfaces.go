// Package repository defines interfaces for data access
package repository

import (
	"context"
	"errors"
	"mentori/internal/models"

	"github.com/google/uuid"
)

// Common repository errors
var (
	ErrNotFound = errors.New("record not found")
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ProfileRepository defines the interface for profile data operations
type ProfileRepository interface {
	Create(ctx context.Context, profile *models.Profile) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Profile, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*models.Profile, error)
	Update(ctx context.Context, profile *models.Profile) error
	Delete(ctx context.Context, id uuid.UUID) error
	Search(ctx context.Context, filters *models.ProfileFilters, limit, offset int) ([]*models.Profile, error)
}
