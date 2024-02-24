const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  src: { type: [String], required: true },
  name: { type: String, required: true },
  categories: { type: [String], required: true, default: ["Plant"] },
  shortDesc: { type: String, required: true },
  price: {
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "PKR" },
    },
    required: true,
  },
  potSize: {
    type: {
      size: { type: Number, min: 1, default: null },
      unit: { type: String, default: null },
    },
    default: null,
  },
  potType: { type: String, default: null },
  shortDesc: { type: String, required: true },
  longDesc: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
