#!/bin/bash

echo "🚀 Building Fidel Bingo for Production..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS login status..."
eas whoami || eas login

# Build for Android (APK)
echo "📱 Building Android APK..."
eas build --platform android --profile production

echo "✅ Build initiated! Check your build status at:"
echo "https://expo.dev/accounts/$(eas whoami)/projects/fidel-bingo/builds"