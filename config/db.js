const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection failed", error.message);
  }
};

module.exports = connectDB;
