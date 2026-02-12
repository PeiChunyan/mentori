package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// IPRateLimiter tracks request rates by IP address
type IPRateLimiter struct {
	ips map[string]*rateLimiter
	mu  *sync.RWMutex
	r   int           // requests per duration
	d   time.Duration // duration
}

type rateLimiter struct {
	tokens         int
	lastRefillTime time.Time
	mu             *sync.Mutex
}

// NewIPRateLimiter creates a new rate limiter
// r: number of requests allowed per duration
// d: duration window (e.g., 1 minute)
func NewIPRateLimiter(r int, d time.Duration) *IPRateLimiter {
	return &IPRateLimiter{
		ips: make(map[string]*rateLimiter),
		mu:  &sync.RWMutex{},
		r:   r,
		d:   d,
	}
}

// AddIP creates a new rate limiter for an IP address
func (i *IPRateLimiter) AddIP(ip string) *rateLimiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter := &rateLimiter{
		tokens:         i.r,
		lastRefillTime: time.Now(),
		mu:             &sync.Mutex{},
	}

	i.ips[ip] = limiter
	return limiter
}

// GetLimiter returns the rate limiter for an IP address
func (i *IPRateLimiter) GetLimiter(ip string) *rateLimiter {
	i.mu.Lock()
	limiter, exists := i.ips[ip]

	if !exists {
		i.mu.Unlock()
		return i.AddIP(ip)
	}

	i.mu.Unlock()
	return limiter
}

// Allow checks if a request from this IP should be allowed
func (rl *rateLimiter) Allow(r int, d time.Duration) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Refill tokens based on time elapsed
	now := time.Now()
	elapsed := now.Sub(rl.lastRefillTime)

	if elapsed >= d {
		// Refill tokens
		rl.tokens = r
		rl.lastRefillTime = now
	}

	// Check if we have tokens available
	if rl.tokens > 0 {
		rl.tokens--
		return true
	}

	return false
}

// RateLimitMiddleware creates a middleware that limits requests per IP
// For production: limit to 100 requests per minute per IP to prevent abuse
func RateLimitMiddleware() gin.HandlerFunc {
	// Allow 100 requests per minute per IP
	limiter := NewIPRateLimiter(100, time.Minute)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := limiter.GetLimiter(ip)

		if !limiter.Allow(100, time.Minute) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// StrictRateLimitMiddleware creates a stricter rate limit for sensitive endpoints
// For production: limit to 10 requests per minute per IP for auth endpoints
func StrictRateLimitMiddleware() gin.HandlerFunc {
	// Allow only 10 requests per minute per IP for auth endpoints
	limiter := NewIPRateLimiter(10, time.Minute)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := limiter.GetLimiter(ip)

		if !limiter.Allow(10, time.Minute) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many authentication attempts. Please try again in a minute.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
