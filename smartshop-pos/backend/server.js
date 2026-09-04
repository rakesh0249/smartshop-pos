const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");

const app = express();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Test Route
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "SmartShop POS Backend is running 🚀",
  });
});

// =========================
// Product Routes
// =========================
app.use("/api/products", productRoutes);

// =========================
// Sale Routes
// =========================
app.use("/api/sales", saleRoutes);

// =========================
// Server Port
// =========================
const PORT = process.env.PORT || 5000;

// =========================
// MongoDB Connection
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );
  });