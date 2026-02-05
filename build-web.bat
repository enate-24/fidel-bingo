@echo off
echo 🚀 Building Fidel Bingo for Web Projection...

echo 📦 Exporting web build...
npx expo export --platform web

if exist dist (
    echo ✅ Build successful! 
    echo 📁 Files created in 'dist' folder
    echo.
    echo 🌐 To run locally:
    echo    npx serve dist
    echo.
    echo 📱 Or open dist\index.html directly in browser
    echo.
    echo 🎯 Perfect for projection and presentations!
) else (
    echo ❌ Build failed. Trying alternative method...
    echo 🔄 Starting development server instead...
    npm start
)

pause