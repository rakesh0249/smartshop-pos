import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <nav className="main-nav">

        <button
          className={
            page === "dashboard" ? "active" : ""
          }
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={
            page === "billing" ? "active" : ""
          }
          onClick={() => setPage("billing")}
        >
          Billing
        </button>

        <button
          className={
            page === "products" ? "active" : ""
          }
          onClick={() => setPage("products")}
        >
          Products
        </button>

        <button
          className={
            page === "sales" ? "active" : ""
          }
          onClick={() => setPage("sales")}
        >
          Sales
        </button>

      </nav>

      {page === "dashboard" && <Dashboard />}

      {page === "billing" && <Billing />}

      {page === "products" && <Products />}

      {page === "sales" && <Sales />}
    </>
  );
}

export default App;