# 🎭 Mentori Network - Demo Version

> **⚠️ DEMO ENVIRONMENT - For Demonstration Purposes Only**

This is a **demonstration version** of Mentori Network, a mentorship platform connecting newcomers with experienced mentors in Finland.

## 🚨 Important Notice

**This is NOT a production application. This is a pivot prototype.**

- ❌ No real user data is collected or stored
- ❌ No authentication required - users simply choose a role
- ❌ All profiles are fictional/simulated
- ❌ Messaging is simulated - no real messages sent
- ❌ No email services or OAuth configured
- ✅ Rate limiting active to prevent abuse
- ✅ Full disclaimer shown to all users

## 🎯 What This Demo Shows

This demonstration showcases:

1. **User Experience:** Clean, intuitive interface for browsing mentors/mentees
2. **Role-Based Views:** Different experiences for mentors vs mentees
3. **Profile Discovery:** Search and filter by location, expertise, and interests
4. **Matching Concept:** How users would find compatible mentors/mentees
5. **Messaging Interface:** Preview of how communication would work
6. **Mobile Responsive:** Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Frontend Only (Recommended)

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### With Backend (Optional)

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/server/main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📊 Demo Data

- **20 Mentors:** Diverse professionals across Finland
  - Software engineers, teachers, entrepreneurs, healthcare workers
  - Expertise in: Job hunting, education, language, housing, business
  - Located in: Helsinki, Tampere, Turku, Oulu, Rovaniemi, and more

- **20 Mentees:** Newcomers from around the world
  - Various backgrounds: Students, professionals, entrepreneurs, families
  - Seeking help with: Career, education, integration, language, housing
  - From countries: Egypt, India, Spain, Japan, UK, Russia, UAE, Brazil, and more

## 🎨 Features

### For All Users
- ✅ Role selection (Mentor or Mentee)
- ✅ Browse profiles with rich information
- ✅ Filter by location, expertise, and interests
- ✅ View detailed profile information
- ✅ Responsive design for all devices
- ✅ Multi-language support (EN/FI)

### Demo-Specific Features
- ✅ No registration required
- ✅ Instant access to all features
- ✅ Clear demo indicators
- ✅ Industry disclaimer
- ✅ Simulated messaging UI

## 🛡️ Security Features

Even though this is a demo, security best practices are implemented:

1. **Rate Limiting:** 100 requests/minute per IP (global), 10 requests/minute for auth
2. **CORS Protection:** Configured allowed origins
3. **Input Validation:** All inputs are validated
4. **No Credential Exposure:** Zero sensitive data in code or environment
5. **HTTPS Ready:** SSL/TLS support for deployment

## 📁 Project Structure

```
mentori/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js 14 pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and demo data
│   │   └── ...
│   └── package.json
│
├── backend/              # Go backend API (optional for demo)
│   ├── cmd/
│   │   └── server/       # Main server
│   ├── internal/
│   │   ├── handlers/     # HTTP handlers
│   │   ├── middleware/   # Rate limiting, CORS, etc.
│   │   └── ...
│   └── go.mod
│
├── .env.production       # Production demo configuration
└── PRODUCTION-DEMO-DEPLOYMENT.md  # Detailed deployment guide
```

## 🌐 Deployment

See [PRODUCTION-DEMO-DEPLOYMENT.md](PRODUCTION-DEMO-DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy Options:**
- **Vercel:** Best for frontend-only demo
- **Railway:** Full stack with auto-deployment
- **Render:** Simple full stack deployment
- **Docker:** `docker-compose up`

## 💡 User Journey

1. **Visit the site** → See landing page with value proposition
2. **Click "Get Started"** → See demo disclaimer modal
3. **Acknowledge disclaimer** → Proceed to role selection
4. **Choose role** → Select "I'm a Mentor" or "I'm a Mentee"
5. **Explore dashboard** → See personalized demo dashboard
6. **Browse profiles** → Find mentors or mentees by filters
7. **View details** → See complete profiles with expertise and interests
8. **Demo messaging** → Understand how communication would work

## 🔧 Technology Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Demo data in TypeScript

**Backend (Optional):**
- Go 1.21+
- Gin web framework
- Rate limiting middleware
- Health check endpoints

## 📝 Environment Variables

### Frontend (.env.production)
```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Backend (.env.production)
```env
DEMO_MODE=true
PORT=8080
RATE_LIMIT_REQUESTS_PER_MINUTE=100
# All OAuth/email credentials intentionally empty
```

## 🤝 Demo Disclaimer

Every user sees this disclaimer before accessing the demo:

> **This is a demonstration version of Mentori Network.**
> 
> - No personal data is collected, stored, or transmitted
> - All profiles, messages, and interactions are simulated
> - Login does not require credentials
> - Nothing you do here is real or permanent
> 
> This is a pivot prototype to showcase features and functionality.

## 📊 Analytics & Monitoring

**What's NOT tracked (by design):**
- ❌ User behavior or analytics
- ❌ Error reporting
- ❌ Performance monitoring
- ❌ User interactions

**What IS logged:**
- ✅ Basic server logs (requests, errors)
- ✅ Rate limiting events
- ✅ Health check status

## 🚫 What This Demo Does NOT Do

To be completely transparent:

- ❌ Create real user accounts
- ❌ Store any personal information
- ❌ Send emails or notifications
- ❌ Process payments
- ❌ Use cookies (beyond session storage)
- ❌ Track users across sessions
- ❌ Connect to OAuth providers (Google, Apple)
- ❌ Use a real database (optional SQLite for backend health only)
- ❌ Implement real-time messaging
- ❌ Save conversation history

## 🎓 Use Cases

This demo is perfect for:

1. **Pitch Presentations:** Show investors the concept and UX
2. **User Testing:** Get feedback on interface and flow
3. **Partner Discussions:** Demonstrate value proposition
4. **MVP Validation:** Test if the concept resonates with users
5. **Development Planning:** Reference for building the real platform

## 📚 Documentation

- [PRODUCTION-DEMO-DEPLOYMENT.md](PRODUCTION-DEMO-DEPLOYMENT.md) - Deployment guide
- [API.md](docs/API.md) - API documentation (for real implementation)
- [requirements.md](docs/requirements.md) - Original requirements

## 🔮 Future Roadmap (Real Platform)

To convert this demo into a production application:

1. **Authentication:** Implement OAuth2, email verification
2. **Database:** PostgreSQL with proper schema and migrations
3. **Real-Time:** WebSocket for messaging
4. **Email:** Integration with SendGrid/AWS SES
5. **Payments:** Stripe integration for mentor sessions
6. **Analytics:** User behavior tracking (with consent)
7. **Admin Panel:** User management and moderation
8. **Mobile Apps:** Native iOS and Android applications
9. **GDPR Compliance:** Full data protection implementation
10. **Testing:** Comprehensive unit, integration, and e2e tests

## 🤔 Questions?

This is a demonstration prototype for the Mentori Network concept.

**For the demo:**
- Check the code - it's all there!
- Read the deployment guide
- Try it yourself at [your-demo-url]

**For the real platform:**
- Contact the development team
- Business inquiries welcome

## ⚖️ License

This demonstration project is for showcase purposes.

---

**🎭 Remember: This is a DEMO. Enjoy exploring the concept, but no real data is involved!**

Made with ❤️ to help newcomers succeed in Finland
