import { useEffect, useRef, useState } from "react";
import { Search, ScanLine, Plus } from "lucide-react";

const API_URL = "http://localhost:5000/api/products";

function ProductSearch({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const barcodeInputRef = useRef(null);

  // =========================
  // Fetch Products
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error("Fetch Products Error:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Focus scanner input
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 300);
  }, []);

  // =========================
  // Keep Scanner Focused
  // =========================
  const focusScanner = () => {
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  // =========================
  // Barcode Scanner
  // =========================
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const barcode = search.trim();

    if (!barcode) return;

    const product = products.find(
      (item) => item.barcode === barcode
    );

    if (product) {
      // Check stock
      if (product.stock <= 0) {
        alert(`${product.name} is out of stock`);
        setSearch("");
        focusScanner();
        return;
      }

      // Add product to cart
      onAddToCart(product);

      // Clear scanner input
      setSearch("");

      // Ready for next scan
      focusScanner();
    } else {
      alert(`Product not found: ${barcode}`);

      setSearch("");

      focusScanner();
    }
  };

  // =========================
  // Search
  // =========================
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.barcode}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="product-panel">

      {/* =========================
          Header
      ========================= */}
      <div className="panel-title">

        <div>
          <h2>Add Products</h2>
          <p>Search or scan a barcode</p>
        </div>

        <button
          className="scan-button"
          onClick={focusScanner}
        >
          <ScanLine size={20} />
          Scan
        </button>

      </div>

      {/* =========================
          Search / Scanner
      ========================= */}
      <div className="search-box">

        <Search size={20} />

        <input
          ref={barcodeInputRef}
          type="text"
          placeholder="Scan barcode or search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

      </div>

      {/* =========================
          Products
      ========================= */}
      <div className="product-grid">

        {loading ? (
          <div className="no-products">
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (

            <div
              className="product-card"
              key={product._id}
            >

              {/* Product Icon */}
              <div className="product-icon">
                {product.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* Product Info */}
              <div className="product-info">

                <h3>{product.name}</h3>

                <p>{product.category}</p>

                <div className="product-bottom">

                  <strong>
                    ₹{product.price}
                  </strong>

                  <span>
                    Stock: {product.stock}
                  </span>

                </div>

              </div>

              {/* Add Button */}
              <button
                className="add-button"
                onClick={() => {
                  if (product.stock <= 0) {
                    alert(
                      `${product.name} is out of stock`
                    );
                    return;
                  }

                  onAddToCart(product);

                  focusScanner();
                }}
                title="Add to cart"
              >
                <Plus size={18} />
              </button>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

export default ProductSearch;