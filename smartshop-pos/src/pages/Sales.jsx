import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const API_URL =
  "https://smartshop-pos-backend-e0hw.onrender.com/api/sales";

function Sales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await response.json();

      // Make sure API response is an array
      if (Array.isArray(data)) {
        setSales(data);
      } else {
        console.error(
          "Invalid sales response:",
          data
        );
        setSales([]);
      }
    } catch (error) {
      console.error("Sales Error:", error);
      setSales([]);
      alert("Failed to load sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Today's date
  const today =
    new Date().toLocaleDateString("en-CA");

  const todaySales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(
        sale.createdAt
      ).toLocaleDateString("en-CA");

      return saleDate === today;
    });
  }, [sales, today]);

  // Today's totals
  const todayTotal = todaySales.reduce(
    (total, sale) =>
      total + Number(sale.grandTotal || 0),
    0
  );

  const todayGST = todaySales.reduce(
    (total, sale) =>
      total + Number(sale.gst || 0),
    0
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

  const averageBill =
    todaySales.length > 0
      ? todayTotal / todaySales.length
      : 0;

  // Search
  const filteredSales = sales.filter(
    (sale) => {
      const billNumber =
        sale.billNumber?.toLowerCase() || "";

      const payment =
        sale.paymentMethod?.toLowerCase() || "";

      const query =
        search.toLowerCase().trim();

      return (
        billNumber.includes(query) ||
        payment.includes(query)
      );
    }
  );

  return (
    <div className="sales-page">
      {/* Header */}

      <div className="sales-header">
        <div>
          <h1>Sales History</h1>

          <p>
            View bills and daily sales report
          </p>
        </div>

        <button
          className="refresh-sales"
          onClick={fetchSales}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={
              loading ? "spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Daily Report */}

      <section className="daily-report">
        <div className="report-title">
          <div>
            <h2>Today's Sales</h2>

            <p>
              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        </div>

        <div className="report-cards">
          <div className="report-card">
            <Receipt size={24} />

            <span>Total Bills</span>

            <strong>
              {todaySales.length}
            </strong>
          </div>

          <div className="report-card">
            <span>Total Sales</span>

            <strong>
              ₹{todayTotal.toFixed(2)}
            </strong>
          </div>

          <div className="report-card">
            <span>GST Collected</span>

            <strong>
              ₹{todayGST.toFixed(2)}
            </strong>
          </div>

          <div className="report-card">
            <span>Average Bill</span>

            <strong>
              ₹{averageBill.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Payment Summary */}

        <div className="payment-report">
          <div>
            <Banknote size={20} />

            <span>Cash</span>

            <strong>
              ₹{cashTotal.toFixed(2)}
            </strong>
          </div>

          <div>
            <Smartphone size={20} />

            <span>UPI</span>

            <strong>
              ₹{upiTotal.toFixed(2)}
            </strong>
          </div>

          <div>
            <CreditCard size={20} />

            <span>Card</span>

            <strong>
              ₹{cardTotal.toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      {/* Sales History */}

      <section className="sales-history">
        <div className="history-header">
          <div>
            <h2>All Sales</h2>

            <p>
              {sales.length} bills recorded
            </p>
          </div>

          <div className="sales-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search bill or payment..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="sales-empty">
            <RefreshCw size={30} />
            <p>Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="sales-empty">
            <Receipt size={40} />

            <p>No sales found</p>
          </div>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map(
                  (sale) => {
                    const date =
                      new Date(
                        sale.createdAt
                      );

                    const itemCount =
                      Array.isArray(
                        sale.items
                      )
                        ? sale.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.quantity ||
                                  0
                              ),
                            0
                          )
                        : 0;

                    return (
                      <tr
                        key={sale._id}
                      >
                        <td>
                          <strong>
                            {sale.billNumber}
                          </strong>
                        </td>

                        <td>
                          {date.toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          {date.toLocaleTimeString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          {itemCount}
                        </td>

                        <td>
                          <span
                            className={`payment-badge ${
                              sale.paymentMethod?.toLowerCase() ||
                              ""
                            }`}
                          >
                            {
                              sale.paymentMethod
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              sale.grandTotal ||
                                0
                            ).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Sales;
