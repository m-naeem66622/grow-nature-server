const Order = require("../schema/order.schema");

const createOrder = async (req, res) => {
  try {
    const buyer = req.decodedToken._id;

    const newOrder = new Order({ ...req.body, buyer });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Order placed successfully",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminOrder = async (req, res) => {
  try {
    const orders = await Order.find().populate([{ path: "products" }]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders related to seller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrdersByBuyer = async (req, res) => {
  try {
    const buyerId = req.decodedToken._id;

    const orders = await Order.find({ buyer: buyerId }).populate([
      { path: "products" },
    ]);

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders placed by buyer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order ID and status are required fields" });
    }

    const validStatuses = ["shipped", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const order = await Order.findById(orderId).populate({ path: "products" });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error while fetching order by ID:", error);
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  adminOrder,
  getOrdersByBuyer,
  updateOrderStatus,
  getOrderById,
};
