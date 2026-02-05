# Fidel Bingo - Production Build Guide

## Prerequisites
Make sure you have:
- Node.js installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- EAS CLI installed globally: `npm install -g eas-cli`

## Build Commands

### 1. Android APK (Recommended for distribution)
```bash
eas build --platform android --profile production
```

### 2. Android AAB (For Google Play Store)
```bash
eas build --platform android --profile production --local
```

### 3. iOS Build (Requires Apple Developer Account)
```bash
eas build --platform ios --profile production
```

### 4. Web Build (For web deployment)
```bash
npx expo export --platform web
```

## Quick Build Options

### For Testing (APK)
```bash
eas build --platform android --profile preview
```

### For Development
```bash
eas build --platform android --profile development
```

## Build Status
After running the build command, you can check the status at:
https://expo.dev/accounts/[your-account]/projects/fidel-bingo/builds

## Download
Once the build is complete, you can download the APK/IPA file from the Expo dashboard or use the provided download link.

## Local Build (if you prefer)
```bash
eas build --platform android --profile production --local
```

Note: Local builds require Android Studio (for Android) or Xcode (for iOS) to be installed.