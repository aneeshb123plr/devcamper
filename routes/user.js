const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controller/user");

const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const advancedResult = require("../middleware/advancedResult");

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResult(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
