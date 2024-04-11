const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true, set: setTimeSecondsToZero },
    end: { type: Date, required: true, set: setTimeSecondsToZero },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      uppercase: true,
    },
    purpose: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Sets the seconds and milliseconds of a given date object to zero.
 * @param {String} date - The date object to modify.
 * @returns {Date} - The modified date object with seconds and milliseconds set to zero.
 */
function setTimeSecondsToZero(date) {
  const dateObject = new Date(date);
  dateObject.setSeconds(0);
  dateObject.setMilliseconds(0);
  return dateObject;
}

module.exports = mongoose.model("Appointment", appointmentSchema);
