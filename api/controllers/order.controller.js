const axios = require("axios");
const Order = require("../models/order.model");
const { throwError } = require("../helpers/error");
const OrderSchema = require("../schema/order.schema");
const generateMongoId = require("../helpers/generateMongoId");

const createOrder = async (req, res) => {
  try {
    const buyer = req.decodedToken._id;
    const totalPrice = req.body.totalPrice;

    // Get Access Token from PayFast
    const orderId = generateMongoId();
    let payfastAcessToken = null;
    try {
      const response = await axios.post(
        `https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken?MERCHANT_ID=${process.env.PAYFAST_MERCHANT_ID}&SECURED_KEY=${process.env.PAYFAST_SECURED_KEY}&BASKET_ID=${orderId}&TXNAMT=${totalPrice}`
      );

      if (response.data.ACCESS_TOKEN) {
        payfastAcessToken = response.data.ACCESS_TOKEN;
      }
    } catch (error) {
      console.error("Error getting PayFast Access Token:", error);
      return res
        .status(422)
        .json({ message: "Error getting PayFast Access Token" });
    }

    const newOrder = new OrderSchema({ ...req.body, _id: orderId, buyer });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Order placed successfully",
      data: savedOrder,
      formParams: {
        MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
        MERCHANT_NAME: process.env.PAYFAST_MERCHANT_NAME,
        TOKEN: payfastAcessToken,
        PROCCODE: "00",
        TXNAMT: totalPrice,
        CURRENCY_CODE: "PKR",
        BASKET_ID: orderId,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private User/Admin
 */
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};
    if (req.decodedToken.role === "BUYER") filter.buyer = req.decodedToken._id;
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

    let projection = { isDeleted: 0 };

    const totalOrders = await Order.count(filter);
    console.log("Filter", filter, "Total Orders", totalOrders.data);
    const orders = await Order.get(filter, projection, page, limit);

    if (orders.status === "FAILED") {
      throwError(
        orders.status,
        orders.error.statusCode,
        orders.error.message,
        orders.error.identifier
      );
    }

    const pagination = {
      totalPages: Math.ceil(totalOrders.data / limit),
      currentPage: page,
      totalOrders: totalOrders.data,
      currentOrders: orders.data.length,
      limit,
    };

    res.json({
      status: "SUCCESS",
      pagination,
      data: orders.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private User/Admin
 */
const getSingleOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const filter = { _id: orderId };
    if (req.decodedToken.role === "BUYER") filter.buyer = req.decodedToken._id;

    let projection = { isDeleted: 0 };

    const order = await Order.getSingle(filter, projection);

    if (order.status === "FAILED") {
      throwError(
        order.status,
        order.error.statusCode,
        order.error.message,
        order.error.identifier
      );
    }

    res.json({
      status: "SUCCESS",
      data: order.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private User/Admin
 */
const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const filter = { _id: orderId };
    if (req.decodedToken.role === "BUYER") filter.buyer = req.decodedToken._id;

    const order = await Order.update(filter, req.body);

    if (order.status === "FAILED") {
      throwError(
        order.status,
        order.error.statusCode,
        order.error.message,
        order.error.identifier
      );
    }

    res.json({
      status: "SUCCESS",
      message: "Order status updated successfully",
      data: order.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getSingleOrder, updateOrder };
