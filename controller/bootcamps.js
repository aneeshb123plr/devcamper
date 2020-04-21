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
  let query;

  // copy queryParams
  let queryParms = { ...req.query };

  // initialize remove field array
  let removeField = ["select", "sort", "page", "limit"];

  // removing select, sort etc from queryparams
  removeField.forEach((param) => delete queryParms[param]);

  // Add lte,lt etc to queryString
  let queryStr = JSON.stringify(queryParms);
  queryStr = queryStr.replace(
    /\b(lt|lte|gt|gte|in)\b/gi,
    (match) => `$${match}`
  );

  console.log(queryStr);

  // Create query
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  // Add select
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Add sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // pagination

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const bootcamps = await query;

  let pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
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
