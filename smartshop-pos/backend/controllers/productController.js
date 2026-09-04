const Product = require("../models/Product");

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      barcode,
    } = req.body;

    const existingProduct = await Product.findOne({
      barcode,
    });

    if (existingProduct) {
      return res.status(400).json({
        message:
          "Product with this barcode already exists",
      });
    }

    const product = await Product.create({
      name,
      category,
      price,
      stock,
      barcode,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      price,
      stock,
      barcode,
    } = req.body;

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          name,
          category,
          price,
          stock,
          barcode,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Update Stock
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body;

    // Validate stock type
    if (!["add", "remove"].includes(type)) {
      return res.status(400).json({
        message: "Invalid stock type",
      });
    }

    // Validate quantity
    if (
      !quantity ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be greater than 0",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const qty = Number(quantity);

    // Remove stock
    if (
      type === "remove" &&
      product.stock < qty
    ) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Add stock
    if (type === "add") {
      product.stock += qty;
    }

    // Remove stock
    if (type === "remove") {
      product.stock -= qty;
    }

    await product.save();

    res.status(200).json({
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update Stock Error:",
      error
    );

    res.status(500).json({
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// Export
module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
};