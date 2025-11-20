package validators

import (
	"errors"
	"fmt"
	"mentori/pkg/constants"
	"regexp"
	"strings"
)

var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	urlRegex   = regexp.MustCompile(`^https?://[^\s]+$`)
)

// ValidateEmail checks if an email address is valid
func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}
	return nil
}

// ValidatePassword checks if a password meets requirements
func ValidatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	// Add more password requirements as needed
	// - At least one uppercase letter
	// - At least one lowercase letter
	// - At least one number
	// - At least one special character
	return nil
}

// ValidateRole checks if a role is valid
func ValidateRole(role string) error {
	if role == "" {
		return errors.New("role is required")
	}
	for _, validRole := range constants.ValidRoles {
		if role == validRole {
			return nil
		}
	}
	return fmt.Errorf("invalid role: must be one of %v", constants.ValidRoles)
}

// ValidateURL checks if a URL is valid
func ValidateURL(url string) error {
	if url == "" {
		return nil // URL is optional
	}
	if !urlRegex.MatchString(url) {
		return errors.New("invalid URL format")
	}
	return nil
}

// ValidateSessionStatus checks if a session status is valid
func ValidateSessionStatus(status string) error {
	if status == "" {
		return errors.New("status is required")
	}
	for _, validStatus := range constants.ValidSessionStatuses {
		if status == validStatus {
			return nil
		}
	}
	return fmt.Errorf("invalid status: must be one of %v", constants.ValidSessionStatuses)
}

// ValidateName checks if a name is valid
func ValidateName(name string) error {
	if name == "" {
		return errors.New("name is required")
	}
	if len(name) < 2 {
		return errors.New("name must be at least 2 characters long")
	}
	if len(name) > 100 {
		return errors.New("name must not exceed 100 characters")
	}
	return nil
}

// ValidateArrayNotEmpty checks if an array is not empty
func ValidateArrayNotEmpty(arr []string, fieldName string) error {
	if len(arr) == 0 {
		return fmt.Errorf("%s must contain at least one item", fieldName)
	}
	return nil
}

// ValidateStringLength checks if a string meets length requirements
func ValidateStringLength(str string, min, max int, fieldName string) error {
	length := len(strings.TrimSpace(str))
	if min > 0 && length < min {
		return fmt.Errorf("%s must be at least %d characters long", fieldName, min)
	}
	if max > 0 && length > max {
		return fmt.Errorf("%s must not exceed %d characters", fieldName, max)
	}
	return nil
}

// ValidatePageSize validates pagination page size
func ValidatePageSize(size int) error {
	if size < 1 {
		return errors.New("page size must be at least 1")
	}
	if size > constants.MaxPageSize {
		return fmt.Errorf("page size must not exceed %d", constants.MaxPageSize)
	}
	return nil
}

// ValidatePageNumber validates pagination page number
func ValidatePageNumber(page int) error {
	if page < 1 {
		return errors.New("page number must be at least 1")
	}
	return nil
}
