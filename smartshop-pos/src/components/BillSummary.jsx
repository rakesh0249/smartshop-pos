import {
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
} from "lucide-react";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/sales";

function BillSummary({
  subtotal,
  cart,
  onSaleComplete,
}) {
  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [loading, setLoading] = useState(false);

  const gst = Number((subtotal * 0.05).toFixed(2));
  const discount = 0;

  const grandTotal = Number(
    (subtotal + gst - discount).toFixed(2)
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (loading) return;

    const invalidItem = cart.find(
      (item) =>
        !item.quantity ||
        Number(item.quantity) <= 0
    );

    if (invalidItem) {
      alert(
        `Invalid quantity for ${invalidItem.name}`
      );
      return;
    }

    try {
      setLoading(true);

      const saleItems = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        barcode: item.barcode,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: saleItems,
          subtotal: Number(subtotal),
          gst: Number(gst),
          discount: Number(discount),
          grandTotal: Number(grandTotal),
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Checkout failed"
        );
      }

      onSaleComplete(data.sale);
    } catch (error) {
      console.error("Checkout Error:", error);

      alert(
        error.message ||
          "Failed to complete sale"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-panel">
      <h2>Bill Summary</h2>

      <div className="summary-row">
        <span>Subtotal</span>
        <strong>
          ₹{Number(subtotal).toFixed(2)}
        </strong>
      </div>

      <div className="summary-row">
        <span>GST (5%)</span>
        <strong>₹{gst.toFixed(2)}</strong>
      </div>

      <div className="summary-row">
        <span>Discount</span>
        <strong>
          ₹{discount.toFixed(2)}
        </strong>
      </div>

      <div className="total-row">
        <span>Grand Total</span>
        <strong>
          ₹{grandTotal.toFixed(2)}
        </strong>
      </div>

      <h3 className="payment-title">
        Payment Method
      </h3>

      <div className="payment-buttons">
        <button
          type="button"
          className={
            paymentMethod === "Cash"
              ? "active"
              : ""
          }
          onClick={() =>
            setPaymentMethod("Cash")
          }
          disabled={loading}
        >
          <Banknote size={18} />
          Cash
        </button>

        <button
          type="button"
          className={
            paymentMethod === "UPI"
              ? "active"
              : ""
          }
          onClick={() =>
            setPaymentMethod("UPI")
          }
          disabled={loading}
        >
          <Smartphone size={18} />
          UPI
        </button>

        <button
          type="button"
          className={
            paymentMethod === "Card"
              ? "active"
              : ""
          }
          onClick={() =>
            setPaymentMethod("Card")
          }
          disabled={loading}
        >
          <CreditCard size={18} />
          Card
        </button>
      </div>

      <button
        type="button"
        className="print-button"
        disabled={
          cart.length === 0 || loading
        }
        onClick={handleCheckout}
      >
        <Printer size={20} />

        {loading
          ? "Processing..."
          : "Pay & Print Bill"}
      </button>
    </div>
  );
}

export default BillSummary;