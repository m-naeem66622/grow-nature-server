const PlantSwap = require("../schema/plantSwap.schema");
const { throwError } = require("../helpers/error");

// CreatePlantSwap
const createPlantSwap = async (
  plantSwap,
  projection = { user: {}, plants: {} }
) => {
  try {
    const newPlantSwap = await (
      await (
        await PlantSwap.create(plantSwap)
      ).populate("user", projection.user)
    ).populate("offeredPlants desiredPlants", projection.plants);

    console.log(newPlantSwap);

    if (newPlantSwap) {
      return {
        status: "SUCCESS",
        data: newPlantSwap,
      };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 422,
          identifier: "0x000E00",
          message: "Failed to create plantSwap",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E01");
  }
};

// CountPlantSwaps
const countPlantSwaps = async (filter) => {
  try {
    const count = await PlantSwap.countDocuments(filter);

    return {
      status: "SUCCESS",
      data: count,
    };
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E02");
  }
};

// GetPlantSwaps
const getPlantSwaps = async (
  filter,
  projection = { root: {}, user: {}, plants: {} },
  page,
  limit
) => {
  try {
    const plantSwaps = await PlantSwap.find(filter, projection.root, {
      sort: { start: 1 },
      skip: (page - 1) * limit,
      limit,
    })
      .populate("user swapPartner", projection.user)
      .populate("offeredPlants desiredPlants", projection.plants);

    return {
      status: "SUCCESS",
      data: plantSwaps,
    };
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E03");
  }
};

// GetPlantSwapById
const getPlantSwapById = async (
  filter,
  projection = { root: {}, user: {}, plants: {} }
) => {
  try {
    const plantSwap = await PlantSwap.findOne(filter, projection.root)
      .populate("user swapPartner", projection.user)
      .populate("offeredPlants desiredPlants", projection.plants);

    if (plantSwap) {
      return {
        status: "SUCCESS",
        data: plantSwap,
      };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000E04",
          message: "PlantSwap not found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E05");
  }
};

module.exports = {
  createPlantSwap,
  countPlantSwaps,
  getPlantSwaps,
  getPlantSwapById,
};
