# Android SDK Setup for Expo Development

## Option 1: Lightweight Setup (Command Line Tools Only)

1. **Download Android SDK Command Line Tools**: 
   - Go to https://developer.android.com/studio#command-tools
   - Download "Command line tools only" for Windows
   - Extract to `C:\Android\cmdline-tools\latest\`

2. **Install Platform Tools** (includes ADB):
   ```cmd
   cd C:\Android\cmdline-tools\latest\bin
   sdkmanager "platform-tools"
   ```

## Option 2: Full Android Studio

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android Studio** with default settings
3. **Open Android Studio** and complete the setup wizard

## Configure Environment Variables

### For Option 1 (Command Line Tools):
Add these to your system environment variables:

```
ANDROID_HOME=C:\Android
ANDROID_SDK_ROOT=C:\Android
```

Add to your PATH:
```
C:\Android\platform-tools
C:\Android\cmdline-tools\latest\bin
```

### For Option 2 (Android Studio):
Add these to your system environment variables:

```
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

Add to your PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## Enable USB Debugging on Android Device

1. Go to Settings > About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go to Settings > Developer Options
4. Enable "USB Debugging"
5. Connect device via USB
6. Accept the debugging prompt on your device

## Test ADB Connection

After setup, test with:
```bash
adb devices
```

You should see your device listed.

## Run on Android

```bash
npx @expo/cli@latest start --android
```