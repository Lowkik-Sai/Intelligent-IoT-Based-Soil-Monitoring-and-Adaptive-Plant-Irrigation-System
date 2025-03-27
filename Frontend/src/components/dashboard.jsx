import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, CircularProgress, Grid, TextField, Button } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/getStats`;

const Dashboard = ({ data }) => {
    const [history, setHistory] = useState([]);
    const [startTimestamp, setStartTimestamp] = useState("");
    const [endTimestamp, setEndTimestamp] = useState("");

    useEffect(() => {

    }, [data]);
    
    const fetchHistoricalData = async () => {
        if (!startTimestamp || !endTimestamp) {
            console.error("Start and End timestamps are required!");
            return;
        }

        // Convert timestamps to SQL format (YYYY-MM-DD HH:MM:SS)
        const formatTimestamp = (isoString) => {
            const date = new Date(isoString);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ` +
                `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        };

        const formattedStart = formatTimestamp(startTimestamp);
        const formattedEnd = formatTimestamp(endTimestamp);

        try {
            const response = await axios.post(API_URL, { 
                startTimestamp: formattedStart, 
                endTimestamp: formattedEnd 
            });
            setHistory(Object.entries(response.data).map(([timestamp, values]) => ({ timestamp, ...values })));
        } catch (error) {
            console.error("Error fetching historical data:", error);
        }
    };


    if (!data) {
        return <CircularProgress style={{ margin: "50px auto", display: "block" }} />;
    }

    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                🌡️ IoT Sensor Dashboard
            </Typography>
            <Grid container spacing={3}>
                {Object.entries(data).map(([key, value]) => 
                    key !== "mode" && (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                            <Card style={{ backgroundColor: "#f5f5f5", textAlign: "center" }}>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        {key.replace("_", " ").toUpperCase()}
                                    </Typography>
                                    <Typography variant="h5">{key === "motorState" ? (value == true ? "ON" : "OFF") : value}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                )}
            </Grid>

            
            <div style={{ marginTop: 30 }}>
                <Typography variant="h6">📊 Fetch Historical Data</Typography>
                <TextField 
                    label="Start Timestamp" 
                    type="datetime-local" 
                    value={startTimestamp} 
                    onChange={(e) => setStartTimestamp(e.target.value)} 
                    style={{ marginRight: 10 }}
                />
                <TextField 
                    label="End Timestamp" 
                    type="datetime-local" 
                    value={endTimestamp} 
                    onChange={(e) => setEndTimestamp(e.target.value)} 
                />
                <Button variant="contained" color="primary" onClick={fetchHistoricalData} style={{ marginTop: 10 }}>
                    Fetch Data
                </Button>
            </div>
            
            <div style={{ marginTop: 30, height: "400px", width: "100%" }}> {/* Fixed graph size */}
                <Typography variant="h6">📊 Sensor Data Over Time</Typography>
                <Line
                    data={{
                        labels: history.map((d) => new Date(d.timestamp).toLocaleTimeString()),
                        datasets: [
                            {
                                label: "Temperature (°C)",
                                data: history.map((d) => d.temperature),
                                borderColor: "red",
                                fill: false,
                            },
                            {
                                label: "Humidity (%)",
                                data: history.map((d) => d.humidity),
                                borderColor: "blue",
                                fill: false,
                            },
                            {
                                label: "Heat Index",
                                data: history.map((d) => d.heat_index),
                                borderColor: "orange",
                                fill: false,
                            },
                            {
                                label: "Soil Moisture",
                                data: history.map((d) => d.soil_moisture),
                                borderColor: "green",
                                fill: false,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { type: "category", title: { display: true, text: "Time" } },
                            y: {
                                beginAtZero: false,
                                suggestedMin: Math.min(...history.map(d => Math.min(d.temperature, d.humidity, d.heat_index, d.soil_moisture))) - 5,
                                suggestedMax: Math.max(...history.map(d => Math.max(d.temperature, d.humidity, d.heat_index, d.soil_moisture))) + 5,
                                title: { display: true, text: "Values" },
                            },
                        },
                    }}
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
            </div>
        </div>
    );
};

export default Dashboard;