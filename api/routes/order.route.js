const express = require("express");
const router = express.Router();

const Controller = require("../controllers/order.controller");
const Validation = require("../validators/order.validator");
const { validateInput } = require("../middlewares/validateInput.middleware");
const { authentication } = require("../middlewares/authentication.middleware");
const Authorize = require("../middlewares/authorization.middleware");

// Route for creating a new order
router.post("/", authentication, Authorize.isBuyer, Controller.createOrder);

// Route for getting all orders
router.get(
  "/",
  validateInput(Validation.getAllSchema, "QUERY"),
  authentication,
  Authorize.isAdminOrBuyer,
  Controller.getOrders
);

// Route for getting a single order
router.get(
  "/:id",
  validateInput(Validation.getSingleSchema, "PARAMS"),
  authentication,
  Authorize.isAdminOrBuyer,
  Controller.getSingleOrder
);

// Route for updating an order
router.patch(
  "/:id",
  validateInput(Validation.getSingleSchema, "PARAMS"),
  authentication,
  validateInput(Validation.updateSchema, "BODY"),
  Authorize.isAdminOrBuyer,
  Controller.updateOrder
);

module.exports = router;
