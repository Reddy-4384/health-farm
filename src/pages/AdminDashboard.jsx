
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    farmers: 0,
    buyers: 0,
    products: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    orders: 0,
    pendingOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const admin = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const loadDashboard = () => {
    const savedUsers = JSON.parse(
      localStorage.getItem("health_farm_users") || "[]"
    );

    const users = Array.isArray(savedUsers)
      ? savedUsers
      : Object.values(savedUsers || {});

    const savedProducts = JSON.parse(
      localStorage.getItem("health_farm_products") || "[]"
    );

    const savedOrders = JSON.parse(
      localStorage.getItem("health_farm_orders") || "[]"
    );

    const products = Array.isArray(savedProducts)
      ? savedProducts
      : [];

    const orders = Array.isArray(savedOrders)
      ? savedOrders
      : [];

    setStats({
      farmers: users.filter(
        user => user.role?.toLowerCase() === "farmer"
      ).length,

      buyers: users.filter(
        user => user.role?.toLowerCase() === "buyer"
      ).length,

      products: products.length,

      approved: products.filter(
        product => product.status === "approved"
      ).length,

      pending: products.filter(
        product =>
          product.status === "pending" ||
          product.status === "delete-pending"
      ).length,

      rejected: products.filter(
        product => product.status === "rejected"
      ).length,

      orders: orders.length,

      pendingOrders: orders.filter(
        order => order.status?.toLowerCase() === "pending"
      ).length
    });

    setRecentOrders(
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 5)
    );
  };

  useEffect(() => {
    loadDashboard();

    window.addEventListener("storage", loadDashboard);
    window.addEventListener("healthFarmOrdersChanged", loadDashboard);
    window.addEventListener("healthFarmProductsChanged", loadDashboard);

    return () => {
      window.removeEventListener("storage", loadDashboard);
      window.removeEventListener("healthFarmOrdersChanged", loadDashboard);
      window.removeEventListener("healthFarmProductsChanged", loadDashboard);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const cards = [
    {
      title: "Total Farmers",
      value: stats.farmers,
      icon: "👨‍🌾"
    },
    {
      title: "Total Buyers",
      value: stats.buyers,
      icon: "🛒"
    },
    {
      title: "Total Products",
      value: stats.products,
      icon: "🌾"
    },
    {
      title: "Approved Products",
      value: stats.approved,
      icon: "✅"
    },
    {
      title: "Pending Products",
      value: stats.pending,
      icon: "⏳"
    },
    {
      title: "Total Orders",
      value: stats.orders,
      icon: "📦"
    }
  ];

  return (
    <div className="ad-page">

      {/* HEADER */}
      <header className="ad-header">
        <div className="ad-brand">
          <img src="/logo.png" alt="Health Farm Logo" />
          <h2>Health Farm</h2>
        </div>

        <div className="ad-admin">
          <span>{admin?.name || "System Admin"} 👨‍💼</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="ad-navbar">
        <Link to="/admin" className="active">Home</Link>
        <Link to="/admin/farmers">Farmers</Link>
        <Link to="/admin/buyers">Buyers</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/reports">Reports</Link>
      </nav>

      {/* MAIN CONTENT */}
      <main className="ad-content">

        <section className="ad-heading">
          <h1>Admin Dashboard</h1>
          <p>Welcome to Health Farm Administration Panel.</p>
        </section>

        {/* STATISTICS */}
        <section className="ad-stats-grid">
          {cards.map((card, index) => (
            <div className="ad-stat-card" key={index}>
              <div className="ad-stat-icon">
                {card.icon}
              </div>

              <div>
                <p>{card.title}</p>
                <h2>{card.value}</h2>
              </div>
            </div>
          ))}
        </section>

        {/* QUICK ACTIONS */}
        <section className="ad-section">
          <h2>Quick Actions</h2>

          <div className="ad-actions-grid">

            <Link to="/admin/farmers" className="ad-action-card">
              <span>👨‍🌾</span>
              <h3>Manage Farmers</h3>
              <p>View registered farmers</p>
            </Link>

            <Link to="/admin/buyers" className="ad-action-card">
              <span>🛒</span>
              <h3>Manage Buyers</h3>
              <p>View registered buyers</p>
            </Link>

            <Link to="/admin/products" className="ad-action-card">
              <span>🌾</span>
              <h3>Manage Products</h3>
              <p>Verify farmer products</p>
            </Link>

            <Link to="/admin/orders" className="ad-action-card">
              <span>📦</span>
              <h3>Manage Orders</h3>
              <p>View and manage orders</p>
            </Link>

            <Link to="/admin/reports" className="ad-action-card">
              <span>📊</span>
              <h3>View Reports</h3>
              <p>Check system statistics</p>
            </Link>

          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="ad-section ad-orders-section">
          <div className="ad-section-heading">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders">View All</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="ad-empty">
              <span>📭</span>
              <p>No orders available yet.</p>
            </div>
          ) : (
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order.id || order.orderId || index}>
                      <td>{order.orderId || order.id || "N/A"}</td>
                      <td>{order.buyerName || "N/A"}</td>
                      <td>
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className="ad-status">
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;
