require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRouter = require("./api/routes/product.route");
const userRouter = require("./api/routes/user.route");
const orderRouter = require("./api/routes/order.route");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/public", express.static("public"));

app.use("/api/v1/product", productRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/order", orderRouter);

app.use("/", (req, res) => {
  res.status(404).json({ message: "Route not found"});
});

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
