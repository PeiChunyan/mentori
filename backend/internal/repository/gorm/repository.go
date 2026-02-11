// Package gormrepo provides GORM-based repository implementations
package gormrepo

import (
	"context"
	"errors"
	"mentori/internal/models"
	"mentori/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// userRepository implements UserRepository using GORM
type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Preload("Profile").First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, repository.ErrNotFound
	}
	return &user, err
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Preload("Profile").Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, repository.ErrNotFound
	}
	return &user, err
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, id).Error
}

// profileRepository implements ProfileRepository using GORM
type profileRepository struct {
	db *gorm.DB
}

func NewProfileRepository(db *gorm.DB) repository.ProfileRepository {
	return &profileRepository{db: db}
}

func (r *profileRepository) Create(ctx context.Context, profile *models.Profile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

func (r *profileRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Profile, error) {
	var profile models.Profile
	err := r.db.WithContext(ctx).First(&profile, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, repository.ErrNotFound
	}
	return &profile, err
}

func (r *profileRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*models.Profile, error) {
	var profile models.Profile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&profile).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, repository.ErrNotFound
	}
	return &profile, err
}

func (r *profileRepository) Update(ctx context.Context, profile *models.Profile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *profileRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Profile{}, id).Error
}

func (r *profileRepository) Search(ctx context.Context, filters *models.ProfileFilters, limit, offset int) ([]*models.Profile, error) {
	query := r.db.WithContext(ctx).Where("is_active = ?", true)

	// Apply filters
	if filters.Expertise != nil && len(*filters.Expertise) > 0 {
		query = query.Where("expertise && ?", *filters.Expertise)
	}
	if filters.Interests != nil && len(*filters.Interests) > 0 {
		query = query.Where("interests && ?", *filters.Interests)
	}
	if filters.Location != "" {
		query = query.Where("location ILIKE ?", "%"+filters.Location+"%")
	}
	if filters.Role != "" {
		query = query.Joins("JOIN users ON profiles.user_id = users.id").Where("users.role = ?", filters.Role)
	}

	var profiles []*models.Profile
	err := query.Limit(limit).Offset(offset).Find(&profiles).Error
	return profiles, err
}
