#include "DHT.h"
#include "rain.h"
#include <WiFiMulti.h>
#include <InfluxDbClient.h>
#include <Firebase.h>
#include <ArduinoJson.h>

// Temperature and Humidity DHT sensor
#define DHTPIN 4  
#define DHTTYPE DHT22  
DHT dht(DHTPIN, DHTTYPE);

// Rain sensor
#define ANALOGPIN 34
#define POWERPIN -1
#define DIGIOUT 16

RAIN RS(ANALOGPIN, POWERPIN);

// Soil Moisture
#define ANALOG_PIN 35  // A0 -> GPIO35 (Analog Output)
#define DIGITAL_PIN 27 // D0 -> GPIO27 (Digital Output)

// Motor/Relay pin
#define MOTOR_PIN 26 

// WiFi Credentials
WiFiMulti wifiMulti;
#define WIFI_SSID "Lowkik Sai"
#define WIFI_PASSWORD "244466666"

//Firebase URL
#define REFERENCE_URL "https://soil-monitor-plant-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/"
Firebase fb(REFERENCE_URL);

// InfluxDB Configuration
#define INFLUXDB_URL "https://us-east-1-1.aws.cloud2.influxdata.com"
#define INFLUXDB_TOKEN "u1ERWrCOzI6yQe10LFBsFSvKiFtRFDpRg0vtuzF17FuZZCufBPRDsfkHAiwVJ0JJgPp68zkIRAlBQJF-GDC-Kw=="
#define INFLUXDB_ORG "Amrita Vishwa Vidyapeetham"
#define INFLUXDB_BUCKET "iot-soilplantmonitor-project"

// Global InfluxDB client (initialized after WiFi connection)
InfluxDBClient *client;

// Default mode and motor state
String currentMode = "AUTO";
bool currentMotorState = false;

void setup() {
    Serial.begin(115200);
    delay(1000); // Give serial monitor time to connect
    
    Serial.println(F("🌡️ DHT22 Sensor Initialized"));
    dht.begin();

    Serial.println(F("🌧️ Rain Sensor Initialized"));
    RS.begin(5.000, 1023);
    pinMode(DIGIOUT, INPUT_PULLUP);

    Serial.println(F("🌱 Soil Moisture Sensor Initialized"));
    pinMode(DIGITAL_PIN, INPUT);

    Serial.println(F("Motor Connected"));
    pinMode(MOTOR_PIN, OUTPUT);
    digitalWrite(MOTOR_PIN, LOW); // Start with motor OFF for safety

    // Connect to WiFi
    Serial.print("Connecting to WiFi");
    WiFi.mode(WIFI_STA);
    wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);
    
    int wifi_attempts = 0;
    while (wifiMulti.run() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
        wifi_attempts++;
        if (wifi_attempts > 15) { // Timeout after 15 seconds
            Serial.println("\n❌ WiFi Connection Failed!");
            return;
        }
    }
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // Initialize InfluxDB client
    client = new InfluxDBClient(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN);

    // Validate InfluxDB connection
    int influx_attempts = 0;
    while (!client->validateConnection()) {
        Serial.print("❌ InfluxDB connection failed: ");
        Serial.println(client->getLastErrorMessage());
        delay(2000);
        influx_attempts++;
        if (influx_attempts > 5) { // Retry up to 5 times
            Serial.println("🚨 Could not connect to InfluxDB. Skipping data logging.");
            break;  // Continue even if InfluxDB fails
        }
    }
    
    if (influx_attempts <= 5) {
        Serial.print("✅ Connected to InfluxDB: ");
        Serial.println(client->getServerUrl());

        // Get dedicated client for buckets management
        BucketsClient buckets = client->getBucketsClient();
        
        // Verify bucket exists or create it
        if(buckets.checkBucketExists(INFLUXDB_BUCKET)) {
            Serial.println("Bucket " INFLUXDB_BUCKET " found.");
            // get reference
            Bucket b = buckets.findBucket(INFLUXDB_BUCKET);
        } else {  
            uint32_t monthSec = 30*24*3600;
            Bucket b = buckets.createBucket(INFLUXDB_BUCKET, monthSec);
            if(!b) {
                // some error occurred
                Serial.print("Bucket creating error: ");
                Serial.println(buckets.getLastErrorMessage());
            } else {
                Serial.print("Created bucket: ");
                Serial.println(b.toString());
            }
        }
    }

    // Initialize with default values in Firebase if needed
    String initData = fb.getJson("stats");
    if (initData == "NULL" || initData.length() < 5) {
        JsonDocument defaultData;
        defaultData["mode"] = "AUTO";
        defaultData["motorState"] = false;
        
        String initSerializedData;
        serializeJson(defaultData, initSerializedData);
        fb.setJson("stats", initSerializedData);
        Serial.println("✅ Initialized default values in Firebase!");
    }

    Serial.println("Setup complete!");
}

unsigned long lastSensorUpdate = 0;
unsigned long lastMotorCheck = 0;
const unsigned long sensorInterval = 5000; 
const unsigned long motorCheckInterval = 10;

