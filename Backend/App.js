require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mainRouter = require("./mainRouter");

app.use("/api", mainRouter);

//Test Router
app.use("/test", (req, res)=>{
    res.send("Hello World");
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});