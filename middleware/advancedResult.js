const advancedResult = (model, populate) => async (req, res, next) => {
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
  query = model.find(JSON.parse(queryStr));

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

  if (populate) {
    query = query.populate(populate);
  }

  // pagination

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const results = await query;

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

  res.advancedResult = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResult;
