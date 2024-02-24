const deleteImages = require("../helpers/deleteImages");
const imagesCleanup = require("../helpers/imagesCleanup");
const Product = require("../schema/product.schema");
const User = require("../schema/user.schema");

const createProduct = async (req, res) => {
  try {
    const adminId = req.decodedToken._id;

    // console.log("req.files:", req.files);
    // const src = req.files.map((file) => file.path);
    // console.log("src:", src);

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
    console.error("Error while creating product:", error);
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const createPhoto = async (req, res) => {
  try {
    let { image } = req.body;
    image = req.fullFilePath;
    res
      .status(201)
      .json({ message: "Product created successfully.", data: image });
  } catch (error) {
    console.error("Error while creating product:", error);
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

    console.log("Page:", req.query.page, "Limit:", req.query.limit);

    const totalProducts = await Product.countDocuments({ isDeleted: false });

    const products = await Product.find({ isDeleted: false })
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
    console.error("Error while fetching products:", error);
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

    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error while fetching product by ID:", error);
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const updateProductById = async (req, res) => {
  try {
    const adminId = req.decodedToken._id;
    const { productId } = req.params;

    console.log("Admin ID:", adminId);
    console.log("Product ID:", productId);
    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
      adminId,
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
    console.error("Error while updating product:", error);
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong.",
      error: error.message,
    });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const adminId = req.decodedToken._id;
    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
      adminId,
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
    console.error("Error while deleting product:", error);
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
  createPhoto,
};
