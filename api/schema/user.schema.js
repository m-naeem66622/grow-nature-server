const mongoose = require("mongoose");
const { ALLOWED_VALID_DAYS } = require("../../config/config");
const { Schema } = mongoose;

const addressSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, default: "" },
    zipCode: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: addressSchema },
    session: { type: String, default: null },
    role: {
      type: String,
      required: true,
      uppercase: true,
      default: "BUYER",
      enum: ["ADMIN", "BUYER", "SELLER", "CARETAKER"],
    },
    // Caretaker specific fields
    bio: { type: String },
    experience: { type: [String], default: null },
    speciality: { type: String, default: null },
    pricing: { type: [{ service: String, price: Number }], default: null },
    services: { type: [String], default: null },
    availability: {
      type: [{ day: String, start: Number, end: Number }],
      default: null,
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
