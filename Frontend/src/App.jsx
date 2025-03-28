"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import "./App.css"
import Dashboard from "./components/dashboard"
import MotorControl from "./components/motorControl"

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/getStats`;

// Create a scientific theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0d47a1",
    },
    secondary: {
      main: "#00695c",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
})

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentStats = async () => {
      try {
        const response = await axios.get(API_URL)
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchCurrentStats()
    const interval = setInterval(fetchCurrentStats, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "primary.main", color: "white" }}>
                <Typography variant="h4" component="h1">
                  IoT Environmental Monitoring System
                </Typography>
                <Typography variant="subtitle1">Real-time sensor data and control interface</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Dashboard data={data} />
            </Grid>
            <Grid item xs={12} md={4}>
              <MotorControl data={data} />
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App