void loop() {
    unsigned long currentMillis = millis();

    // ======== 1. MOTOR CONTROL - Real-time Check (Every 200ms) ========
    if (currentMillis - lastMotorCheck >= motorCheckInterval) {
        lastMotorCheck = currentMillis;

        Serial.println("Checking Firebase for Motor Updates...");
        String getData = fb.getJson("stats");

        if (getData != "NULL" && getData.length() > 5) {
            JsonDocument getJSONData;
            DeserializationError error = deserializeJson(getJSONData, getData);
            
            if (!error) {
                if (getJSONData.containsKey("mode")) {
                    currentMode = getJSONData["mode"].as<String>();
                }
                if (getJSONData.containsKey("motorState")) {
                    currentMotorState = getJSONData["motorState"].as<bool>();
                }

                Serial.print("🔥 Firebase Updated - Mode: ");
                Serial.print(currentMode);
                Serial.print(", Motor: ");
                Serial.println(currentMotorState ? "ON" : "OFF");

                if (currentMode == "MANUAL") {
                    digitalWrite(MOTOR_PIN, currentMotorState ? HIGH : LOW);
                    Serial.print("🖐 Manual Mode - Motor ");
                    Serial.println(currentMotorState ? "ON" : "OFF");
                }
            }
        }
    }

    // ======== 2. SENSOR READING - Every 5 Seconds ========
    if (currentMillis - lastSensorUpdate >= sensorInterval) {
        lastSensorUpdate = currentMillis;

        Serial.println("--------------------------------------");
        float h = dht.readHumidity();
        float t = dht.readTemperature();
        float f = dht.readTemperature(true);

        if (isnan(h) || isnan(t) || isnan(f)) {
            Serial.println(F("⚠️ Failed to read from DHT sensor!"));
            return;
        }

        float hif = dht.computeHeatIndex(f, h);
        float hic = dht.computeHeatIndex(t, h, false);

        float analogValue = RS.read();
        int rainLevel = RS.getLevel();
        int analog_value = analogRead(ANALOG_PIN);
        int digital_state = digitalRead(DIGITAL_PIN);

        int rainDetected = (analogValue < 7);

        Serial.printf("🌡️ Temp: %.2f°C | 💧 Humidity: %.2f%% | 🔥 Heat Index: %.2f°C\n", t, h, hic);
        Serial.printf("⏳ %lu ms | 🌧️ Rain Level: %d | Analog: %.3f ", millis(), rainLevel, analogValue);

        if (rainDetected) {
            Serial.println("| 🚨 RAINING!");
        } else {
            Serial.println("| ✅ No Rain");
        }

        Serial.printf("🌱 Soil Moisture: %d | %s\n", 
            analog_value, 
            digital_state == LOW ? "💦 Wet (Good Moisture) ✅" : "🔥 Dry (Needs Water) ❌");

        // Update Firebase
        JsonDocument data;
        data["temperature"] = t;
        data["humidity"] = h;
        data["heat_index"] = hic;
        data["rain_level"] = rainLevel;
        data["soil_moisture"] = analog_value;
        data["rain_detected"] = rainDetected;
        data["mode"] = currentMode;
        data["motorState"] = currentMotorState;

        String serializeData;
        serializeJson(data, serializeData);
        Serial.print("Sending to Firebase: ");
        Serial.println(serializeData);

        if (fb.setJson("stats", serializeData)) {
            Serial.println("✅ Data Written to FirebaseDB!");
        } else {
            Serial.println("❌ Failed to write to FirebaseDB!");
        }

        // ======== 3. AUTO MODE MOTOR CONTROL ========
        if (currentMode == "AUTO") {
            bool shouldMotorBeOn = !rainDetected && (digital_state == HIGH);
            digitalWrite(MOTOR_PIN, shouldMotorBeOn ? HIGH : LOW);
            
            if (currentMotorState != shouldMotorBeOn) {
                currentMotorState = shouldMotorBeOn;
                data["motorState"] = currentMotorState;

                serializeJson(data, serializeData);
                fb.setJson("stats", serializeData);

                Serial.print("📡 Updated motor state in Firebase: ");
                Serial.println(currentMotorState ? "ON" : "OFF");
            }
        } else if (currentMode == "MANUAL") {
            digitalWrite(MOTOR_PIN, currentMotorState ? HIGH : LOW);
            Serial.print("🖐 Manual Mode - Motor ");
            Serial.println(currentMotorState ? "ON" : "OFF");
        } else {
            Serial.println("⚠️ Unknown mode - Motor OFF");
            digitalWrite(MOTOR_PIN, LOW);
        }
        
        // ======== 4. INFLUXDB STORAGE ========
        if (client && client->validateConnection()) {
            Point sensorData("iot-sensors");
            sensorData.addTag("device", "ESP32");
            sensorData.addField("temperature", t);
            sensorData.addField("humidity", h);
            sensorData.addField("heat_index", hic);
            sensorData.addField("rain_level", rainLevel);
            sensorData.addField("soil_moisture", analog_value);
            sensorData.addField("rain_detected", rainDetected ? 1 : 0);
            sensorData.addField("motor_state", currentMotorState ? 1 : 0);
            sensorData.addField("mode", currentMode);

            if (!client->writePoint(sensorData)) {
                Serial.print("❌ InfluxDB Write Failed: ");
                Serial.println(client->getLastErrorMessage());
            } else {
                Serial.println("✅ Data Written to InfluxDB!");
            }
        } else {
            Serial.println("⚠️ Skipping InfluxDB write, connection lost or never established.");
        }
    }
}
