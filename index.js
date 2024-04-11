require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRouter = require("./api/routes/product.route");
const userRouter = require("./api/routes/user.route");
const orderRouter = require("./api/routes/order.route");
const apppointmentRouter = require("./api/routes/appointment.route");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/public", express.static("public"));

app.use("/api/v1/product", productRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/appointment", apppointmentRouter);
const {
  notFound,
  errorHandler,
} = require("./api/middlewares/error.middleware");

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
