import Bootcamp from '../models/Bootcamp.js';

//@desc     GET ALL BOOTCAMPS
//@route    GET /api/v1/bootcamps
//@access   Public
export const getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

//@desc     GET SINGLE BOOTCAMP
//@route    GET /api/v1/bootcamps/:id
//@access   Public
export const getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `get single bootcamp ${req.params.id}` });
};

//@desc     POST CREATE BOOTCAMP
//@route    POST /api/v1/bootcamps
//@access   PRivate
export const createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
    });
  }
};

//@desc     PUT UPDATE BOOTCAMP
//@route    PUT /api/v1/bootcamps/:id
//@access   PRivate
export const updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

//@desc     DELETE DELETE BOOTCAMP
//@route    DELETE /api/v1/bootcamps/:id
//@access   PRivate
export const deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
