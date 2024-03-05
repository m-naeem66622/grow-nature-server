const express = require("express");
const {
  productSchema,
  productIdValidate,
  getProductsSchema,
} = require("../validators/product.validator");
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductById,
  deleteProductById,
  createPhoto,
} = require("../controllers/product.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const { authentication } = require("../middlewares/authentication.middleware");
const {
  isSeller,
  isAdmin,
} = require("../middlewares/authorization.middleware");
const uploadProductImage = require("../middlewares/image.middleware");
const productRouter = express.Router();

productRouter.get(
  "/",
  validateInput(getProductsSchema, "QUERY"),
  getAllProducts
);

productRouter.get("/:productId", getProductById);

productRouter.put(
  "/:productId",
  authentication,
  isAdmin,
  uploadProductImage,
  validateInput(productIdValidate, "PARAMS"),
  validateInput(productSchema, "BODY"),
  updateProductById
);

productRouter.delete(
  "/:productId",
  authentication,
  isAdmin,
  validateInput(productIdValidate, "PARAMS"),
  deleteProductById
);

productRouter.post(
  "/",
  authentication,
  isAdmin,
  uploadProductImage,
  validateInput(productSchema, "BODY"),
  createProduct
);

productRouter.post("/photo", createPhoto);
module.exports = productRouter;
