"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Button,
  Typography,
  CardContent,
  Switch,
  Box,
  Paper,
  Divider,
  Stack,
  FormControlLabel,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material"
import {
  PowerSettingsNew,
  Settings,
  ToggleOn,
  ToggleOff,
  AutoFixHigh,
  PrecisionManufacturing,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"

const MODE_API = `${import.meta.env.VITE_BASE_URL}/api/mode`;

// Styled components
const ControlCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  height: "100%",
}))

const StatusIndicator = styled(Box)(({ theme, active }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: active ? theme.palette.success.main : theme.palette.error.main,
  marginRight: theme.spacing(1),
  boxShadow: active ? `0 0 8px ${theme.palette.success.main}` : "none",
}))

const ModeSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: "rgba(0, 105, 92, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: theme.palette.secondary.main,
  },
}))

const MotorControl = ({ data }) => {
  const [motorState, setMotorState] = useState(false)
  const [mode, setMode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setMode(data?.mode)
    if (data?.mode === "MANUAL") {
      setMotorState(data?.motorState)
    }
  }, [data])

  const toggleMotor = async () => {
    if (mode !== "MANUAL") return

    setLoading(true)
    setError(null)

    try {
      const newState = !motorState
      await axios.post(MODE_API, { mode: mode, motorState: newState })
      setMotorState(newState)
      setLoading(false)
    } catch (error) {
      console.error("Error toggling motor:", error)
      setError("Failed to toggle motor. Please try again.")
      setLoading(false)
    }
  }

  const switchMode = async () => {
    setLoading(true)
    setError(null)

    const newMode = mode === "AUTO" ? "MANUAL" : "AUTO"
    try {
      await axios.post(MODE_API, { mode: newMode })
      setMode(newMode)
      setLoading(false)
    } catch (error) {
      console.error("Error switching mode:", error)
      setError("Failed to switch mode. Please try again.")
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

  return (
    <ControlCard elevation={0} sx={{ height: "100%" }}>
      <Box sx={{ p: 2, bgcolor: "secondary.main", color: "white" }}>
        <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PrecisionManufacturing /> Motor Control Panel
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Settings fontSize="small" /> Operation Mode
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Chip
                icon={mode === "AUTO" ? <AutoFixHigh /> : <PowerSettingsNew />}
                label={mode === "AUTO" ? "AUTOMATIC" : "MANUAL"}
                color={mode === "AUTO" ? "info" : "secondary"}
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {mode === "AUTO"
                  ? "System automatically controls the motor based on sensor readings"
                  : "You have full control over the motor operation"}
              </Typography>
            </Box>

            <FormControlLabel
              control={<ModeSwitch checked={mode === "MANUAL"} onChange={switchMode} disabled={loading} />}
              label={mode === "MANUAL" ? "Manual" : "Auto"}
              labelPlacement="start"
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PowerSettingsNew fontSize="small" /> Motor Status
          </Typography>
          <Divider sx={{ my: 2 }} />

          {mode === "MANUAL" ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StatusIndicator active={motorState} />
                  <Typography variant="h5">{motorState ? "RUNNING" : "STOPPED"}</Typography>
                </Box>
                {motorState ? (
                  <ToggleOn color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <ToggleOff color="error" sx={{ fontSize: 40 }} />
                )}
              </Box>

              <Button
                variant="contained"
                color={motorState ? "error" : "success"}
                onClick={toggleMotor}
                disabled={loading}
                fullWidth
                size="large"
                startIcon={<PowerSettingsNew />}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : motorState ? (
                  "TURN OFF MOTOR"
                ) : (
                  "TURN ON MOTOR"
                )}
              </Button>
            </>
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "background.default",
                borderRadius: 2,
              }}
            >
              <AutoFixHigh sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Automatic Mode Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The system is automatically controlling the motor based on sensor readings. Switch to Manual mode to
                control the motor directly.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </ControlCard>
  )
}

export default MotorControl