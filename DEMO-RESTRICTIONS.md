# Demo Mode Restrictions

This document outlines what is and isn't available in the production demo version.

## ✅ Available Features

### Authentication & Navigation
- ✅ **Role Selection**: Choose to demo as a mentor or mentee
- ✅ **Dashboard Access**: View personalized dashboard
- ✅ **Navigation**: Browse all pages and sections

### Profile Browsing
- ✅ **Browse Profiles**: View 40 pre-populated profiles
  - 20 diverse mentors from various Finnish cities
  - 20 mentees from different countries
- ✅ **Search & Filter**: Use all discovery features
- ✅ **View Details**: See complete profile information
- ✅ **Profile Cards**: View expertise, bio, availability

### Messaging Interface
- ✅ **UI Preview**: See the messaging interface
- ✅ **Layout**: Explore chat interface design
- ✅ **Demo Notice**: Clear indication this is demonstration only

## ❌ Disabled Features

### Profile Management
- ❌ **Profile Creation**: Cannot create new profiles
- ❌ **Profile Editing**: Cannot modify existing profiles
- ❌ **Photo Upload**: No image upload functionality
- ❌ **Settings Changes**: Profile settings are read-only

### Communication
- ❌ **Send Messages**: Cannot send real messages
- ❌ **Real-time Chat**: No actual communication
- ❌ **Notifications**: No notification system

### Data Persistence
- ❌ **Database Writes**: No data is saved to database
- ❌ **User Registration**: No real account creation
- ❌ **Data Export**: No user data to export

## 🎭 Demo Indicators

Visual indicators throughout the platform:
1. **Yellow Banner**: Present on all authenticated pages
2. **Disabled Buttons**: Grayed out with "(Demo Only)" labels
3. **Info Messages**: Clear explanation of demo limitations
4. **🎭 Emoji**: Demo mode indicator

## 🔒 Security Features

Even in demo mode, security is maintained:
- ✅ Rate limiting active (100 req/min global, 10 req/min auth)
- ✅ No real credentials stored or exposed
- ✅ No database connections
- ✅ localStorage only (no sensitive data)
- ✅ Industry disclaimer shown before entry

## 💡 User Experience

Demo users can:
1. Select mentor or mentee role
2. See how the dashboard works
3. Browse diverse profiles
4. Understand the matching system
5. Preview messaging capabilities
6. Evaluate platform features

Demo users cannot:
1. Create or edit profiles
2. Send actual messages
3. Connect with real users
4. Export or save data
5. Access admin features

## 📝 Notice Placement

Restrictions are communicated at:
- **Dashboard**: Disabled buttons with explanatory text
- **Profile Creation Page**: Full explanation page with feature list
- **Messages Page**: Demo notice with explanation
- **All Pages**: Yellow demo banner at top

## 🚀 Upgrade Path

For full functionality, users need to:
1. Visit the actual platform (non-demo URL)
2. Complete real registration
3. Verify email (if implemented)
4. Create authentic profile
5. Connect with real mentors/mentees

---

**Last Updated**: January 2025
**Demo Version**: Production Demo Branch
