const JWT = require("jsonwebtoken");
const User = require("../schema/user.schema");
const JWT_SECRET = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
  const bearerToken = req.headers.authorization;

  const token = bearerToken?.split(" ")[1];

  let decodedToken;
  let isSessionMatched;
  try {
    decodedToken = JWT.verify(token, JWT_SECRET);
    req.decodedToken = decodedToken;
    req.role = decodedToken.role;

    const userFound = await User.findById({ _id: decodedToken._id });
    isSessionMatched = userFound.session === decodedToken.session;
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      message: "INVALID USER",
    });
  }

  if (decodedToken && isSessionMatched) {
    next();
  } else {
    return res.status(403).json({
      message: "INVALID USER",
    });
  }
};

module.exports = {
  authentication,
};
