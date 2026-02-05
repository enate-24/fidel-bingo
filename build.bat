@echo off
echo 🚀 Building Fidel Bingo for Production...

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g eas-cli
)

REM Login to EAS (if not already logged in)
echo 🔐 Checking EAS login status...
eas whoami || eas login

REM Build for Android (APK)
echo 📱 Building Android APK...
eas build --platform android --profile production

echo ✅ Build initiated! Check your build status at:
echo https://expo.dev/accounts/[your-account]/projects/fidel-bingo/builds

pause