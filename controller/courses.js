const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/* 
@desc Get Course
@route GET /api/v1/courses
@route GET /api/v1/bootcamps/:bootcampId/courses
@access Public
*/

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

/* 
@desc Get Course
@route GET /api/v1/courses/:id
@access Public
*/
exports.getCourse = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  const course = await Course.findById(_id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return next(
      new ErrorResponse(`The course with is ${_id} is not present`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

/* 
@desc  Add Course
@route POST /api/v1/bootcamps/:bootcampId/courses
@access Private
*/

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The bootcamp is not present with id ${req.params.bootcampId}`,
        404
      )
    );
  }
  // Check the eligibility
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user ${req.user.id} has no permission to add a course to the bootcamp ${bootcamp._id}`,
        400
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

/* 
@desc  Update Course
@route PUT /api/v1/courses/:id
@access Private
*/

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`The course is not present with ${req.params.id}`, 404)
    );
  }

  // Check the eligibility
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user ${req.user.id} has no permission to update a course to the bootcamp ${course.bootcamp}`,
        400
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
});

/* 
@desc  Delete Course
@route DELETE /api/v1/courses/:id
@access Private
*/

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`The course is not present with ${req.params.id}`, 404)
    );
  }

  // Check the eligibility
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user ${req.user.id} has no permission to delete a course to the bootcamp ${course.bootcamp}`,
        400
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
