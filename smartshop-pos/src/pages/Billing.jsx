import { useEffect, useState } from "react";
import ProductSearch from "../components/ProductSearch";
import Cart from "../components/Cart";
import BillSummary from "../components/BillSummary";

function Billing() {
  const [cart, setCart] = useState([]);
  const [completedSale, setCompletedSale] = useState(null);

  const addToCart = (product) => {
  setCart((currentCart) => {
    const existingProduct = currentCart.find(
      (item) => item._id === product._id
    );

    // Already in cart
    if (existingProduct) {
      const currentQuantity = Number(
        existingProduct.quantity
      );

      const availableStock = Number(
        existingProduct.stock
      );

      if (currentQuantity >= availableStock) {
        alert(
          `${product.name} - Stock limit reached (${availableStock})`
        );

        return currentCart;
      }

      return currentCart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: currentQuantity + 1,
            }
          : item
      );
    }

    // New product
    if (Number(product.stock) <= 0) {
      alert(`${product.name} is out of stock`);
      return currentCart;
    }

    return [
      ...currentCart,
      {
        ...product,
        quantity: 1,
      },
    ];
  });
};

  const increaseQuantity = (id) => {
  setCart((currentCart) => {
    return currentCart.map((item) => {
      if (item._id !== id) {
        return item;
      }

      const currentQuantity = Number(
        item.quantity
      );

      const availableStock = Number(
        item.stock
      );

      if (currentQuantity >= availableStock) {
        alert(
          `${item.name} - Maximum stock reached (${availableStock})`
        );

        return item;
      }

      return {
        ...item,
        quantity: currentQuantity + 1,
      };
    });
  });
};

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== id)
    );
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const handleSaleComplete = (sale) => {
    setCompletedSale(sale);
    setCart([]);
  };

  useEffect(() => {
    if (!completedSale) return;

    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(timer);
  }, [completedSale]);

  const closeReceipt = () => {
    setCompletedSale(null);
  };

  return (
    <div className="billing-page">

      {/* =========================
          MAIN BILLING SCREEN
      ========================== */}

      <div className="no-print">

        <header className="billing-header">
          <div>
            <h1>SmartShop POS</h1>
            <p>Billing & Inventory System</p>
          </div>

          <div className="cashier-info">
            <span>Cashier</span>
            <strong>Admin</strong>
          </div>
        </header>

        <main className="billing-container">

          <section className="products-section">
            <ProductSearch
              onAddToCart={addToCart}
            />
          </section>

          <section className="cart-section">

            <Cart
              cart={cart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />

            <BillSummary
              subtotal={subtotal}
              cart={cart}
              onSaleComplete={handleSaleComplete}
            />

          </section>

        </main>

      </div>

      {/* =========================
          PRINTABLE RECEIPT
      ========================== */}

      {completedSale && (
        <div className="receipt-page">

          <div className="receipt">

            <div className="receipt-header">

              <h1>SMARTSHOP</h1>

              <p className="shop-subtitle">
                Billing & Inventory System
              </p>

              <p>
                No. 12, Main Road
              </p>

              <p>
                Kanchipuram, Tamil Nadu
              </p>

              <p>
                Phone: +91 98765 43210
              </p>

            </div>

            <div className="receipt-divider">
              --------------------------------
            </div>

            <div className="receipt-info">

              <div>
                <span>Bill No:</span>
                <strong>{completedSale.billNumber}</strong>
              </div>

              <div>
                <span>Date:</span>
                <strong>
                  {new Date(
                    completedSale.createdAt
                  ).toLocaleDateString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Time:</span>
                <strong>
                  {new Date(
                    completedSale.createdAt
                  ).toLocaleTimeString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Cashier:</span>
                <strong>Admin</strong>
              </div>

            </div>

            <div className="receipt-divider">
              --------------------------------
            </div>

            <table className="receipt-table">

              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {completedSale.items.map((item, index) => (
                  <tr key={index}>

                    <td>
                      {item.name}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      ₹{Number(item.price).toFixed(2)}
                    </td>

                    <td>
                      ₹{Number(item.total).toFixed(2)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

            <div className="receipt-divider">
              --------------------------------
            </div>

            <div className="receipt-total">

              <div>
                <span>Subtotal</span>
                <strong>
                  ₹{Number(
                    completedSale.subtotal
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>GST (5%)</span>
                <strong>
                  ₹{Number(
                    completedSale.gst
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  ₹{Number(
                    completedSale.discount
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="receipt-grand-total">
                <span>Grand Total</span>
                <strong>
                  ₹{Number(
                    completedSale.grandTotal
                  ).toFixed(2)}
                </strong>
              </div>

            </div>

            <div className="receipt-divider">
              --------------------------------
            </div>

            <div className="payment-info">

              <span>Payment Method</span>

              <strong>
                {completedSale.paymentMethod}
              </strong>

            </div>

            <div className="receipt-footer">

              <h3>Thank You! 🙏</h3>

              <p>
                Visit Again
              </p>

              <small>
                Powered by SmartShop POS
              </small>

            </div>

          </div>

          <div className="receipt-actions no-print">

            <button
              onClick={() => window.print()}
              className="receipt-print-btn"
            >
              🖨️ Print Receipt
            </button>

            <button
              onClick={closeReceipt}
              className="receipt-close-btn"
            >
              New Bill
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Billing;