"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  TextField,
  Button,
  Paper,
  Box,
  Divider,
  Chip,
  Stack,
  Alert,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { ThermostatAuto, Opacity, LocalFireDepartment, Grass, CalendarMonth, ShowChart } from "@mui/icons-material"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/getStats`;

// Styled components
const SensorCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}))

const SensorValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 500,
  marginTop: theme.spacing(1),
}))

const SensorIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(1),
}))

// Custom chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        boxWidth: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      titleColor: "#000",
      bodyColor: "#000",
      borderColor: "#ddd",
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Time",
        padding: 10,
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      title: {
        display: true,
        text: "Values",
        padding: 10,
      },
    },
  },
}

const Dashboard = ({ data }) => {
  const [history, setHistory] = useState([])
  const [startTimestamp, setStartTimestamp] = useState("")
  const [endTimestamp, setEndTimestamp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // This useEffect is kept empty as per original code
  }, [data])

  const fetchHistoricalData = async () => {
    if (!startTimestamp || !endTimestamp) {
      setError("Start and End timestamps are required!")
      return
    }

    setLoading(true)
    setError(null)

    // Convert timestamps to SQL format (YYYY-MM-DD HH:MM:SS)
    const formatTimestamp = (isoString) => {
      const date = new Date(isoString)
      return (
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ` +
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`
      )
    }

    const formattedStart = formatTimestamp(startTimestamp)
    const formattedEnd = formatTimestamp(endTimestamp)

    try {
      const response = await axios.post(API_URL, {
        startTimestamp: formattedStart,
        endTimestamp: formattedEnd,
      })
      setHistory(Object.entries(response.data).map(([timestamp, values]) => ({ timestamp, ...values })))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching historical data:", error)
      setError("Failed to fetch historical data. Please try again.")
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Sensor data configuration
  const sensorConfig = [
    {
      key: "temperature",
      label: "Temperature",
      unit: "°C",
      icon: ThermostatAuto,
      color: "#e53935",
      bgColor: "rgba(229, 57, 53, 0.1)",
    },
    {
      key: "humidity",
      label: "Humidity",
      unit: "%",
      icon: Opacity,
      color: "#1e88e5",
      bgColor: "rgba(30, 136, 229, 0.1)",
    },
    {
      key: "heat_index",
      label: "Heat Index",
      unit: "",
      icon: LocalFireDepartment,
      color: "#ff9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
    },
    {
      key: "soil_moisture",
      label: "Soil Moisture",
      unit: "",
      icon: Grass,
      color: "#43a047",
      bgColor: "rgba(67, 160, 71, 0.1)",
    },
  ]

  // Chart data
  const chartData = {
    labels: history.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: sensorConfig.map((sensor) => ({
      label: sensor.label,
      data: history.map((d) => d[sensor.key]),
      borderColor: sensor.color,
      backgroundColor: sensor.color,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.2,
      fill: false,
    })),
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShowChart color="primary" /> Sensor Readings
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          {sensorConfig.map((sensor) => (
            <Grid item xs={12} sm={6} md={3} key={sensor.key}>
              <SensorCard>
                <CardContent sx={{ textAlign: "center", bgcolor: sensor.bgColor, height: "100%" }}>
                  <SensorIcon sx={{ bgcolor: sensor.color, mx: "auto" }}>
                    <sensor.icon />
                  </SensorIcon>
                  <Typography variant="h6" color="text.secondary">
                    {sensor.label}
                  </Typography>
                  <SensorValue>
                    {sensor.key === "motorState" ? (data[sensor.key] ? "ON" : "OFF") : data[sensor.key]}
                    {sensor.unit}
                  </SensorValue>
                </CardContent>
              </SensorCard>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonth color="primary" /> Historical Data
          </Typography>
          <Chip
            label={history.length > 0 ? `${history.length} data points` : "No data"}
            color={history.length > 0 ? "primary" : "default"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Start Time"
            type="datetime-local"
            value={startTimestamp}
            onChange={(e) => setStartTimestamp(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
          <TextField
            label="End Time"
            type="datetime-local"
            value={endTimestamp}
            onChange={(e) => setEndTimestamp(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
          <Button variant="contained" onClick={fetchHistoricalData} disabled={loading} sx={{ minWidth: "120px" }}>
            {loading ? <CircularProgress size={24} /> : "Fetch Data"}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 400, position: "relative" }}>
          {history.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                border: "1px dashed #ccc",
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">Select a time range and fetch data to view the chart</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default Dashboard