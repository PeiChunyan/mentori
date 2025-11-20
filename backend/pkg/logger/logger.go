package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

// Logger levels
type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
)

var (
	logLevel = INFO
	logger   = log.New(os.Stdout, "", 0)
)

// SetLevel sets the global log level
func SetLevel(level Level) {
	logLevel = level
}

// Debug logs a debug message
func Debug(message string, args ...interface{}) {
	if logLevel <= DEBUG {
		log := fmt.Sprintf("[DEBUG] %s - %s", time.Now().Format("2006-01-02 15:04:05"), fmt.Sprintf(message, args...))
		logger.Println(log)
	}
}

// Info logs an info message
func Info(message string, args ...interface{}) {
	if logLevel <= INFO {
		log := fmt.Sprintf("[INFO] %s - %s", time.Now().Format("2006-01-02 15:04:05"), fmt.Sprintf(message, args...))
		logger.Println(log)
	}
}

// Warn logs a warning message
func Warn(message string, args ...interface{}) {
	if logLevel <= WARN {
		log := fmt.Sprintf("[WARN] %s - %s", time.Now().Format("2006-01-02 15:04:05"), fmt.Sprintf(message, args...))
		logger.Println(log)
	}
}

// Error logs an error message
func Error(message string, args ...interface{}) {
	if logLevel <= ERROR {
		log := fmt.Sprintf("[ERROR] %s - %s", time.Now().Format("2006-01-02 15:04:05"), fmt.Sprintf(message, args...))
		logger.Println(log)
	}
}

// Fatal logs a fatal error and exits
func Fatal(message string, args ...interface{}) {
	log := fmt.Sprintf("[FATAL] %s - %s", time.Now().Format("2006-01-02 15:04:05"), fmt.Sprintf(message, args...))
	logger.Println(log)
	os.Exit(1)
}

// WithFields returns a structured log message
func WithFields(fields map[string]interface{}) string {
	result := ""
	for key, value := range fields {
		result += fmt.Sprintf("%s=%v ", key, value)
	}
	return result
}
