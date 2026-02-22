---
description: Build the web app, sync with Capacitor, and open Android Studio
---
# Android Deployment Workflow

This workflow automates the process of deploying the current web application to the Capacitor Android project and preparing it for Android Studio.

1. Ensure all web changes are saved and dependencies are installed.
2. Build the web project for production.
```bash
npm run build
```
// turbo
3. Sync the compiled code with the Capacitor Android project.
```bash
npx cap sync android
```
// turbo
4. Open the Android project in Android Studio (this step requires Android Studio to be installed and correctly configured in the system PATH).
```bash
npx cap open android
```
