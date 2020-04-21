const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");
// Setting configuration
dotenv.config({ path: "./config/config.env" });

const app = express();
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const logger = require("morgan");
const connectDB = require("./config/db");
require("colors");
const errorHandler = require("./middleware/error");

// Mongo db connection

connectDB();

// Setting PORT
const PORT = process.env.PORT;

// Add middlewares

app.use(logger("combined"));
app.use(express.json());
app.use(fileupload());

// Static file

app.use(express.static(path.join(__dirname, "public")));

// Mouting Routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

// Error handler
app.use(errorHandler);

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
