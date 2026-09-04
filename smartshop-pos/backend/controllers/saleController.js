const Sale = require("../models/Sale");
const Product = require("../models/Product");

const createSale = async (req, res) => {
  const session = await Product.startSession();

  try {
    const {
      items,
      discount = 0,
      paymentMethod,
    } = req.body;

    // -----------------------------
    // Basic Validation
    // -----------------------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!["Cash", "UPI", "Card"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // -----------------------------
    // Validate Quantities
    // -----------------------------
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity",
        });
      }
    }

    const discountAmount = Number(discount);

    if (
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      return res.status(400).json({
        message: "Invalid discount",
      });
    }

    // -----------------------------
    // Start Transaction
    // -----------------------------
    session.startTransaction();

    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);

      // Find product inside transaction
      const product = await Product.findById(
        item.productId
      ).session(session);

      if (!product) {
        throw new Error(
          `Product not found: ${item.name || item.productId}`
        );
      }

      // Check stock
      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      // IMPORTANT:
      // Price comes from MongoDB, not frontend
      const price = Number(product.price);

      const itemTotal = Number(
        (price * quantity).toFixed(2)
      );

      subtotal += itemTotal;

      saleItems.push({
        productId: product._id,
        name: product.name,
        barcode: product.barcode,
        price,
        quantity,
        total: itemTotal,
      });

      // Reduce stock
      product.stock -= quantity;

      await product.save({ session });
    }

    // -----------------------------
    // Calculate Totals
    // -----------------------------
    subtotal = Number(subtotal.toFixed(2));

    const gst = Number(
      (subtotal * 0.05).toFixed(2)
    );

    const grandTotal = Number(
      Math.max(
        0,
        subtotal + gst - discountAmount
      ).toFixed(2)
    );

    // -----------------------------
    // Generate Bill Number
    // -----------------------------
    const billNumber = `BILL-${Date.now()}`;

    // -----------------------------
    // Create Sale
    // -----------------------------
    const sale = await Sale.create(
      [
        {
          billNumber,
          items: saleItems,
          subtotal,
          gst,
          discount: discountAmount,
          grandTotal,
          paymentMethod,
        },
      ],
      { session }
    );

    // -----------------------------
    // Commit Transaction
    // -----------------------------
    await session.commitTransaction();

    res.status(201).json({
      message: "Sale completed successfully",
      sale: sale[0],
    });
  } catch (error) {
    // -----------------------------
    // Rollback Transaction
    // -----------------------------
    await session.abortTransaction();

    console.error(
      "Create Sale Error:",
      error
    );

    res.status(400).json({
      message:
        error.message ||
        "Failed to complete sale",
    });
  } finally {
    await session.endSession();
  }
};

// ----------------------------------
// Get All Sales
// ----------------------------------
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({
      createdAt: -1,
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error(
      "Get Sales Error:",
      error
    );

    res.status(500).json({
      message: "Failed to get sales",
      error: error.message,
    });
  }
};

module.exports = {
  createSale,
  getSales,
};