const { throwError } = require("../helpers/error");
const User = require("../schema/user.schema");

const saveUser = async (userData) => {
  try {
    const user = new User({
      ...userData,
    });

    const savedUser = await user.save();

    if (savedUser) {
      return {
        status: "SUCCESS",
        data: savedUser,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const countDocuments = async (filter) => {
  try {
    const count = await User.countDocuments(filter);
    return { staus: "SUCCESS", data: count };
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const getUsers = async (filter, projection, page, limit) => {
  try {
    const users = await User.find(filter, projection)
      .skip((page - 1) * limit)
      .limit(limit);

    if (users && users.length) {
      return {
        status: "SUCCESS",
        data: users,
      };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000A03",
          message: "No users found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000A04");
  }
};

const getUser = async (filter, projection) => {
  try {
    const user = await User.findOne(filter, projection);

    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000A05",
          message: "User not found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000A06");
  }
};

const getUsersByRole = async (role, page, limit) => {
  try {
    const users = await User.find({ role })
      .skip((page - 1) * limit)
      .limit(limit);

    if (users) {
      return {
        status: "SUCCESS",
        data: users,
      };
    }
  } catch {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email }).lean().exec();
    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const getUserById = async (filter, projection) => {
  try {
    const user = await User.findOne(filter, projection)
      .populate("reviews.user", "firstName lastName email")
      .lean()
      .exec();

    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const setSessionString = async (_id, string = null) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { session: string },
      { new: true }
    );

    if (!updatedUser) {
      return {
        status: "FAILED",
        error: "User not found",
      };
    }

    return {
      status: "SUCCESS",
      data: updatedUser,
    };
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const updateUser = async (filter, update, options) => {
  try {
    const user = await User.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });

    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
        error: {
          statusCode: 404,
          identifier: "0x000D0E",
          message: "User not found",
        },
      };
    }
  } catch (error) {
    throwError("FAILED", 422, error.message, "0x000D0F");
  }
};

module.exports = {
  saveUser,
  countDocuments,
  getUsers,
  getUser,
  getUsersByRole,
  getUserByEmail,
  getUserById,
  setSessionString,
  updateUser,
};
