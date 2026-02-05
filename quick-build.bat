@echo off
echo 🚀 Building Fidel Bingo for Web (Offline Method)...

echo 📦 Building web version...
npx expo export --platform web

echo ✅ Build complete! Files are in the 'dist' folder.
echo 🌐 To serve locally, run: npx serve dist
echo 📁 You can also open dist/index.html directly in browser

pause