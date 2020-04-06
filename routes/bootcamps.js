const express = require("express");
const router = express.Router();
const {
  getBootCamps,
  createBootCamp,
  getBootCamp,
  updateBootCamp,
  deleteBootCamp,
} = require("../controller/bootcamps");

router.route("/").get(getBootCamps).post(createBootCamp);
router
  .route("/:id")
  .put(updateBootCamp)
  .delete(deleteBootCamp)
  .get(getBootCamp);

module.exports = router;
