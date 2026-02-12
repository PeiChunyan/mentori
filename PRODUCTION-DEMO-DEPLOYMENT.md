# Production Demo Deployment Guide

This guide explains how to deploy the **demo version** of Mentori Network. This is a demonstration environment with no real data collection or storage.

## ⚠️ Important: Demo Environment

**This is a pivot/demo deployment:**
- No real user authentication (users choose role without credentials)
- All mentor/mentee profiles are hardcoded mock data
- No backend database required (optional SQLite for backend health checks)
- Messaging is simulated - no real messages sent or stored
- No email services or OAuth providers configured
- No sensitive credentials or user data

## Features

✅ Users can choose to be mentor or mentee
✅ Browse 20 pre-populated mentors with diverse backgrounds
✅ Browse 20 pre-populated mentees with diverse backgrounds  
✅ View profile details and expertise
✅ See messaging UI (simulated only)
✅ Rate limiting to prevent abuse (100 req/min per IP)
✅ Industry disclaimer before any interaction
✅ Clear demo indicators throughout the app

## Quick Start

### Option 1: Frontend Only (Recommended for Demo)

The frontend can run standalone without the backend, using only demo data.

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run in production mode
npm run build
npm run start
```

The app will be available at `http://localhost:3000`

### Option 2: Full Stack (Frontend + Backend)

If you want to demonstrate the full architecture:

**Backend:**
```bash
cd backend

# Copy production env file
cp ../.env.production .env

# Install Go dependencies
go mod download

# Build
go build -o bin/server cmd/server/main.go

# Run
./bin/server
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start
npm run start
```

## Deployment Configuration

### Environment Variables

**Frontend (.env.production):**
- `NEXT_PUBLIC_DEMO_MODE=true` - Enables demo mode
- `NEXT_PUBLIC_API_URL` - Backend API URL (optional, defaults to demo data)

**Backend (.env.production):**
- `DEMO_MODE=true` - Indicates demo deployment
- `RATE_LIMIT_REQUESTS_PER_MINUTE=100` - Global rate limit
- `RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE=10` - Auth endpoint rate limit
- `DATABASE_URL` - Optional, for health checks only
- All OAuth and email credentials are empty (not used)

### Security Features

1. **Rate Limiting:**
   - Global: 100 requests per minute per IP
   - Auth endpoints: 10 requests per minute per IP
   - Prevents denial of service attacks

2. **No Credential Exposure:**
   - No real passwords stored or transmitted
   - No OAuth secrets in code or environment
   - No email service credentials
   - Demo JWT tokens are clearly marked

3. **Demo Indicators:**
   - Disclaimer modal on first visit
   - Demo banner on all pages
   - "DEMO MODE" indicators throughout UI
   - Clear messaging about simulated data

## Deploying to Cloud Platforms

### Vercel (Frontend Only - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_DEMO_MODE=true`

### Railway / Render (Full Stack)

**Frontend:**
- Build Command: `cd frontend && npm install && npm run build`
- Start Command: `cd frontend && npm run start`
- Environment: Set `NEXT_PUBLIC_DEMO_MODE=true`

**Backend (Optional):**
- Build Command: `cd backend && go build -o bin/server cmd/server/main.go`
- Start Command: `cd backend && ./bin/server`
- Environment: Copy from `.env.production`

### Docker (Full Stack)

```bash
# Build and run with docker-compose
docker-compose -f docker-compose.yml up --build
```

The demo will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080` (if running)

## User Flow

1. **Landing Page:** Users see the main landing page
2. **Disclaimer:** First-time users see demo disclaimer modal
3. **Role Selection:** Users choose "I'm a Mentor" or "I'm a Mentee"
4. **Dashboard:** Users see a personalized dashboard (demo data)
5. **Browse:** Users can browse mentors/mentees and see messaging UI
6. **Demo Indicators:** Clear messaging that this is a demonstration

## Data

- **20 Mentors:** Diverse backgrounds including tech, education, healthcare, business
- **20 Mentees:** Various origins, goals, and expertise needs
- All located in Finnish cities (Helsinki, Tampere, Turku, Oulu, etc.)
- Expertise areas: Job hunting, education, language, housing, business, family life
- Interests: Outdoor activities, culture, food, sports, arts, technology

## Limitations (By Design)

❌ No real user registration or authentication
❌ No persistent data storage
❌ No actual messaging functionality
❌ No email notifications
❌ No OAuth login (Google/Apple)
❌ No payment processing
❌ No admin panel functionality

## Monitoring

Since this is a demo:
- No user analytics or tracking
- No error reporting services
- Basic server logs only
- Health check endpoint: `/health`

## Support

This is a demonstration prototype to showcase the Mentori Network concept. 
For questions about the real platform or business inquiries, contact the development team.

## Next Steps (Moving Beyond Demo)

To convert this to a production application:
1. Implement real authentication (OAuth, email verification)
2. Set up PostgreSQL database
3. Implement real-time messaging (WebSocket/Socket.io)
4. Add email service (SendGrid, AWS SES)
5. Implement payment processing (Stripe)
6. Add analytics and monitoring
7. Implement proper user data handling and GDPR compliance
8. Set up CI/CD pipeline
9. Configure CDN and caching
10. Implement comprehensive testing

---

**Remember:** This is a DEMO. No real data is collected or stored. All profiles and interactions are simulated.
