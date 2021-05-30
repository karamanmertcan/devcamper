const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc     GET ALL BOOTCAMPS
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc     GET SINGLE BOOTCAMP
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc     POST CREATE BOOTCAMP
//@route    POST /api/v1/bootcamps
//@access   PRivate
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  //Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} has already published a bootcamp`,
        400,
      ),
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc     PUT UPDATE BOOTCAMP
//@route    PUT /api/v1/bootcamps/:id
//@access   PRivate
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401,
      ),
    );

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc     DELETE DELETE BOOTCAMP
//@route    DELETE /api/v1/bootcamps/:id
//@access   PRivate
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401,
      ),
    );

  await bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

//@desc     GET BOOTCAMPS WITHIN RADIUS
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   PRivate
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get latitude/long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calc Radius using radians
  //Divide distance by radius of Earth
  //Earth Radius  = 3,963 miles / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@desc     Upload Photo for bootcmap
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   PRivate
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401,
      ),
    );

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }
  const file = req.files.file;

  // MAke sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // CHECK FILESIZE
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400,
      ),
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });

  console.log(file.name);
});
