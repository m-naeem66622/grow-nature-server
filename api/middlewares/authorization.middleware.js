const isAdmin = (req, res, next) => {
  const { role } = req.decodedToken;

  if (role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

const isSeller = (req, res, next) => {
  const { role } = req.decodedToken;

  if (role === "SELLER") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

const isBuyer = (req, res, next) => {
  const { role } = req.decodedToken;

  if (role === "BUYER") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

module.exports = { isAdmin, isSeller, isBuyer };
