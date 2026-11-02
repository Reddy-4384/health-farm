
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Orders.css";

const ORDER_KEY = "health_farm_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(ORDER_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function Orders() {
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      user = null;
    }

    if (!user || user.role !== "buyer") {
      navigate("/");
      return;
    }

    setBuyer(user);

    const buyerOrders = readOrders()
      .filter(order => order.buyerId === user.userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

    setOrders(buyerOrders);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const getStatus = (status) => {
    return (status || "pending").toLowerCase();
  };

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  if (!buyer) return null;

  return (
    <div className="orders-page">

      {/* HEADER */}
      <header className="orders-header">

        {/* TOP ROW */}
        <div className="orders-top">
          <div className="orders-brand">
            <img src="/logo.png" alt="Health Farm" />
            <h2>Health Farm</h2>
          </div>

          <button
            className="orders-logout"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* SEARCH ROW */}
        <div className="orders-search">
          <input
            type="text"
            placeholder="Search products..."
            onFocus={() => navigate("/buyer/products")}
          />

          <button onClick={() => navigate("/buyer/products")}>
            Search
          </button>
        </div>

        {/* NAVIGATION ROW */}
        <nav className="orders-nav">
          <Link to="/buyer">Home</Link>
          <Link to="/buyer/products">Products</Link>
          <Link to="/buyer/cart">Cart</Link>
          <Link to="/buyer/orders" className="active">Orders</Link>
          <Link to="/buyer/profile">Profile</Link>
        </nav>

      </header>

      {/* MAIN CONTENT */}
      <main className="orders-container">

        <div className="orders-heading">
          <h1>My Orders</h1>
          <p>View and track your purchases.</p>

          <Link
            to="/buyer/products"
            className="orders-shop-btn"
          >
            Shop Products
          </Link>
        </div>

        {/* SUMMARY CARDS */}
        <div className="orders-summary">

          <div className="orders-summary-card">
            <span>Total Orders</span>
            <h2>{orders.length}</h2>
          </div>

          <div className="orders-summary-card">
            <span>Pending Orders</span>
            <h2>
              {orders.filter(
                order => getStatus(order.status) === "pending"
              ).length}
            </h2>
          </div>

          <div className="orders-summary-card">
            <span>Total Amount</span>
            <h2>₹{totalSpent.toFixed(2)}</h2>
          </div>

        </div>

        {/* ORDER LIST */}
        {orders.length === 0 ? (

          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>

            <h2>No Orders Yet</h2>

            <p>
              Your placed orders will appear here.
            </p>

            <Link to="/buyer/products">
              Browse Products
            </Link>
          </div>

        ) : (

          <div className="orders-list">

            {orders.map((order, index) => (

              <article
                className="order-card"
                key={order.id || order.orderId || index}
              >

                {/* ORDER HEADER */}
                <div className="order-card-header">

                  <div>
                    <span className="order-label">
                      Order ID
                    </span>

                    <h3>
                      {order.orderId || order.id || "N/A"}
                    </h3>

                    <p>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`order-status ${getStatus(order.status)}`}
                  >
                    {getStatus(order.status).replace(/-/g, " ")}
                  </span>

                </div>

                {/* ORDER PRODUCTS */}
                <div className="order-products">

                  {(Array.isArray(order.items) ? order.items : [])
                    .map((item, itemIndex) => (

                      <div
                        className="order-product"
                        key={`${item.productId || item.product}-${itemIndex}`}
                      >

                        <img
                          src={item.image || "/logo.png"}
                          alt={item.product || "Product"}
                        />

                        <div className="order-product-info">
                          <h4>{item.product || "Product"}</h4>

                          <p>
                            Farmer: {item.farmerName || "N/A"}
                          </p>

                          <p>
                            Quantity: {item.quantity} Kg
                          </p>
                        </div>

                        <strong>
                          ₹{(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toFixed(2)}
                        </strong>

                      </div>

                    ))}

                </div>

                {/* ORDER FOOTER */}
                <div className="order-card-footer">
                  <span>Order Total</span>

                  <strong>
                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                  </strong>
                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Orders;
