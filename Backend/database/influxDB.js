require('dotenv').config();

const influx = require('@influxdata/influxdb3-client')
const token = process.env.INFLUXDB_TOKEN

const client = new influx.InfluxDBClient({
    host: 'https://us-east-1-1.aws.cloud2.influxdata.com', 
    token: token
})

async function influxDB(points) {
    try{
        //Influx DB Bucket Name
        let database = `iot-soilplantmonitor-project`
    
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            await client.write(point, database)
        }
    }catch(err){
        console.log("[ERROR]: Error in writing in InfluxDB.")
        throw err;
    }
}


// const query = `SELECT *
// FROM "ms"
// WHERE
// time >= now() - interval '6 hours'
// AND
// ("github.com" IS NOT NULL)`

// const data = await client.query(query, 'iot-soilplantmonitor-project')

// console.log(`${"ants".padEnd(5)}${"bees".padEnd(5)}${"location".padEnd(10)}${"time".padEnd(15)}`);
// for await (const row of data) {
//     let ants = row.ants || '';
//     let bees = row.bees || '';
//     let time = new Date(row.time);
//     console.log(`${ants.toString().padEnd(5)}${bees.toString().padEnd(5)}${row.location.padEnd(10)}${time.toString().padEnd(15)}`);
// }

module.exports = {influxDB, client}