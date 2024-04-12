const PlantSwap = require("../models/plantSwap.model");
const { throwError } = require("../helpers/error");
const {
  USER_COMMON_PROJECTION,
  PLANT_COMMON_PROJECTION,
} = require("../../config/config");

/**
 * @desc    Create a new plant swap
 * @route   POST /api/plant-swap
 * @access  Private/User
 */
const createPlantSwap = async (req, res, next) => {
  try {
    const userId = req.decodedToken._id;

    const projection = {
      user: USER_COMMON_PROJECTION,
      plants: PLANT_COMMON_PROJECTION,
    };

    req.body.user = userId;
    const newPlantSwap = await PlantSwap.createPlantSwap(req.body, projection);

    if (newPlantSwap.status === "FAILED") {
      throwError(
        newPlantSwap.status,
        newPlantSwap.error.statusCode,
        newPlantSwap.error.message,
        newPlantSwap.error.identifier
      );
    }

    // soft delete fields
    newPlantSwap.data.isDeleted = undefined;

    res.status(201).json({
      status: "SUCCESS",
      message: "Plant swap created successfully",
      data: newPlantSwap.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all plant swaps
 * @route   GET /api/plant-swap
 * @access  Public
 */
const getPlantSwaps = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { status: "PENDING", isDeleted: false };
    const projection = {
      root: { isDeleted: 0 },
      user: USER_COMMON_PROJECTION,
      plants: PLANT_COMMON_PROJECTION,
    };

    const totalPlantSwaps = await PlantSwap.countPlantSwaps(filter);
    const plantSwaps = await PlantSwap.getPlantSwaps(
      filter,
      projection,
      page,
      limit
    );

    if (plantSwaps.status === "FAILED") {
      throwError(
        plantSwaps.status,
        plantSwaps.error.statusCode,
        plantSwaps.error.message,
        plantSwaps.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      pagination: {
        totalPages: Math.ceil(totalPlantSwaps.data / limit),
        currentPage: page,
        totalPlantSwaps: totalPlantSwaps.data,
        currentPlantSwaps: plantSwaps.data.length,
        limit,
      },
      data: plantSwaps.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all plant swaps of a user
 * @route   GET /api/plant-swap/user/me
 * @access  Private/User
 */
const getUserPlantSwaps = async (req, res, next) => {
  try {
    const userId = req.decodedToken._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { user: userId, isDeleted: false };
    const projection = {
      root: { isDeleted: 0, user: 0 },
      user: USER_COMMON_PROJECTION,
      plants: PLANT_COMMON_PROJECTION,
    };

    const totalPlantSwaps = await PlantSwap.countPlantSwaps(filter);
    const plantSwaps = await PlantSwap.getPlantSwaps(
      filter,
      projection,
      page,
      limit
    );

    if (plantSwaps.status === "FAILED") {
      throwError(
        plantSwaps.status,
        plantSwaps.error.statusCode,
        plantSwaps.error.message,
        plantSwaps.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      pagination: {
        totalPages: Math.ceil(totalPlantSwaps.data / limit),
        currentPage: page,
        totalPlantSwaps: totalPlantSwaps.data,
        currentPlantSwaps: plantSwaps.data.length,
        limit,
      },
      data: plantSwaps.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all plant swaps of a swap partner
 * @route   GET /api/plant-swap/partner/me
 * @access  Private/User
 */
const getSwapPartnerPlantSwaps = async (req, res, next) => {
  try {
    const swapPartnerId = req.decodedToken._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { swapPartner: swapPartnerId, isDeleted: false };
    const projection = {
      root: { isDeleted: 0, swapPartner: 0 },
      user: USER_COMMON_PROJECTION,
      plants: PLANT_COMMON_PROJECTION,
    };

    const totalPlantSwaps = await PlantSwap.countPlantSwaps(filter);
    const plantSwaps = await PlantSwap.getPlantSwaps(
      filter,
      projection,
      page,
      limit
    );

    if (plantSwaps.status === "FAILED") {
      throwError(
        plantSwaps.status,
        plantSwaps.error.statusCode,
        plantSwaps.error.message,
        plantSwaps.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      data: plantSwaps.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get plant swap by id
 * @route   GET /api/plant-swap/:plantSwapId
 * @access  Public
 */
const getPlantSwapById = async (req, res, next) => {
  try {
    const { plantSwapId } = req.params;

    const filter = { _id: plantSwapId, isDeleted: false };
    const projection = {
      root: { isDeleted: 0 },
      user: USER_COMMON_PROJECTION,
      plants: PLANT_COMMON_PROJECTION,
    };

    const plantSwap = await PlantSwap.getPlantSwapById(filter, projection);

    if (plantSwap.status === "FAILED") {
      throwError(
        plantSwap.status,
        plantSwap.error.statusCode,
        plantSwap.error.message,
        plantSwap.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      data: plantSwap.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlantSwap,
  getPlantSwaps,
  getUserPlantSwaps,
  getSwapPartnerPlantSwaps,
  getPlantSwapById,
};
