const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bootcamps = require("./routes/bootcamps");
const logger = require("morgan");
const connectDB = require("./config/db");
require("colors");

// Setting configuration
dotenv.config({ path: "./config/config.env" });

// Mongo db connection

connectDB();

// Setting PORT
const PORT = process.env.PORT;

// Add middlewares

app.use(logger("combined"));
app.use(express.json());

// Mouting Routes
app.use("/api/v1/bootcamps", bootcamps);

// server listen
const server = app.listen(
  PORT,
  console.log(
    `The server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  )
);

// Handle unhandled promise rejections

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
