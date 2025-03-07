const { dbRef } = require("../database/firebase");
const { update } = require("firebase/database");

// const express = require("express");
// const router = express.Router();

// let motorState = false; // Stores the motor state (false = OFF, true = ON)

// router.get("/", (req, res) => {
//     res.json({ state: motorState });
// });

// router.post("/", (req, res) => {
//     const { state } = req.body;
//     if (typeof state !== "boolean") {
//         return res.status(400).json({ error: "Invalid motor state" });
//     }
    
//     motorState = state;
//     console.log(`Motor is now ${motorState ? "ON" : "OFF"}`);

//     // Send HTTP request to ESP32 to update motor state
//     fetch("http://ESP32_IP/motor", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ state: motorState })
//     }).catch(err => console.error("Error sending motor state to ESP32:", err));

//     res.json({ state: motorState });
// });

const updateMode = async (req, res) => {
    try {
        const { mode, motorState } = req.body;
        
        if (mode === undefined && motorState === undefined) {
            return res.status(400).json({ error: "No valid data received" });
        }

        const updates = {};
        if (mode !== undefined) updates["/mode"] = mode;
        if (motorState !== undefined) updates["/motorState"] = motorState; 

        await update(dbRef, updates);
        res.status(200).json({ message: "Updated successfully", updates });

    } catch (e) {
        console.error("Error updating Firebase:", e);
        res.status(503).json({ error: "Internal server error!", details: e.message });
    }
};

module.exports = updateMode;