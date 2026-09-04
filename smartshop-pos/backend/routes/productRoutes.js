const express = require("express");

const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../controllers/productController");

const router = express.Router();

// Add Product
router.post("/", addProduct);

// Get All Products
router.get("/", getProducts);

// Update Product
router.put("/:id", updateProduct);

// Delete Product
router.delete("/:id", deleteProduct);

// Update Stock
router.patch("/:id/stock", updateStock);

module.exports = router;