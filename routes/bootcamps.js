const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getBootCamps,
  createBootCamp,
  getBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootcampsByRadius,
  bootcampPhotoUpload,
} = require("../controller/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResult = require("../middleware/advancedResult");

const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);
router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);
router
  .route("/")
  .get(advancedResult(Bootcamp, "courses"), getBootCamps)
  .post(protect, authorize("admin", "publisher"), createBootCamp);
router
  .route("/:id")
  .put(protect, authorize("admin", "publisher"), updateBootCamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootCamp)
  .get(getBootCamp);

module.exports = router;
