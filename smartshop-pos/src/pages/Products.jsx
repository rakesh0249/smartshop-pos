import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  PackagePlus,
  PackageMinus,
} from "lucide-react";

const API_URL = "https://smartshop-pos-backend-e0hw.onrender.com";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Stock states
  const [stockProduct, setStockProduct] = useState(null);
  const [stockType, setStockType] = useState("add");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    barcode: "",
  });

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
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Invalid products response:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // Form Change
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Reset Form
  // =========================
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      barcode: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // Add / Update Product
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.price === "" ||
      form.stock === "" ||
      !form.barcode.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        barcode: form.barcode.trim(),
      };

      // ADD PRODUCT
      if (!editingId) {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to add product"
          );
        }

        alert("Product added successfully ✅");
      }

      // UPDATE PRODUCT
      else {
        const response = await fetch(
          `${API_URL}/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update product"
          );
        }

        alert("Product updated successfully ✅");
      }

      await fetchProducts();

      resetForm();
    } catch (error) {
      console.error("Save Product Error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Edit Product
  // =========================
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode,
    });

    setEditingId(product._id);
    setShowForm(true);
  };

  // =========================
  // Delete Product
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      alert("Product deleted successfully 🗑️");

      await fetchProducts();
    } catch (error) {
      console.error("Delete Product Error:", error);
      alert(error.message);
    }
  };

  // =========================
  // Open Stock Modal
  // =========================
  const openStockModal = (product, type) => {
    setStockProduct(product);
    setStockType(type);
    setStockQuantity("");
  };

  // =========================
  // Close Stock Modal
  // =========================
  const closeStockModal = () => {
    setStockProduct(null);
    setStockQuantity("");
    setStockType("add");
  };

  // =========================
  // Update Stock
  // =========================
  const handleStockUpdate = async () => {
    if (!stockProduct) return;

    const quantity = Number(stockQuantity);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid quantity");
      return;
    }

    if (
      stockType === "remove" &&
      quantity > Number(stockProduct.stock)
    ) {
      alert(
        `Only ${stockProduct.stock} items available`
      );
      return;
    }

    try {
      setStockLoading(true);

      const response = await fetch(
        `${API_URL}/${stockProduct._id}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
            type: stockType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update stock"
        );
      }

      alert(
        stockType === "add"
          ? "Stock added successfully ✅"
          : "Stock removed successfully ✅"
      );

      await fetchProducts();

      closeStockModal();
    } catch (error) {
      console.error("Stock Update Error:", error);
      alert(error.message);
    } finally {
      setStockLoading(false);
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
    <div className="products-page">

      {/* =========================
          Header
      ========================= */}
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your products and inventory</p>
        </div>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditingId(null);

            setForm({
              name: "",
              category: "",
              price: "",
              stock: "",
              barcode: "",
            });

            setShowForm(true);
          }}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* =========================
          Toolbar
      ========================= */}
      <div className="products-toolbar">

        <div className="products-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search product or barcode..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="product-count">
          {filteredProducts.length} Products
        </div>

      </div>

      {/* =========================
          Products Table
      ========================= */}
      <div className="products-table-wrapper">

        <table className="products-table">

          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  Loading products...
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (

                <tr key={product._id}>

                  {/* Product */}
                  <td>
                    <div className="product-name">

                      <div className="product-avatar">
                        {product.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {product.name}
                      </strong>

                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    {product.category}
                  </td>

                  {/* Barcode */}
                  <td>
                    <code>
                      {product.barcode}
                    </code>
                  </td>

                  {/* Price */}
                  <td>
                    ₹{product.price}
                  </td>

                  {/* Stock */}
                  <td>
                    <span
                      className={
                        product.stock <= 5
                          ? "stock low"
                          : "stock"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>

                    <div className="action-buttons">

                      {/* Add Stock */}
                      <button
                        className="stock-add-btn"
                        onClick={() =>
                          openStockModal(
                            product,
                            "add"
                          )
                        }
                        title="Add Stock"
                      >
                        <PackagePlus size={17} />
                      </button>

                      {/* Remove Stock */}
                      <button
                        className="stock-remove-btn"
                        onClick={() =>
                          openStockModal(
                            product,
                            "remove"
                          )
                        }
                        title="Remove Stock"
                      >
                        <PackageMinus size={17} />
                      </button>

                      {/* Edit */}
                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(product)
                        }
                        title="Edit Product"
                      >
                        <Pencil size={17} />
                      </button>

                      {/* Delete */}
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        title="Delete Product"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

        {/* No Products */}
        {!loading &&
          filteredProducts.length === 0 && (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}

      </div>

      {/* =========================
          Add / Edit Modal
      ========================= */}
      {showForm && (

        <div className="modal-overlay">

          <div className="product-modal">

            {/* Modal Header */}
            <div className="modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Enter product details below
                </p>

              </div>

              <button
                type="button"
                onClick={resetForm}
              >
                <X size={22} />
              </button>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Product Name */}
              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Parle-G Biscuit"
                />

              </div>

              {/* Category */}
              <div className="form-group">

                <label>
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Biscuits"
                />

              </div>

              {/* Price + Stock */}
              <div className="form-row">

                <div className="form-group">

                  <label>
                    Selling Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="₹0"
                    min="0"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>

              {/* Barcode */}
              <div className="form-group">

                <label>
                  Barcode
                </label>

                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="Enter barcode number"
                />

              </div>

              {/* Actions */}
              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Save Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          Stock Modal
      ========================= */}
      {stockProduct && (

        <div className="modal-overlay">

          <div className="product-modal stock-modal">

            {/* Stock Modal Header */}
            <div className="modal-header">

              <div>

                <h2>
                  {stockType === "add"
                    ? "Add Stock"
                    : "Remove Stock"}
                </h2>

                <p>
                  {stockProduct.name}
                </p>

              </div>

              <button
                type="button"
                onClick={closeStockModal}
              >
                <X size={22} />
              </button>

            </div>

            {/* Current Stock */}
            <div className="stock-current">

              <span>
                Current Stock
              </span>

              <strong>
                {stockProduct.stock}
              </strong>

            </div>

            {/* Quantity */}
            <div className="form-group">

              <label>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(
                    e.target.value
                  )
                }
                placeholder="Enter quantity"
                autoFocus
              />

            </div>

            {/* Actions */}
            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeStockModal}
                disabled={stockLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={handleStockUpdate}
                disabled={stockLoading}
              >
                {stockLoading
                  ? "Updating..."
                  : stockType === "add"
                  ? "Add Stock"
                  : "Remove Stock"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Products;