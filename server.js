const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
// Setting configuration
dotenv.config({ path: "./config/config.env" });

const app = express();

// Bringing routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const user = require("./routes/user");
const reviews = require("./routes/reviews");

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
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

// Rate limit

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
});

app.use(limiter);

// Static file

app.use(express.static(path.join(__dirname, "public")));

// Mouting Routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/reviews", reviews);
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
