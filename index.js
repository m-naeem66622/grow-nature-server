require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRouter = require("./api/routes/product.route");
const userRouter = require("./api/routes/user.route");
const orderRouter = require("./api/routes/order.route");
const appointmentRouter = require("./api/routes/appointment.route");
const plantSwapRouter = require("./api/routes/plantSwap.route");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// No need to serve static files here, as Vercel will handle this
// app.use("/api/v1/public", express.static("public"));

app.use("/api/v1/product", productRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/plant-swap", plantSwapRouter);

const {
  notFound,
  errorHandler,
} = require("./api/middlewares/error.middleware");

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB();

// No need to listen to the server here, as Vercel will handle this
// app.listen(PORT, (req, res) => {
//   console.log(`Server is running on port ${PORT}`);
// });

// export the app for vercel serverless functions 
module.exports = app;