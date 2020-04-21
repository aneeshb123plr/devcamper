const express = require("express");
const router = express.Router();
const {
  getBootCamps,
  createBootCamp,
  getBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootcampsByRadius,
  bootcampPhotoUpload,
} = require("../controller/bootcamps");

const courseRouter = require("./courses");

router.use("/:bootcampId/courses", courseRouter);
router.route("/:id/photo").put(bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);
router.route("/").get(getBootCamps).post(createBootCamp);
router
  .route("/:id")
  .put(updateBootCamp)
  .delete(deleteBootCamp)
  .get(getBootCamp);

module.exports = router;
