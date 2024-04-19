const Order = require("../schema/order.schema");
const { throwError } = require("../helpers/error");

// CreateOrder
const create = async (order) => {
  try {
    const newOrder = await Order.create(order);

    if (newOrder) {
      return { status: "SUCCESS", data: newOrder };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 422,
          identifier: "0x000E00",
          message: "Failed to create order",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E01");
  }
};

// CountOrders
const count = async (filter) => {
  try {
    const count = await Order.countDocuments(filter);

    return { status: "SUCCESS", data: count };
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E02");
  }
};

// GetOrders
const get = async (filter, projection, page = 1, limit, options) => {
  try {
    const orders = await Order.find(filter, projection, options)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("buyer", "-password -session -isBlocked -isDeleted")
      .populate("orderItems.product", "");

    if (orders?.length > 0) {
      return { status: "SUCCESS", data: orders };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000E03",
          message: "No orders found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E04");
  }
};

// GetOrderById
const getSingle = async (filter, projection) => {
  try {
    const order = await Order.findOne(filter, projection)
      .populate("buyer", "-password -session -isBlocked -isDeleted")
      .populate("orderItems.product");

    if (order) {
      return { status: "SUCCESS", data: order };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000E05",
          message: "Order not found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E06");
  }
};

// UpdateOrder
const update = async (filter, update, options = {}) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, ...options }
    );

    if (updatedOrder) {
      return { status: "SUCCESS", data: updatedOrder };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000E07",
          message: "Order not found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000E08");
  }
};

module.exports = { create, count, get, getSingle, update };
