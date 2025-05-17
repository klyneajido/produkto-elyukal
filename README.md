# Produkto Elyukal

Welcome to **Produkto Elyukal**! This repository contains the code for both the **client** (React Native) and **server** (FastAPI) components of the project.

---

## 📱 Client (React Native)

### 🛠 Prerequisites
Before getting started, ensure you have completed the **React Native - Environment Setup**. Stop before the "Creating a new application" section, as we have already set it up for you!

### 🚀 Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Start Metro Bundler and run the application**
   
   - **Android**
     ```sh
     npx react-native run-android
     ```
   - **iOS** (Mac only)
     ```sh
     npx react-native run-ios
     ```

### ⚠️ Known Issues and Fixes

If you encounter build errors related to `react-native-intent-launcher`, you need to:

1. Navigate to `node_modules/react-native-intent-launcher/android/build.gradle`
2. Change `compile` to `implementation` in the dependencies section
3. Rebuild the project

This fixes a common compatibility issue with newer versions of React Native.

## 📄 License

This project is proprietary and confidential. Copyright (c) 2024 Produkto-Elyukal Team (Andriq Ajido, Maira Rosales, Xavier San Juan). All rights reserved. See the LICENSE file for details.

⚠️ **Note:** Due to limitations of the Apple Simulator and Android Emulator, you must run your project on a physical device.

3. **Run your app**
   If everything is set up correctly, your app should be running on your Android/iOS device or emulator.

   - For **Android**, press **`R`** twice or use the Developer Menu:
     - **Windows/Linux:** `Ctrl + M`
     - **macOS:** `Cmd ⌘ + M`
   - You can also run the app directly from Android Studio or Xcode.

### 📖 Next Steps
Check out our documentation for detailed guides, examples, and best practices!

---

## 🌐 Server (FastAPI + Rasa)

### 🚀 Getting Started

1. **Open a new terminal**
2. Navigate to the server directory and make a virtual environment(if none yet):
   ```sh
   cd server
   ```

   ``` sh
   python -m venv venv
   ```

3. **Install necessary packages (NOTE: only this if setting up project for the first time)**
   ```sh
   pip install -r requirements.tsx
   ```

4. **Activate the backend**
   - Windows:
     ```sh
     ./start-backend.sh
     ```
Your FastAPI + Rasa (for the chatbot) server should now be running and ready to accept requests!

---

## 📌 Additional Notes
- Ensure your mobile device is connected to the same network as your development machine. Change the Base URL or the IP address on client/src/config/config.ts

Happy coding! 🎉

