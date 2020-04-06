/* 
@desc Get all bootcamps
@route GET /api/v1/bootcamps
@access Public
*/
exports.getBootCamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Get all bootcamps` });
  next();
};

/* 
@desc Get single bootcamp
@route GET /api/v1/bootcamps/:id
@access Public
*/
exports.getBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show the bootcamp ${req.params.id}` });
  next();
};

/* 
@desc create bootcamp
@route POST /api/v1/bootcamps
@access Private
*/
exports.createBootCamp = (req, res, next) => {
  res.status(201).json({ success: true, msg: `Created the bootcamp` });
  next();
};

/* 
@desc update bootcamp
@route PUT /api/v1/bootcamp/:id
@access Private
*/
exports.updateBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `updated the bootcamp ${req.params.id}` });
  next();
};

/* 
@desc delete bootcamp
@route DELETE /api/v1/bootcamp/:id
@access Private
*/
exports.deleteBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Deleted the bootcamp ${req.params.id}` });
  next();
};
