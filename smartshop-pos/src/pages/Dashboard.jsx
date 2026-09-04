import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Receipt,
  Package,
  AlertTriangle,
  Banknote,
  Smartphone,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const BASE_API =
  "https://smartshop-pos-backend-e0hw.onrender.com";

const PRODUCTS_API = `${BASE_API}/api/products`;
const SALES_API = `${BASE_API}/api/sales`;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [productsResponse, salesResponse] =
        await Promise.all([
          fetch(PRODUCTS_API),
          fetch(SALES_API),
        ]);

      if (
        !productsResponse.ok ||
        !salesResponse.ok
      ) {
        throw new Error(
          "Failed to load dashboard data"
        );
      }

      const productsData =
        await productsResponse.json();

      const salesData =
        await salesResponse.json();

      // Make sure API responses are arrays
      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );

      setSales(
        Array.isArray(salesData)
          ? salesData
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

      setProducts([]);
      setSales([]);

      alert(
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today =
    new Date().toLocaleDateString("en-CA");

  const todaySales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate =
        new Date(
          sale.createdAt
        ).toLocaleDateString("en-CA");

      return saleDate === today;
    });
  }, [sales, today]);

  const todayTotal = todaySales.reduce(
    (total, sale) =>
      total +
      Number(sale.grandTotal || 0),
    0
  );

  const todayBills = todaySales.length;

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) <= 10
    );

  const cashTotal = todaySales
    .filter(
      (sale) =>
        sale.paymentMethod === "Cash"
    )
    .reduce(
      (total, sale) =>
        total +
        Number(sale.grandTotal || 0),
      0
    );

  const upiTotal = todaySales
    .filter(
      (sale) =>
        sale.paymentMethod === "UPI"
    )
    .reduce(
      (total, sale) =>
        total +
        Number(sale.grandTotal || 0),
      0
    );

  const cardTotal = todaySales
    .filter(
      (sale) =>
        sale.paymentMethod === "Card"
    )
    .reduce(
      (total, sale) =>
        total +
        Number(sale.grandTotal || 0),
      0
    );

  const recentSales = sales.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw size={25} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            SmartShop POS overview
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchDashboardData}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Main Stats */}

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <div className="dashboard-icon">
            <IndianRupee size={24} />
          </div>

          <div>
            <span>Today Sales</span>

            <strong>
              ₹{todayTotal.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">
            <Receipt size={24} />
          </div>

          <div>
            <span>Today Bills</span>

            <strong>
              {todayBills}
            </strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">
            <Package size={24} />
          </div>

          <div>
            <span>Total Products</span>

            <strong>
              {products.length}
            </strong>
          </div>
        </div>

        <div className="dashboard-card warning-card">
          <div className="dashboard-icon">
            <AlertTriangle size={24} />
          </div>

          <div>
            <span>Low Stock</span>

            <strong>
              {lowStockProducts.length}
            </strong>
          </div>
        </div>
      </div>

      {/* Payment Summary */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Today's Payments</h2>

            <p>
              Payment method breakdown
            </p>
          </div>
        </div>

        <div className="payment-cards">
          <div className="payment-card">
            <Banknote size={25} />

            <div>
              <span>Cash</span>

              <strong>
                ₹{cashTotal.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="payment-card">
            <Smartphone size={25} />

            <div>
              <span>UPI</span>

              <strong>
                ₹{upiTotal.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="payment-card">
            <CreditCard size={25} />

            <div>
              <span>Card</span>

              <strong>
                ₹{cardTotal.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid */}

      <div className="dashboard-grid">
        {/* Recent Sales */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Recent Sales</h2>

              <p>
                Latest transactions
              </p>
            </div>
          </div>

          {recentSales.length === 0 ? (
            <div className="dashboard-empty">
              <Receipt size={35} />
              <p>No sales yet</p>
            </div>
          ) : (
            <div className="recent-sales">
              {recentSales.map((sale) => {
                const date = new Date(
                  sale.createdAt
                );

                return (
                  <div
                    className="recent-sale"
                    key={sale._id}
                  >
                    <div>
                      <strong>
                        {sale.billNumber}
                      </strong>

                      <span>
                        {date.toLocaleDateString(
                          "en-IN"
                        )}{" "}
                        •{" "}
                        {date.toLocaleTimeString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="recent-sale-right">
                      <span
                        className={`payment-badge ${
                          sale.paymentMethod
                            ?.toLowerCase() || ""
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>

                      <strong>
                        ₹
                        {Number(
                          sale.grandTotal || 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Low Stock */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Low Stock Alert</h2>

              <p>
                Products with 10 or fewer items
              </p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="dashboard-empty">
              <Package size={35} />

              <p>
                All products have enough stock
              </p>
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts
                .slice(0, 6)
                .map((product) => (
                  <div
                    className="low-stock-item"
                    key={product._id}
                  >
                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.category}
                      </span>
                    </div>

                    <strong className="stock-warning">
                      {product.stock} left
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
