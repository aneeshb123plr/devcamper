const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/* 
@desc Get Reviews
@route GET /api/v1/reviews
@route GET /api/v1/bootcamps/:bootcampId/reviews
@access Public
*/

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

/* 
@desc Get Review
@route GET /api/v1/reviews/:id
@access Public
*/

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(new ErrorResponse("The review is not found", 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

/* 
@desc Create review
@route POST /api/v1/bootcamp/:bootcampId/reviews
@access Private
*/

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse("The bootcamp is not found", 404));
  }
  const review = await Review.create(req.body);
  res.status(200).json({
    success: true,
    data: review,
  });
});

/* 
@desc Update review
@route PUT /api/v1/reviews/:id
@access Private
*/

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review has found in this id ${review.id}`, 401)
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("The user is unauthorized to edit review", 401)
    );
  }
  //await review.updateOne(req.body);
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

/* 
@desc Delete review
@route DELETE /api/v1/reviews/:id
@access Private
*/

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review has found in this id ${review.id}`, 401)
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("The user is unauthorized to edit review", 401)
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
