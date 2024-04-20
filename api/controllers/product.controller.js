const deleteImages = require("../helpers/deleteImages");
const imagesCleanup = require("../helpers/imagesCleanup");
const Product = require("../schema/product.schema");
const User = require("../schema/user.schema");

const createProduct = async (req, res) => {
  try {
    const adminId = req.decodedToken._id;

    const adminFound = await User.findById({ _id: adminId });
    if (!adminFound) {
      return res.status(404).json({
        message: "Admin not Found",
      });
    }
    const newProduct = new Product({ ...req.body, adminId });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully.", data: newProduct });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const categories = req.query.categories || [];
    const name = req.query.name || "";
    const filter = { isDeleted: false };

    if (categories.length > 0) {
      filter.categories = {
        $in: categories.map((category) => new RegExp(category, "i")),
      };
    }

    if (name) {
      const keywords = name.split(" ").filter(Boolean);
      const searchPattern = keywords
        .map((keyword) => `(?=.*${keyword})`)
        .join("");
      const searchRegex = new RegExp(searchPattern, "ig");

      filter.name = searchRegex;
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter, { isDeleted: 0, adminId: 0 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = {
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
      currentProducts: products.length,
      limit,
    };

    res.status(200).json({
      pagination,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).populate("reviews.user", "firstName lastName email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const updateProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const imagesToDelete = existingProduct.src.filter(
      (image) => !req.body.src.includes(image)
    );

    deleteImages(imagesToDelete);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );

    deleteImages(deletedProduct.src);

    if (!deletedProduct.isDeleted) {
      return res.status(500).json({ message: "Sorry, not deleted." });
    }

    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { order, rating, comment } = req.body;
    const userId = req.decodedToken._id;

    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if the user has already reviewed this product
    const existingReview = product.reviews.find(
      (review) =>
        review.user.toString() === userId &&
        !review.isDeleted &&
        review.order.toString() === order
    );

    if (existingReview) {
      return res
        .status(422)
        .json({ message: "You have already reviewed this product." });
    }

    const review = {
      user: userId,
      order,
      rating,
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({
      message: "Review added successfully.",
      data: product.reviews[product.reviews.length - 1],
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
    const userId = req.decodedToken._id;

    const totalReviews = await Product.countDocuments({
      "reviews.user": userId,
    });
    const reviews = await Product.find(
      { "reviews.user": userId },
      { reviews: { $elemMatch: { user: userId, isDeleted: false } } }
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
    const { productId } = req.params;
    const { order, rating, comment } = req.body;
    const userId = req.decodedToken._id;

    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the review in the product's reviews array
    const reviewIndex = product.reviews.findIndex(
      (review) =>
        review.user.toString() === userId &&
        !review.isDeleted &&
        review.order.toString() === order
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Update the review
    product.reviews[reviewIndex].rating = rating;
    product.reviews[reviewIndex].comment = comment;

    await product.save();

    res.status(200).json({
      message: "Review updated successfully.",
      data: product.reviews[reviewIndex],
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
    const { productId } = req.params;
    const userId = req.decodedToken._id;

    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the review in the product's reviews array
    const reviewIndex = product.reviews.findIndex(
      (review) =>
        review.user.toString() === userId &&
        !review.isDeleted &&
        review.order.toString() === req.body.order
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    await product.save();

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
  createProduct,
  getAllProducts,
  updateProductById,
  deleteProductById,
  getProductById,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};
