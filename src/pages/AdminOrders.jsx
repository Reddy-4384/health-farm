
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminOrders.css";

const ORDER_KEY = "health_farm_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(ORDER_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      user = null;
    }

    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    setOrders(readOrders());
  }, [navigate]);

  const updateStatus = (orderId, newStatus) => {
    const updatedOrders = readOrders().map(order => {
      if ((order.id || order.orderId) !== orderId) {
        return order;
      }

      return {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    });

    localStorage.setItem(
      ORDER_KEY,
      JSON.stringify(updatedOrders)
    );

    setOrders(updatedOrders);
    setMessage(`Order status updated to ${newStatus}.`);

    window.dispatchEvent(new Event("healthFarmOrdersChanged"));
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;

    return (order.status || "pending").toLowerCase() === filter;
  });

  const pendingCount = orders.filter(
    order => (order.status || "pending").toLowerCase() === "pending"
  ).length;

  const confirmedCount = orders.filter(
    order => (order.status || "").toLowerCase() === "confirmed"
  ).length;

  const deliveredCount = orders.filter(
    order => (order.status || "").toLowerCase() === "delivered"
  ).length;

  const totalRevenue = orders
    .filter(order => (order.status || "").toLowerCase() === "delivered")
    .reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

  const formatDate = date => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Date unavailable"
      : parsed.toLocaleString("en-IN");
  };

  return (
    <div className="admin-orders-page">

      <header className="admin-orders-header">
        <div className="admin-orders-brand">
          <img src="/logo.png" alt="Health Farm" />
          <h2>Health Farm</h2>
          <span>Admin Panel</span>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <div className="admin-orders-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/farmers">Farmers</Link>
        <Link to="/admin/buyers">Buyers</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders" className="active">Orders</Link>
        <Link to="/admin/reports">Reports</Link>
      </div>

      <main className="admin-orders-container">

        <div className="admin-orders-heading">
          <div>
            <h1>Order Management</h1>
            <p>View and manage buyer orders.</p>
          </div>
        </div>

        {message && (
          <p className="admin-order-message">{message}</p>
        )}

        {/* SUMMARY */}
        <div className="admin-order-stats">

          <div className="admin-order-stat">
            <span>Total Orders</span>
            <h2>{orders.length}</h2>
          </div>

          <div className="admin-order-stat">
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>

          <div className="admin-order-stat">
            <span>Confirmed</span>
            <h2>{confirmedCount}</h2>
          </div>

          <div className="admin-order-stat">
            <span>Delivered</span>
            <h2>{deliveredCount}</h2>
          </div>

          <div className="admin-order-stat">
            <span>Delivered Revenue</span>
            <h2>₹{totalRevenue.toFixed(2)}</h2>
          </div>

        </div>

        {/* FILTER */}
        <div className="admin-order-toolbar">
          <h2>All Orders</h2>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* ORDERS */}
        {filteredOrders.length === 0 ? (

          <div className="admin-orders-empty">
            <div>📦</div>
            <h3>No Orders Found</h3>
            <p>Buyer orders will appear here after checkout.</p>
          </div>

        ) : (

          <div className="admin-orders-list">

            {filteredOrders.map((order, index) => {

              const orderId = order.id || order.orderId || index;

              return (
                <article
                  className="admin-order-card"
                  key={orderId}
                >

                  <div className="admin-order-card-top">

                    <div>
                      <span>Order ID</span>
                      <h3>{order.orderId || order.id || "N/A"}</h3>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>

                    <span
                      className={`admin-order-status ${(order.status || "pending").toLowerCase()}`}
                    >
                      {order.status || "Pending"}
                    </span>

                  </div>

                  <div className="admin-order-buyer">
                    <strong>Buyer:</strong>{" "}
                    {order.buyerName || "Unknown"} 
                    <span>({order.buyerId || "N/A"})</span>
                  </div>

                  <div className="admin-order-products">

                    {(Array.isArray(order.items) ? order.items : [])
                      .map((item, itemIndex) => (

                        <div
                          className="admin-order-product"
                          key={`${item.productId || item.product}-${itemIndex}`}
                        >

                          <img
                            src={item.image || "/logo.png"}
                            alt={item.product || "Product"}
                          />

                          <div>
                            <h4>{item.product || "Product"}</h4>
                            <p>Farmer: {item.farmerName || "N/A"}</p>
                            <p>Quantity: {item.quantity} Kg</p>
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

                  <div className="admin-order-card-bottom">

                    <div className="admin-order-total">
                      Order Total:
                      <strong>
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div className="admin-order-actions">
                      <label htmlFor={`status-${orderId}`}>
                        Update Status
                      </label>

                      <select
                        id={`status-${orderId}`}
                        value={(order.status || "pending").toLowerCase()}
                        onChange={e =>
                          updateStatus(orderId, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </main>
    </div>
  );
}

export default AdminOrders;
