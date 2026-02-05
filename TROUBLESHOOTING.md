# Troubleshooting Guide

## Issue: Metro bundler error with folder paths containing spaces

### Problem
```
Error: ENOENT: no such file or directory, mkdir 'C:\Users\lenovo\Desktop\project file\cartela app\.expo\metro\externals\node:sea'
```

### Solutions (try in order):

### Solution 1: Clear cache and restart
```bash
npm run reset
```

### Solution 2: Move project to path without spaces
1. Move the entire project folder to a path without spaces, like:
   - `C:\Users\lenovo\Desktop\cartela-app`
   - `C:\cartela-app`

### Solution 3: Manual cleanup
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install

# Clear npm cache
npm cache clean --force

# Start with clear cache
npm run reset
```

### Solution 4: Use different terminal
Try running from:
- PowerShell (as Administrator)
- Command Prompt (as Administrator)
- VS Code integrated terminal

### Solution 5: Check Node.js version
Make sure you have Node.js 16+ installed:
```bash
node --version
npm --version
```

### Solution 6: Alternative start methods
```bash
# Try these alternatives:
npx expo start --clear
npx expo start --tunnel
npx expo start --localhost
```

### Solution 7: Create new project (if all else fails)
```bash
# Create new expo project
npx create-expo-app cartela-viewer
# Copy your files (App.js, cartela.js, etc.) to new project
```

## Recommended: Move to path without spaces
The easiest fix is to move your project to a folder path without spaces:
`C:\Users\lenovo\Desktop\cartela-app`