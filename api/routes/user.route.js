const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  userVerified,
  getCaretakerProfiles,
  getCaretakerProfile,
} = require("../controllers/user.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const Validation = require("../validators/user.validator");
const { authentication } = require("../middlewares/authentication.middleware");
const {
  isSeller,
  isBuyer,
  isAdmin,
  isCaretaker,
} = require("../middlewares/authorization.middleware");

const userRouter = express.Router();

userRouter.post(
  "/register",
  validateInput(Validation.createUserSchema, "BODY"),
  registerUser
);

userRouter.post(
  "/register/caretaker",
  validateInput(Validation.createCaretakerSchema, "BODY"),
  registerUser
);

userRouter.get("/profile/caretaker/:id", getCaretakerProfile);
userRouter.get("/profiles/caretaker", getCaretakerProfiles);

userRouter.post("/verify/admin", authentication, isAdmin, userVerified);
userRouter.post("/verify/seller", authentication, isSeller, userVerified);
userRouter.post("/verify/buyer", authentication, isBuyer, userVerified);
userRouter.post("/verify/caretaker", authentication, isCaretaker, userVerified);

userRouter.post("/login", loginUser);
userRouter.post("/logout", authentication, logoutUser);

module.exports = userRouter;
