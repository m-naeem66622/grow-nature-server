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

const getUserById = async (_id) => {
  try {
    const user = await User.findOne({ _id, isDeleted: false }).lean().exec();
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
}

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

module.exports = {
  saveUser,
  countDocuments,
  getUsersByRole,
  getUserByEmail,
  getUserById,
  setSessionString,
};
