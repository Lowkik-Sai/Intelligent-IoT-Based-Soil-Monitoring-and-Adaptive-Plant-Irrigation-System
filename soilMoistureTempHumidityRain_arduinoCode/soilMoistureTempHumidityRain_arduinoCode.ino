#include "DHT.h"
#include "rain.h"
#include <WiFiMulti.h>
#include <InfluxDbClient.h>

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
#define ANALOG_PIN 35  // A0 -> GPIO34 (Analog Output)
#define DIGITAL_PIN 27 // D0 -> GPIO27 (Digital Output)

// WiFi Credentials
WiFiMulti wifiMulti;
#define WIFI_SSID "Lowkik Sai"
#define WIFI_PASSWORD "244466666"

// InfluxDB Configuration
#define INFLUXDB_URL "https://us-east-1-1.aws.cloud2.influxdata.com"
#define INFLUXDB_TOKEN "u1ERWrCOzI6yQe10LFBsFSvKiFtRFDpRg0vtuzF17FuZZCufBPRDsfkHAiwVJ0JJgPp68zkIRAlBQJF-GDC-Kw=="
#define INFLUXDB_ORG "Amrita Vishwa Vidyapeetham"
#define INFLUXDB_BUCKET "iot-soilplantmonitor-project"

// Global InfluxDB client (initialized after WiFi connection)
InfluxDBClient *client;

void setup() {
    Serial.begin(115200);
    while (!Serial);

    Serial.println(F("🌡️ DHT22 Sensor Initialized"));
    dht.begin();

    Serial.println(F("🌧️ Rain Sensor Initialized"));
    RS.begin(5.000, 1023);
    pinMode(DIGIOUT, INPUT_PULLUP);

    Serial.println(F("🌱 Soil Moisture Sensor Initialized"));
    pinMode(DIGITAL_PIN, INPUT);

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
            return;
        }
    }
    Serial.print("✅ Connected to InfluxDB: ");
    Serial.println(client->getServerUrl());

    // Get dedicated client for buckets management
    BucketsClient buckets = client->getBucketsClient();
    
    // Verify bucket does not exist, or delete it
    if(buckets.checkBucketExists(INFLUXDB_BUCKET)) {
      Serial.println("Bucket " INFLUXDB_BUCKET " found." );
      // get reference
      Bucket b = buckets.findBucket(INFLUXDB_BUCKET);
    }else{  
      uint32_t monthSec = 30*24*3600;
      Bucket b = buckets.createBucket(INFLUXDB_BUCKET, monthSec);
      if(!b) {
        // some error occurred
        Serial.print("Bucket creating error: ");
        Serial.println(buckets.getLastErrorMessage());
        return;
      }
      Serial.print("Created bucket: ");
      Serial.println(b.toString());
    }

}

void loop() {
    delay(5000);  // Collect data every 5 seconds

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

    Serial.printf("🌡️ Temp: %.2f°C | 💧 Humidity: %.2f%% | 🔥 Heat Index: %.2f°C\n", t, h, hic);
    Serial.printf("⏳ %lu ms | 🌧️ Rain Level: %d | Analog: %.3f ", millis(), rainLevel, analogValue);
    if (analogValue > 2.5) Serial.println("| 🚨 RAINING!");
    else Serial.println("| ✅ No Rain");

    Serial.printf("🌱 Soil Moisture: %d | %s\n", analog_value, digital_state == LOW ? "💦 Wet (Good Moisture) ✅" : "🔥 Dry (Needs Water) ❌");
    Serial.println("--------------------------------------");

    // Store data into InfluxDB
    if (client->validateConnection()) {
        Point sensorData("iot-sensors");
        sensorData.addTag("device", "ESP32");
        sensorData.addField("temperature", t);
        sensorData.addField("humidity", h);
        sensorData.addField("heat_index", hic);
        sensorData.addField("rain_level", rainLevel);
        sensorData.addField("soil_moisture", analog_value);
        sensorData.addField("rain_detected", analogValue > 2.5 ? 1 : 0);

        if (!client->writePoint(sensorData)) {
            Serial.print("❌ InfluxDB Write Failed: ");
            Serial.println(client->getLastErrorMessage());
        } else {
            Serial.println("✅ Data Written to InfluxDB!");
        }
    } else {
        Serial.println("⚠️ Skipping InfluxDB write, connection lost.");
    }
}
