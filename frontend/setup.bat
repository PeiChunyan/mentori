@echo off
REM Frontend Setup & Run Script for Windows

echo 🚀 Setting up Mentori Frontend...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Are you in the frontend directory?
    echo    Run: cd frontend ^& setup.bat
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local...
    (
        echo # Backend API
        echo NEXT_PUBLIC_API_URL=http://localhost:8080
        echo.
        echo # OAuth ^(Optional - only needed for Google/Apple^)
        echo # NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
        echo # NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id_here
    ) > .env.local
    echo ✅ Created .env.local ^(update with your OAuth credentials if needed^)
)

echo.
echo ✨ Setup complete!
echo.
echo 📋 Next steps:
echo    1. Make sure backend is running: cd backend ^& go run cmd/server/main.go
echo    2. Start frontend: npm run dev
echo    3. Open http://localhost:3000 in your browser
echo    4. Read FRONTEND-TESTING-GUIDE.md for testing instructions
echo.
