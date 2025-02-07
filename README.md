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

## 🌐 Server (FastAPI)

### 🚀 Getting Started

1. **Open a new terminal**
2. Navigate to the server directory:
   ```sh
   cd server
   ```
3. **Activate the virtual environment**
   - macOS/Linux:
     ```sh
     source venv/bin/activate
     ```
   - Windows:
     ```sh
     source venv/Scripts/activate
     ```
4. **Run FastAPI server**
   - Default:
     ```sh
     uvicorn app.main:app --reload
     ```
   - Custom IP address:
     ```sh
     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
     ```

Your FastAPI server should now be running and ready to accept requests!

---

## 📌 Additional Notes
- Ensure your mobile device is connected to the same network as your development machine.

Happy coding! 🎉

