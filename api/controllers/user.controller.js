const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const { signToken } = require("../helpers/signToken");
const { generateSession } = require("../helpers/generateSession");

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const userFound = await UserModel.getUserByEmail(email);

    if (userFound.status === "SUCCESS") {
      return res.status(409).json({
        message: "EMAIL ALREADY EXISTS",
      });
    }

    const session = generateSession();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      session,
    };

    console.log("New User:", newUser); // For debugging

    const savedUser = await UserModel.saveUser(newUser);

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

const userVerified = async (req, res) => {
  res.status(200).json({
    message: "SUCCESS",
    data: req.decodedToken,
  });
};

module.exports = { registerUser, loginUser, logoutUser, userVerified };
