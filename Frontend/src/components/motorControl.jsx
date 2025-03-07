import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Typography, Card, CardContent, Switch } from "@mui/material";

const MODE_API = "http://localhost:8080/api/mode";

const MotorControl = ({ data }) => {
    const [motorState, setMotorState] = useState(false);
    const [mode, setMode] = useState("");

    useEffect(() => {
        console.log(data);
        setMode(data?.mode);
        if(data?.mode === "MANUAL") {
            setMotorState(data?.motorState);
        }
    }, [data]);

    const toggleMotor = async () => {
        if (mode !== "MANUAL") return;

        try {
            const newState = !motorState;
            await axios.post(MODE_API, { mode: mode, motorState: newState });
            setMotorState(newState);
        } catch (error) {
            console.error("Error toggling motor:", error);
        }
    };

    const switchMode = async () => {
        const newMode = mode === "AUTO" ? "MANUAL" : "AUTO";
        try {
            await axios.post(MODE_API, { mode: newMode });
            setMode(newMode);
        } catch (error) {
            console.error("Error switching mode:", error);
        }
    };

    return (
        <Card style={{ textAlign: "center", padding: 20 }}>
            <CardContent>
                <Typography variant="h5">🚜 Motor Control</Typography>
                <Typography variant="h6" style={{ margin: "10px 0" }}>
                    Mode: <strong>{mode}</strong>
                </Typography>
                <Switch
                    checked={mode === "MANUAL"}
                    onChange={switchMode}
                    color="primary"
                />
                <Typography variant="body1">Switch Mode</Typography>
                {mode === "MANUAL" ? (
                    <>
                        <Typography variant="h6" style={{ marginBottom: 10 }}>
                            Motor is {motorState ? "ON ✅" : "OFF ❌"}
                        </Typography>
                        <Button 
                            variant="contained" 
                            color={motorState ? "error" : "success"} 
                            onClick={toggleMotor}
                        >
                            {motorState ? "Turn OFF" : "Turn ON"}
                        </Button>
                    </>
                ) : (
                    <Typography variant="h6" color="textSecondary">
                        ⚠️ Motor control isn't available.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default MotorControl;
