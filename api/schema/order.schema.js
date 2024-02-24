const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.ObjectId, ref: "User" },
    orderItems: [
      {
        quantity: { type: Number, min: 1, required: true },
        price: {
          amount: { type: Number, required: true },
          currency: { type: String, required: true },
        },
        product: { type: mongoose.ObjectId, ref: "Product", required: true },
      },
    ],
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    status: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED"],
      uppercase: true,
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
