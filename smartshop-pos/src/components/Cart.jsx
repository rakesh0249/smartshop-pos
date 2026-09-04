import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";

function Cart({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="cart-panel">
      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>Current Bill</h2>
          <p>{cart.length} items</p>
        </div>

        <ShoppingCart size={24} />
      </div>

      {/* Empty Cart */}
      {cart.length === 0 ? (
        <div className="empty-cart">
          <ShoppingCart size={45} />

          <h3>Your cart is empty</h3>

          <p>
            Add products to start billing
          </p>
        </div>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div
              className="cart-item"
              key={item._id}
            >
              {/* Product Info */}
              <div className="cart-item-info">
                <h3>{item.name}</h3>

                <p>
                  ₹{Number(item.price).toFixed(2)} each
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() =>
                    onDecrease(item._id)
                  }
                  title="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onIncrease(item._id)
                  }
                  title="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Item Total */}
              <strong className="item-total">
                ₹
                {(
                  Number(item.price) *
                  Number(item.quantity)
                ).toFixed(2)}
              </strong>

              {/* Delete */}
              <button
                type="button"
                className="delete-button"
                onClick={() =>
                  onRemove(item._id)
                }
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;