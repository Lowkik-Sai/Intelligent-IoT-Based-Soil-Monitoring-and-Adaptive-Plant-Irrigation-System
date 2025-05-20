# 🌱 Intelligent IoT-Based Soil Monitoring and Adaptive Plant Irrigation System

An end-to-end IoT solution for efficient agriculture that monitors soil conditions and automates irrigation using real-time sensor data, cloud communication, and user-configurable control.

---

## 📌 Overview

Modern agriculture requires efficient water usage and minimal labor. This project offers:

- **Automated irrigation** based on real-time soil moisture and weather data.
- **Manual override** and control via an interactive web dashboard.
- **Data analytics** for environmental trends and optimal watering.
- **Wireless communication** using MQTT and Firebase for real-time syncing.

---

## 📁 Project Resources

- 🎥 **Video Demonstration**: [Watch the project](https://drive.google.com/drive/folders/1zn2MqHk0YZY0-eivaoOnHM1WMrlox3BN?usp=drive_link)
- 📄 **Detailed Project Document**: Available in this repository under `IoT_Project_Document.docx`

---

## 🧱 System Architecture

### 📡 Hardware

- **ESP32** microcontroller (Wi-Fi capable)
- **Soil Moisture Sensor** – detects soil dryness
- **DHT22** – temperature and humidity
- **Rain Sensor** – prevents irrigation during rain
- **Relay Module** – controls water pump
- **Motor** – regulates water flow

### 🧠 Software Stack

| Layer             | Technology           |
|------------------|----------------------|
| Firmware          | Arduino IDE (ESP32) |
| Backend           | Node.js + Express.js |
| Frontend          | React.js + Vite      |
| Cloud Database    | Firebase (Realtime DB) |
| Future Analytics  | InfluxDB             |
| Communication     | MQTT over TLS        |


---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)
- Arduino IDE with ESP32 board support
- Firebase project setup (Realtime Database enabled)
- MQTT broker (optional, Firebase MQTT bridge or local Mosquitto)

---

## 🛠️ Backend Setup

### 1. Navigate to backend directory:
```bash
cd backend
```
2. Create .env file with environment variables:
```
PORT = [your_backend_port]
INFLUXDB_TOKEN = [your_influxdb_token]
```
3. Install dependencies and run the server:
```
npm install
npm start
```

## 🎨 Frontend Setup
1. Navigate to frontend directory:
```
cd frontend
```
2. Create .env file:
```
VITE_BASE_URL = "https://your-deployed-backend-url"
```
3. Install dependencies and run the development server:
```
npm install
npm run dev
```

---

## 🔁 ESP32 Firmware Setup
- Open Arduino IDE.

- Select ESP32 board and proper COM port.

- Update Wi-Fi credentials, Firebase credentials, and topic names inside the firmware.

- Upload the code to your ESP32.

- Connect the sensors and actuators as per circuit diagram.


## 🔄 Communication Flow
- Sensors send data to ESP32.

- ESP32 publishes data over MQTT and pushes it to Firebase.

- Backend fetches Firebase data and serves frontend APIs.

- Users monitor readings and control irrigation via GUI.

- Commands (auto/manual mode, irrigation ON/OFF) are sent back to ESP32.

## 📊 GUI Features
- Real-time sensor data dashboard (soil moisture, temp, humidity, rainfall)

- Manual irrigation control

- Automatic irrigation mode with rules

- Charts and historical trend visualizations

## 🌍 Deployment
Frontend hosted at: 
```sh
https://soilmonitoring-plantirrigation.vercel.app
```

Backend hosted at: 
```sh
https://intelligent-iot-based-soil-monitoring.onrender.com
```


