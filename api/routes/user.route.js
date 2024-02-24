const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  userVerified,
} = require("../controllers/user.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const userValidationSchema = require("../validators/user.validator");
const { authentication } = require("../middlewares/authentication.middleware");
const {
  isSeller,
  isBuyer,
  isAdmin,
} = require("../middlewares/authorization.middleware");

const userRouter = express.Router();

userRouter.post(
  "/register",
  validateInput(userValidationSchema, "BODY"),
  registerUser
);

userRouter.post("/verify/admin", authentication, isAdmin, userVerified);
userRouter.post("/verify/seller", authentication, isSeller, userVerified);
userRouter.post("/verify/buyer", authentication, isBuyer, userVerified);

userRouter.post("/login", loginUser);
userRouter.post("/logout", authentication, logoutUser);

module.exports = userRouter;
