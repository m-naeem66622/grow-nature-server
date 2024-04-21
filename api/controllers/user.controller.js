const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const UserSchema = require("../schema/user.schema");
const { signToken } = require("../helpers/signToken");
const { generateSession } = require("../helpers/generateSession");
const { throwError } = require("../helpers/error");

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await UserModel.getUserByEmail(email);

    if (userFound.status === "SUCCESS") {
      return res.status(409).json({
        message: "EMAIL ALREADY EXISTS",
      });
    }

    const session = generateSession();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await UserModel.saveUser({
      ...req.body,
      password: hashedPassword,
      session,
    });

    if (savedUser.status === "SUCCESS") {
      const signedToken = await signToken(savedUser.data);
      res.status(201).json({
        message: "SUCCESS",
        data: savedUser.data,
        token: signedToken,
      });
    } else {
      res.status(500).json({
        message: savedUser.status,
        error: savedUser.error,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const userFound = await UserModel.getUserByEmail(email);
    console.log(userFound);
    if (userFound.status !== "SUCCESS") {
      return res.status(401).json({
        message: "INVALID USER",
      });
    }

    const isMatch = await bcrypt.compare(password, userFound.data?.password);

    if (!isMatch) {
      return res.status(404).json({
        message: "INVALID USER",
      });
    }

    if (userFound.data.isBlocked) {
      return res.status(403).json({
        message: "USER BLOCKED",
      });
    }

    // Generate a new session string
    const sessionString = generateSession();

    // Update the session in the database
    const updatedUser = await UserModel.setSessionString(
      userFound.data._id,
      sessionString
    );

    if (updatedUser.status === "SUCCESS") {
      // Sign a JWT token with user's information
      const signedToken = await signToken(updatedUser.data);
      return res.status(200).json({
        message: "SUCCESS",
        data: updatedUser.data,
        token: signedToken,
      });
    } else {
      return res.status(500).json({
        message: "OOPS! Something went wrong",
        error: updatedUser.error,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.decodedToken._id;

    const logoutResult = await UserModel.setSessionString(userId, null);

    if (logoutResult.status === "SUCCESS") {
      return res.status(200).json({
        message: "Logout Successfully",
      });
    } else {
      return res.status(400).json({
        message: "FAILED",
        description: "User not logout",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const getUserProfiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 8, role = "" } = req.query;

    const filter = { isDeleted: false };
    const projection = { isDeleted: 0, password: 0, session: 0 };

    if (role) filter.role = role.toUpperCase();

    const totalUsers = await UserModel.countDocuments(filter);
    const users = await UserModel.getUsers(filter, projection, page, limit);

    if (users.status !== "SUCCESS") {
      throwError(
        users.status,
        users.error.statusCode,
        users.error.message,
        users.error.identifier
      );
    }

    return res.status(200).json({
      status: "SUCCESS",
      pagination: {
        totalPages: Math.ceil(totalUsers.data / limit),
        currentPage: page,
        totalUsers: totalUsers.data,
        currentUsers: users.data.length,
        limit,
      },
      data: users.data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const filter = { _id: id, isDeleted: false };
    const projection = { isDeleted: 0, password: 0, session: 0 };

    const user = await UserModel.getUserById(filter, projection);

    if (user.status !== "SUCCESS") {
      throwError(
        user.status,
        user.error.statusCode,
        user.error.message,
        user.error.identifier
      );
    }

    return res.status(200).json({
      status: "SUCCESS",
      data: user.data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getCaretakerProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const totalUsers = await UserModel.countDocuments({ role: "CARETAKER" });
    const users = await UserModel.getUsersByRole("CARETAKER", page, limit);

    if (users.status !== "SUCCESS") {
      return res.status(422).json({
        message: "OOPS! Something went wrong",
        error: users.error,
      });
    }

    const pagination = {
      totalPages: Math.ceil(totalUsers.data / limit),
      currentPage: page,
      totalUsers: totalUsers.data,
      currentUsers: users.data.length,
      limit,
    };

    return res.status(200).json({
      message: "SUCCESS",
      pagination,
      data: users.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
      error: error.message,
    });
  }
};

const getCaretakerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id, role: "CARETAKER" };
    const projection = { password: 0, session: 0, isDeleted: 0 };

    const user = await UserModel.getUserById(filter, projection);

    if (user.status !== "SUCCESS") {
      return res.status(404).json({
        message: "USER NOT FOUND",
      });
    }

    return res.status(200).json({
      message: "SUCCESS",
      data: user.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
      error: error.message,
    });
  }
};

const userVerified = async (req, res) => {
  res.status(200).json({
    message: "SUCCESS",
    data: req.decodedToken,
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const filter = { _id: id, isDeleted: false };
    const options = { fields: { isDeleted: 0, password: 0, session: 0 } };

    const updatedUser = await UserModel.updateUser(filter, req.body, options);

    if (updatedUser.status !== "SUCCESS") {
      throwError(
        updatedUser.status,
        updatedUser.error.statusCode,
        updatedUser.error.message,
        updatedUser.error.identifier
      );
    }

    return res.status(200).json({
      message: "SUCCESS",
      data: updatedUser.data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.params.id;
    const { rating, comment } = req.body;
    const reviewerId = req.decodedToken._id;

    const user = await UserSchema.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is a caretaker
    if (user.role !== "CARETAKER") {
      return res.status(422).json({
        message: "You can only review caretakers.",
      });
    }

    // Check if the user has already reviewed this user
    const existingReview = user.reviews.find(
      (review) => review.user.toString() === reviewerId && !review.isDeleted
    );

    if (existingReview) {
      return res
        .status(422)
        .json({ message: "You have already reviewed this user." });
    }

    const review = {
      user: reviewerId,
      rating,
      comment,
    };

    user.reviews.push(review);
    await (await user.save()).populate("reviews.user", "firstName lastName email");

    res.status(201).json({
      message: "Review added successfully.",
      data: user.reviews[user.reviews.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const reviewerId = req.decodedToken._id;

    const totalReviews = await UserSchema.countDocuments({
      "reviews.user": reviewerId,
    });
    const reviews = await UserSchema.find(
      { "reviews.user": reviewerId },
      { reviews: { $elemMatch: { user: reviewerId, isDeleted: false } } }
    )
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = {
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      totalReviews,
      currentReviews: reviews.length,
      limit,
    };

    res.status(200).json({
      pagination,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.params.id;
    const { rating, comment } = req.body;
    const reviewerId = req.decodedToken._id;

    const user = await UserSchema.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the review in the user's reviews array
    const reviewIndex = user.reviews.findIndex(
      (review) => review.user.toString() === reviewerId && !review.isDeleted
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Update the review
    user.reviews[reviewIndex].rating = rating;
    user.reviews[reviewIndex].comment = comment;

    await (await user.save()).populate("reviews.user", "firstName lastName email");

    res.status(200).json({
      message: "Review updated successfully.",
      data: user.reviews[reviewIndex],
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.params.id;
    const reviewerId = req.decodedToken._id;

    const user = await UserSchema.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the review in the user's reviews array
    const reviewIndex = user.reviews.findIndex(
      (review) => review.user.toString() === reviewerId && !review.isDeleted
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Remove the review
    user.reviews.splice(reviewIndex, 1);

    await user.save();

    res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfiles,
  getUserProfile,
  getCaretakerProfiles,
  getCaretakerProfile,
  userVerified,
  updateProfile,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};
