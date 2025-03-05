const { client } = require("../database/influxDB");
const { dbRef } = require("../database/firebase");
const { get } = require("firebase/database");

const getStats = {
    influxDB: async(req, res) => {
        try {
            const { startTimestamp, endTimeStamp } = req.body;
    
            endTimeStamp = (endTimeStamp == null) ? new Date() : endTimeStamp;
    
            const query = 
            `
            SELECT *
            FROM "iot-sensors"
            WHERE
            time >= timestamp '${startTimestamp}' AND time <= timestamp '${endTimeStamp}'
            AND
            ("heat_index" IS NOT NULL OR "humidity" IS NOT NULL OR "rain_detected" IS NOT NULL OR "rain_level" IS NOT NULL OR "soil_moisture" IS NOT NULL OR "temperature" IS NOT NULL)
            `;
            
            const data = client.query(query, 'iot-soilplantmonitor-project');
            const response = {};
            for await (const row of data) {
                let heat_index = row.heat_index || '';
                let humidity = row.humidity || '';
                let rain_detected = row.rain_detected || '';
                let rain_level = row.rain_level || '';
                let soil_moisture = row.soil_moisture || '';
                let temperature = row.temperature || '';
                let time = new Date(row.time);
                response[time] = {
                    heat_index: heat_index,
                    humidity: humidity,
                    rain_detected: rain_detected,
                    rain_level: rain_level,
                    soil_moisture: soil_moisture,
                    temperature: temperature
                };
            }
            res.status(200).json(response);
        }catch(e){
            console.log(e);
            res.status(503).json("Internal server error! ",e);
        }
    },

    firebase: async(req, res) => {
        try {
            get(dbRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        res.status(200).json(snapshot.val());
                    } else {
                        res.status(404).json("No data available");
                    }
                })
        } catch(err){
            console.log(err);
            res.status(503).json("Error fetching data: ",err);
        }
    }
}

module.exports = getStats;