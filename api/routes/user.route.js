const express = require("express");
const Controller = require("../controllers/user.controller");
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
  Controller.registerUser
);

userRouter.post(
  "/register/caretaker",
  validateInput(Validation.createCaretakerSchema, "BODY"),
  Controller.registerUser
);

userRouter.get(
  "/profiles",
  validateInput(Validation.getUsersSchema, "QUERY"),
  authentication,
  isAdmin,
  Controller.getUserProfiles
);
userRouter.get(
  "/profile/:id",
  authentication,
  isAdmin,
  Controller.getUserProfile
);
userRouter.patch(
  "/profile/:id",
  authentication,
  validateInput(Validation.updateUserSchema, "BODY"),
  Controller.updateProfile
);

userRouter.get("/profile/caretaker/:id", Controller.getCaretakerProfile);
userRouter.get("/profiles/caretaker", Controller.getCaretakerProfiles);

userRouter.post(
  "/verify/admin",
  authentication,
  isAdmin,
  Controller.userVerified
);
userRouter.post(
  "/verify/seller",
  authentication,
  isSeller,
  Controller.userVerified
);
userRouter.post(
  "/verify/buyer",
  authentication,
  isBuyer,
  Controller.userVerified
);
userRouter.post(
  "/verify/caretaker",
  authentication,
  isCaretaker,
  Controller.userVerified
);

userRouter.post("/login", Controller.loginUser);
userRouter.post("/logout", authentication, Controller.logoutUser);

userRouter.post(
  "/:id/review",
  authentication,
  isBuyer,
  validateInput(Validation.idSchema, "PARAMS"),
  validateInput(Validation.createReviewSchema, "BODY"),
  Controller.createReview
);
userRouter.patch(
  "/:id/review",
  authentication,
  isBuyer,
  validateInput(Validation.idSchema, "PARAMS"),
  validateInput(Validation.updateReviewSchema, "BODY"),
  Controller.updateReview
);
userRouter.delete(
  "/:id/review",
  authentication,
  isBuyer,
  validateInput(Validation.idSchema, "PARAMS"),
  Controller.deleteReview
);

module.exports = userRouter;
