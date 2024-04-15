const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const { signToken } = require("../helpers/signToken");
const { generateSession } = require("../helpers/generateSession");

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

    if (isMatch) {
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
    } else {
      return res.status(404).json({
        message: "INVALID USER",
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

    const user = await UserModel.getUserById(id);

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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCaretakerProfiles,
  getCaretakerProfile,
  userVerified,
};
