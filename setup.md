# Setup Instructions for Cartela Viewer App

## Prerequisites

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/

2. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

3. **Expo Go App** (for testing on physical device)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

3. **Run on Device/Simulator**
   - **Physical Device**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press `i` in terminal (requires Xcode on Mac)
   - **Android Emulator**: Press `a` in terminal (requires Android Studio)
   - **Web Browser**: Press `w` in terminal

## Troubleshooting

### Common Issues:

1. **Metro bundler issues**
   ```bash
   expo start --clear
   ```

2. **Node modules issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Expo CLI not found**
   ```bash
   npm install -g @expo/cli
   ```

### Platform-Specific Setup:

**For iOS Development (Mac only):**
- Install Xcode from Mac App Store
- Install iOS Simulator

**For Android Development:**
- Install Android Studio
- Set up Android Virtual Device (AVD)

## Features Overview

- Browse through 1000 different bingo cards
- Mark numbers by tapping them
- Call numbers and auto-mark on current card
- Automatic BINGO detection
- Track called numbers
- Clear all markings

## File Structure

```
cartela-viewer/
├── App.js              # Main app component
├── cartela.js          # Bingo cards data (1000 cards)
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
├── assets/            # App icons and images
└── README.md          # Documentation
```