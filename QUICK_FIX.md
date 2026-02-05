# Quick Fix for Path Issues

## The Problem
Your project folder path has spaces: `C:\Users\lenovo\Desktop\project file\cartela app`

This causes issues with Metro bundler and Node.js tools.

## Quick Solution

### Option 1: Move the folder (Recommended)
1. Copy your entire project folder to a new location without spaces:
   ```
   From: C:\Users\lenovo\Desktop\project file\cartela app
   To:   C:\Users\lenovo\Desktop\cartela-app
   ```

2. Open terminal in the new location and run:
   ```bash
   npm install
   npm start
   ```

### Option 2: Use the batch file
1. Double-click `start.bat` in your current folder
2. This will try to start the app with proper escaping

### Option 3: Use PowerShell with quotes
1. Open PowerShell as Administrator
2. Navigate to your folder:
   ```powershell
   cd "C:\Users\lenovo\Desktop\project file\cartela app"
   ```
3. Run:
   ```powershell
   npx expo start --clear
   ```

## Why This Happens
- Node.js and Metro bundler have issues with folder paths containing spaces
- The error `mkdir 'C:\Users\lenovo\Desktop\project file\cartela app\.expo\metro\externals\node:sea'` shows the path parsing issue

## Best Practice
Always use folder names without spaces for development projects:
- ✅ `cartela-app`
- ✅ `cartela_app` 
- ✅ `cartelaApp`
- ❌ `cartela app`
- ❌ `project file`