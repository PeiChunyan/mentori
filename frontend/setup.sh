#!/bin/bash

# Frontend Setup & Run Script

echo "🚀 Setting up Mentori Frontend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the frontend directory?"
    echo "   Run: cd frontend && bash setup.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local << 'EOF'
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# OAuth (Optional - only needed for Google/Apple)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
# NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id_here
EOF
    echo "✅ Created .env.local (update with your OAuth credentials if needed)"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure backend is running: cd backend && go run cmd/server/main.go"
echo "   2. Start frontend: npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo "   4. Read FRONTEND-TESTING-GUIDE.md for testing instructions"
echo ""
