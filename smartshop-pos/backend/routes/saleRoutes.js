const express = require("express");

const {
  createSale,
  getSales,
} = require("../controllers/saleController");

const router = express.Router();

// Checkout
router.post("/", createSale);

// Get Sales
router.get("/", getSales);

module.exports = router;