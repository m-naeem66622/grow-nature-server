const mongoose = require("mongoose");
const { ALLOWED_VALID_DAYS } = require("../../config/config");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
