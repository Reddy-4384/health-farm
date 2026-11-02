import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FarmerSales.css";

const ORDER_KEY = "health_farm_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function FarmerSales() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      user = null;
    }

    if (!user || user.role !== "farmer") {
      navigate("/");
      return;
    }

    setFarmer(user);
    loadSales(user.userId);

    const refresh = () => loadSales(user.userId);

    window.addEventListener("healthFarmOrdersChanged", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("healthFarmOrdersChanged", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [navigate]);

  function loadSales(farmerId) {
    const allOrders = readOrders();

    const farmerOrders = allOrders
      .map(order => {
        const items = (Array.isArray(order.items) ? order.items : [])
          .filter(item => item.farmerId === farmerId);

        if (items.length === 0) return null;

        return {
          ...order,
          farmerItems: items
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

    setOrders(farmerOrders);
  }

  function logout() {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Date unavailable"
      : parsed.toLocaleString("en-IN");
  }

  const totalProducts = orders.reduce(
    (sum, order) => sum + order.farmerItems.length,
    0
  );

  const totalQuantity = orders.reduce(
    (sum, order) =>
      sum +
      order.farmerItems.reduce(
        (itemSum, item) =>
          itemSum + Number(item.quantity || 0),
        0
      ),
    0
  );

  const totalSales = orders.reduce(
    (sum, order) =>
      sum +
      order.farmerItems.reduce(
        (itemSum, item) =>
          itemSum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    0
  );

  if (!farmer) return null;

  return (
    <div className="farmer-sales-page">

      {/* HEADER */}
      <header className="farmer-sales-header">

        <div className="farmer-sales-top">

          <div className="farmer-sales-brand">
            <img src="/logo.png" alt="Health Farm Logo" />
            <h2>Health Farm</h2>
          </div>

          <div className="farmer-sales-user">
            <span>{farmer.name || "Farmer"} 👨‍🌾</span>

            <button onClick={logout}>
              Logout
            </button>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="farmer-sales-nav">

          <Link to="/farmer">Home</Link>

          <Link to="/farmer/add-product">
            My Products
          </Link>

          <Link to="/farmer/orders">
            Orders
          </Link>

          <Link to="/farmer/sales" className="active">
            Sales
          </Link>

          <Link to="/farmer/market-prices">
            Market Prices
          </Link>

          <Link to="/farmer/profile">
            Profile
          </Link>

        </nav>

      </header>

      {/* MAIN CONTENT */}
      <main className="farmer-sales-container">

        <div className="farmer-sales-heading">
          <h1>My Sales</h1>
          <p>View your sales and order earnings.</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="farmer-sales-stats">

          <div className="farmer-sales-stat">
            <span>Total Sales Value</span>
            <h2>₹{totalSales.toFixed(2)}</h2>
          </div>

          <div className="farmer-sales-stat">
            <span>Total Orders</span>
            <h2>{orders.length}</h2>
          </div>

          <div className="farmer-sales-stat">
            <span>Products Sold</span>
            <h2>{totalProducts}</h2>
          </div>

          <div className="farmer-sales-stat">
            <span>Total Quantity Sold</span>
            <h2>{totalQuantity} Kg</h2>
          </div>

        </div>

        {/* SALES DETAILS */}
        <div className="farmer-sales-section">

          <h2>Sales History</h2>

          {orders.length === 0 ? (

            <div className="farmer-sales-empty">
              <div>💰</div>
              <h3>No Sales Yet</h3>
              <p>
                Your product sales will appear here when buyers place orders.
              </p>

              <Link to="/farmer/add-product">
                Add Products
              </Link>
            </div>

          ) : (

            <div className="farmer-sales-list">

              {orders.map((order, index) => {

                const orderTotal = order.farmerItems.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.price || 0) *
                      Number(item.quantity || 0),
                  0
                );

                return (
                  <article
                    className="farmer-sales-card"
                    key={order.id || order.orderId || index}
                  >

                    <div className="farmer-sales-card-header">

                      <div>
                        <span>Order ID</span>
                        <h3>
                          {order.orderId || order.id || "N/A"}
                        </h3>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>

                      <span className="farmer-sales-status">
                        {order.status || "Pending"}
                      </span>

                    </div>

                    <div className="farmer-sales-buyer">
                      <strong>Buyer:</strong>{" "}
                      {order.buyerName || "Unknown"}
                    </div>

                    {order.farmerItems.map((item, itemIndex) => (

                      <div
                        className="farmer-sales-product"
                        key={`${item.productId}-${itemIndex}`}
                      >

                        <img
                          src={item.image || "/logo.png"}
                          alt={item.product || "Product"}
                        />

                        <div className="farmer-sales-product-info">
                          <h4>{item.product || "Product"}</h4>

                          <p>
                            Quantity: {item.quantity} Kg
                          </p>

                          <p>
                            Price: ₹
                            {Number(item.price || 0).toFixed(2)} / Kg
                          </p>

                          <p>
                            Fulfilment: {item.farmerStatus || "Processing"}
                          </p>
                        </div>

                        <strong className="farmer-sales-item-total">
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toFixed(2)}
                        </strong>

                      </div>

                    ))}

                    <div className="farmer-sales-total">
                      <span>Order Sales Value</span>
                      <strong>₹{orderTotal.toFixed(2)}</strong>
                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default FarmerSales;