const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
/* 
@desc Get all bootcamps
@route GET /api/v1/bootcamps
@access Public
*/
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

/* 
@desc Get single bootcamp
@route GET /api/v1/bootcamps/:id
@access Public
*/
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The Bootcammp is not found with the id ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

/* 
@desc create bootcamp
@route POST /api/v1/bootcamps
@access Private
*/
exports.createBootCamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Get published bootcamp

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // Check the eligibility to add
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user ${req.user.id} has no permission to add bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

/* 
@desc update bootcamp
@route PUT /api/v1/bootcamp/:id
@access Private
*/
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The Bootcammp is not found with the id ${req.params.id}`,
        404
      )
    );
  }

  // Check the permission
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ${req.user.id} has no permission to update the bootcamp`,
        400
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

/* 
@desc delete bootcamp
@route DELETE /api/v1/bootcamp/:id
@access Private
*/
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The Bootcammp is not found with the id ${req.params.id}`,
        404
      )
    );
  }

  // Check the permission
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ${req.user.id} has no permission to update the bootcamp`,
        400
      )
    );
  }

  await bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc get bootcamp by zipcode and distance
// @route GET /api/v1/bootcamp/radius/:zipcode/:distance
// @access Private
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
  const zipcode = req.params.zipcode;
  const distance = req.params.distance;

  // Get latitude and longitude
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius
  // Divide by distance
  // Earth radius is  3963 miles or 6371km

  const radius = distance / 3963;

  // Find bootcamps

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

/* 
@desc upload bootcamp
@route PUT /api/v1/bootcamp/:id/photo
@access Private
*/
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The Bootcamp is not found with the id ${req.params.id}`,
        404
      )
    );
  }

  // Check the permission
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ${req.user.id} has no permission to update the bootcamp`,
        400
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload the file`, 400));
  }
  const file = req.files.file;

  // Checking the the file is image or not
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image type`, 400));
  }

  // Image size checking
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image with size less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Customise file name
  file.name = `bootcamp_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Error during uploading the file`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
