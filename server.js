const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bootcamps = require("./routes/bootcamps");
const logger = require("morgan");

// Setting configuration
dotenv.config({ path: "./config/config.env" });

// Setting PORT
const PORT = process.env.PORT;

// Add middlewares

app.use(logger("combined"));

// Mouting Routes
app.use("/api/v1/bootcamps", bootcamps);

// server listen
app.listen(
  PORT,
  console.log(
    `The server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  )
);
