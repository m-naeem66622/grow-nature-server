const express = require("express");

const { authentication } = require("../middlewares/authentication.middleware");
const { isSeller } = require("../middlewares/authorization.middleware");
const {
  createOrder,
  adminOrder,
  getOrdersByBuyer,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/order.controller");
const orderRouter = express.Router();

orderRouter.get("/", authentication, isSeller, adminOrder);

orderRouter.get("/user-order", authentication, getOrdersByBuyer);

orderRouter.put("/:orderId", authentication, isSeller, updateOrderStatus);

orderRouter.get("/:orderId", authentication, getOrderById);

orderRouter.post("/create", authentication, createOrder);
module.exports = orderRouter;
