# 🚌 Bus Routine and Real-time Status Full-Stack Application

A modern full-stack mobile application using **React Native with Expo**, **Node.js (Express) with TypeScript**, and **MongoDB (Mongoose)** designed to deliver real-time schedule information, cancellations, and status reports to passengers and drivers.

---

## 📂 Repository Structure

* **`backend/`**: Node.js + Express + TypeScript API.
* **`mobile/`**: React Native mobile app with Expo Router.

---

## ⚡ Quick Start: Running the Application

### 🗄️ Prerequisites
1. [Node.js](https://nodejs.org/) (v18 or higher recommended)
2. [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or a MongoDB Atlas connection string).

---

### 📦 1. Start the Node.js Express Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the development server:
   ```bash
   npm run dev
   ```
   *The server will start at:* **`http://localhost:5000`**
   *Verify it's running by loading:* `http://localhost:5000/health` in your browser.

---

### 📱 2. Start the React Native Expo App

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Build the project environment:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm run start
   ```
4. **Running on Devices:**
   * **Android Emulator:** Press `a` in your terminal.
   * **iOS Simulator:** Press `i` in your terminal (macOS only).
   * **Physical Device:** Install the **Expo Go** app (iOS/Android), scan the QR code displayed in the terminal.

> ⚠️ **Note for Physical Devices:**
> If testing on a physical phone, open the `mobile/.env` file and replace `localhost` in `EXPO_PUBLIC_API_URL` with your computer's local network IP address (e.g. `http://192.168.1.100:5000`). Make sure both your computer and phone are on the same Wi-Fi network.

---

## 🧪 Testing the APIs (Manual Verification)

You can check if the authentication endpoints and schemas work as expected using `curl` or Postman:

### 1. Register a Driver Profile
```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Jane Doe",
  "email": "jane@bus.com",
  "password": "securepassword",
  "role": "DRIVER",
  "driverLicense": "DL-987654321",
  "busNumber": "B-404"
}'
```

### 2. Register a Passenger Profile
```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "John Smith",
  "email": "john@passenger.com",
  "password": "passengerpass",
  "role": "PASSENGER"
}'
```

### 3. Log in and Obtain JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "jane@bus.com",
  "password": "securepassword"
}'
```
*(Copy the `token` string returned in the response)*

### 4. Create a Bus Route (Driver only)
```bash
curl -X POST http://localhost:5000/api/bus/schedules \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <PASTE_YOUR_JWT_TOKEN_HERE>" \
-d '{
  "busNumber": "B-404",
  "startPoint": "Downtown Station",
  "destination": "Airport Terminal 2",
  "daysOfOperation": ["Monday", "Wednesday", "Friday"],
  "departureTime": "08:30"
}'
```

### 5. Fetch Schedules (Public / Searchable)
```bash
curl -X GET "http://localhost:5000/api/bus/schedules?startPoint=Downtown&destination=Airport"
```
