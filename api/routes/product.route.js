const express = require("express");
const Validation = require("../validators/product.validator");
const Controller = require("../controllers/product.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const { authentication } = require("../middlewares/authentication.middleware");
const { isBuyer, isAdmin } = require("../middlewares/authorization.middleware");
const uploadProductImage = require("../middlewares/image.middleware");
const productRouter = express.Router();

productRouter.get(
  "/",
  validateInput(Validation.getProductsSchema, "QUERY"),
  Controller.getAllProducts
);

productRouter.get("/:productId", Controller.getProductById);

productRouter.put(
  "/:productId",
  authentication,
  isAdmin,
  uploadProductImage,
  validateInput(Validation.productIdValidate, "PARAMS"),
  validateInput(Validation.productSchema, "BODY"),
  Controller.updateProductById
);

productRouter.delete(
  "/:productId",
  authentication,
  isAdmin,
  validateInput(Validation.productIdValidate, "PARAMS"),
  Controller.deleteProductById
);

productRouter.post(
  "/",
  authentication,
  isAdmin,
  uploadProductImage,
  validateInput(Validation.productSchema, "BODY"),
  Controller.createProduct
);

productRouter.post(
  "/:productId/review",
  authentication,
  isBuyer,
  validateInput(Validation.productIdValidate, "PARAMS"),
  validateInput(Validation.reviewSchema, "BODY"),
  Controller.createReview
);

productRouter.patch(
  "/:productId/review",
  authentication,
  isBuyer,
  validateInput(Validation.productIdValidate, "PARAMS"),
  validateInput(Validation.updateReviewSchema, "BODY"),
  Controller.updateReview
);

productRouter.delete(
  "/:productId/review",
  authentication,
  isBuyer,
  validateInput(Validation.productIdValidate, "PARAMS"),
  Controller.deleteReview
);

module.exports = productRouter;
