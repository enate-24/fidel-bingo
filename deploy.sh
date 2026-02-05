#!/bin/bash

# Cartela Viewer Deployment Script

echo "🎯 Cartela Viewer Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI is ready"

# Ask user for deployment type
echo ""
echo "Choose deployment option:"
echo "1) Development server (Expo Go)"
echo "2) Build APK for Android"
echo "3) Build for web"
echo "4) Build for production"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting development server..."
        echo "Scan the QR code with Expo Go app on your phone"
        npm start
        ;;
    2)
        echo "🔨 Building APK for Android..."
        
        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            echo "📱 Installing EAS CLI..."
            npm install -g @expo/eas-cli
        fi
        
        echo "Please login to your Expo account:"
        eas login
        
        echo "Building APK..."
        eas build --platform android --profile preview
        
        echo "✅ APK build started! Check your Expo dashboard for download link."
        ;;
    3)
        echo "🌐 Building for web..."
        expo export:web
        
        echo "✅ Web build complete! Files are in 'web-build' folder"
        echo "You can deploy this folder to:"
        echo "- Netlify: drag & drop the web-build folder"
        echo "- Vercel: run 'npx vercel --prod'"
        echo "- GitHub Pages: upload contents to your repo"
        ;;
    4)
        echo "🏭 Building for production..."
        
        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            echo "📱 Installing EAS CLI..."
            npm install -g @expo/eas-cli
        fi
        
        echo "Please login to your Expo account:"
        eas login
        
        echo "Building for production..."
        eas build --platform all --profile production
        
        echo "✅ Production build started! Check your Expo dashboard."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📚 For more deployment options, check DEPLOYMENT.md"