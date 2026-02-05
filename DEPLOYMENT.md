# Deployment Guide for Cartela Viewer

## Quick Deploy Options

### 1. Expo Go (Easiest - For Testing)

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Then scan the QR code with Expo Go app on your phone.

### 2. Build APK for Android

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### 3. Build for iOS (Mac only)

```bash
# Build for iOS
eas build --platform ios --profile preview
```

### 4. Web Deployment

```bash
# Build for web
expo export:web

# Deploy to Netlify/Vercel
# Upload the web-build folder
```

## Detailed Instructions

### Prerequisites

1. **Node.js** (v16+): https://nodejs.org/
2. **Expo CLI**: `npm install -g @expo/cli`
3. **EAS CLI**: `npm install -g @expo/eas-cli`

### Step-by-Step Deployment

#### Option A: Expo Development Build (Recommended)

1. **Setup Project**
   ```bash
   npm install
   expo install
   ```

2. **Create Expo Account**
   ```bash
   eas login
   ```

3. **Configure Build**
   ```bash
   eas build:configure
   ```

4. **Build APK**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Download & Install**
   - Go to expo.dev/accounts/[username]/projects/cartela-viewer
   - Download the APK file
   - Install on Android device

#### Option B: Standalone APK (No Expo Go needed)

1. **Update app.json for standalone**
   ```json
   {
     "expo": {
       "name": "Cartela Viewer",
       "slug": "cartela-viewer",
       "version": "1.0.0",
       "platforms": ["ios", "android", "web"],
       "android": {
         "package": "com.yourname.cartelaviewer",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build**
   ```bash
   eas build --platform android --profile production
   ```

#### Option C: Web Deployment

1. **Build for Web**
   ```bash
   expo export:web
   ```

2. **Deploy to Netlify**
   - Go to netlify.com
   - Drag & drop the `web-build` folder
   - Get your live URL

3. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Build Profiles (eas.json)

Create `eas.json` for different build types:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   ```bash
   expo doctor
   npm install
   ```

2. **Android Build Issues**
   - Ensure package name is unique
   - Check version codes

3. **iOS Build Issues (Mac only)**
   - Need Apple Developer account
   - Configure signing certificates

### File Size Optimization

1. **Reduce Bundle Size**
   ```bash
   # Remove unused dependencies
   npm prune
   
   # Optimize images in assets folder
   ```

2. **Enable Hermes (Android)**
   ```json
   {
     "expo": {
       "android": {
         "jsEngine": "hermes"
       }
     }
   }
   ```

## Distribution

### Android:
- **Google Play Store**: Upload app-bundle from production build
- **Direct APK**: Share APK file from preview build
- **Internal Testing**: Use Expo's internal distribution

### iOS:
- **App Store**: Upload to App Store Connect
- **TestFlight**: For beta testing
- **Ad Hoc**: Direct installation (limited devices)

### Web:
- **Netlify**: Free hosting with custom domain
- **Vercel**: Free hosting with automatic deployments
- **GitHub Pages**: Free static hosting

## Quick Commands Summary

```bash
# Development
npm start

# Build APK (Android)
eas build --platform android --profile preview

# Build for production
eas build --platform all --profile production

# Web build
expo export:web

# Check project health
expo doctor
```

Choose the deployment method that best fits your needs!