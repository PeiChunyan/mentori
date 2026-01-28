# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Unreleased section is reserved for communicating possible future changes.


## [0.2.0] - 2026-01-28

### Added
- Email verification authentication (6-digit codes)
- Google and Apple OAuth integration
- Profile system with expertise (15 options) and interests (20 options)
- Profile search and filtering by role, location, expertise, interests
- Database seed script with 8 Finnish mentor profiles
- Warm, consumer-friendly landing page with gradient design
- Bilingual support (English and Finnish)


## [0.1.0] - 2025-11-20

### Fixed
- Swagger UI authorization support with JWT token
- README documentation with setup and testing instructions
- Removed duplicated docs folder at root level

## [0.0.1] - 2025-11-19

### Added

- Initial release of Mentori mentorship platform
- Backend REST API with authentication, user management, and profile system
- PostgreSQL database with Docker Compose setup
- JWT-based authentication with role-based access control (admin, mentor, mentee)
- Swagger/OpenAPI documentation with interactive UI
