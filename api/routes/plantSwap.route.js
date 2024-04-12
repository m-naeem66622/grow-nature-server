const express = require("express");
const router = express.Router();

const Controller = require("../controllers/plantSwap.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const Validation = require("../validators/plantSwap.validator");
const { authentication } = require("../middlewares/authentication.middleware");
const Authorize = require("../middlewares/authorization.middleware");

// Route for creating plant swap
router.post(
  "/",
  validateInput(Validation.createSchema, "BODY"),
  authentication,
  Authorize.isBuyer,
  Controller.createPlantSwap
);

// Route for getting all plant swaps
router.get(
  "/",
  validateInput(Validation.getAllSchema, "QUERY"),
  Controller.getPlantSwaps
);

// Route for getting all plant swaps by user
router.get(
  "/user/me",
  authentication,
  Authorize.isBuyer,
  Controller.getUserPlantSwaps
);

// Route for getting all plant swaps by swap partner
router.get(
  "/partner/me",
  authentication,
  Authorize.isBuyer,
  Controller.getSwapPartnerPlantSwaps
);

// Route for getting plant swap by id
router.get(
  "/:plantSwapId",
  validateInput(Validation.idSchema, "PARAM"),
  Controller.getPlantSwapById
);

module.exports = router;
