
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FarmerDashboard.css";

function FarmerDashboard() {
  const navigate = useNavigate();

  const [farmer] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const farmerId = farmer?.userId;

  const loadDashboard = () => {
    const savedProducts = JSON.parse(
      localStorage.getItem("health_farm_products") || "[]"
    );

    const savedOrders = JSON.parse(
      localStorage.getItem("health_farm_orders") || "[]"
    );

    const productList = Array.isArray(savedProducts)
      ? savedProducts
      : [];

    const orderList = Array.isArray(savedOrders)
      ? savedOrders
      : [];

    setProducts(
      productList.filter(
        product => product.farmerId === farmerId
      )
    );

    setOrders(
      orderList.filter(order =>
        order.items?.some(
          item => item.farmerId === farmerId
        )
      )
    );
  };

  useEffect(() => {
    loadDashboard();

    const handleUpdate = () => loadDashboard();

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("healthFarmProductsChanged", handleUpdate);
    window.addEventListener("healthFarmOrdersChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("healthFarmProductsChanged", handleUpdate);
      window.removeEventListener("healthFarmOrdersChanged", handleUpdate);
    };
  }, [farmerId]);

  const farmerOrderItems = orders.flatMap(order =>
    (order.items || [])
      .filter(item => item.farmerId === farmerId)
      .map(item => ({
        ...item,
        orderId: order.id || order.orderId
      }))
  );

  const totalProducts = products.length;

  const approvedProducts = products.filter(
    product => product.status === "approved"
  ).length;

  const pendingProducts = products.filter(
    product => product.status === "pending"
  ).length;

  const totalOrders = orders.length;

  const totalSales = farmerOrderItems.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalQuantitySold = farmerOrderItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  return (
    <div className="fd-page">

      {/* HEADER */}
      <header className="fd-header">

        <div className="fd-brand">
          <img
            src="/logo.png"
            alt="Health Farm Logo"
            className="fd-logo"
          />
          <h2>Health Farm</h2>
        </div>

        <div className="fd-user">
          <span>
            {farmer?.name || "Farmer"} 👨‍🌾
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>

      </header>

      {/* NAVIGATION */}
      <nav className="fd-navbar">
        <Link to="/farmer" className="active">Home</Link>
        <Link to="/farmer/add-product">My Products</Link>
        <Link to="/farmer/orders">Orders</Link>
        <Link to="/farmer/sales">Sales</Link>
        <Link to="/farmer/market-prices">Market Prices</Link>
        <Link to="/farmer/profile">Profile</Link>
      </nav>

      {/* MAIN CONTENT */}
      <main className="fd-content">

        <section className="fd-welcome">
          <h1>Farmer Dashboard</h1>

          <p>
            Manage your products, track orders and monitor your sales.
          </p>

          <Link to="/farmer/add-product" className="fd-add-btn">
            + Add New Product
          </Link>
        </section>

        {/* STATISTICS */}
        <section className="fd-stats">

          <div className="fd-stat-card">
            <div className="fd-stat-icon">🌾</div>
            <div>
              <p>Total Products</p>
              <h2>{totalProducts}</h2>
            </div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">✅</div>
            <div>
              <p>Approved Products</p>
              <h2>{approvedProducts}</h2>
            </div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">⏳</div>
            <div>
              <p>Pending Products</p>
              <h2>{pendingProducts}</h2>
            </div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">📦</div>
            <div>
              <p>Total Orders</p>
              <h2>{totalOrders}</h2>
            </div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">💰</div>
            <div>
              <p>Total Sales Value</p>
              <h2>₹{totalSales.toLocaleString("en-IN")}</h2>
            </div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">🛒</div>
            <div>
              <p>Quantity Sold</p>
              <h2>{totalQuantitySold}</h2>
            </div>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="fd-section">

          <h2>Quick Actions</h2>

          <div className="fd-actions">

            <Link to="/farmer/add-product">
              <span>➕</span>
              <div>
                <h3>Add Product</h3>
                <p>Add your farm products</p>
              </div>
            </Link>

            <Link to="/farmer/orders">
              <span>📦</span>
              <div>
                <h3>View Orders</h3>
                <p>Manage customer orders</p>
              </div>
            </Link>

            <Link to="/farmer/sales">
              <span>📊</span>
              <div>
                <h3>View Sales</h3>
                <p>Check your sales details</p>
              </div>
            </Link>

            <Link to="/farmer/market-prices">
              <span>📈</span>
              <div>
                <h3>Market Prices</h3>
                <p>Check sample crop prices</p>
              </div>
            </Link>

          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="fd-section">

          <div className="fd-section-heading">
            <h2>Recent Orders</h2>
            <Link to="/farmer/orders">View All</Link>
          </div>

          {recentOrders.length === 0 ? (

            <div className="fd-empty">
              <span>📭</span>
              <h3>No orders yet</h3>
              <p>Your customer orders will appear here.</p>
            </div>

          ) : (

            <div className="fd-table-wrapper">

              <table className="fd-table">

                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Your Products</th>
                    <th>Order Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => {

                    const myItems = (order.items || []).filter(
                      item => item.farmerId === farmerId
                    );

                    return (
                      <tr key={order.id || order.orderId || index}>
                        <td>{order.id || order.orderId || "N/A"}</td>

                        <td>{order.buyerName || "Buyer"}</td>

                        <td>
                          {myItems
                            .map(item => item.product)
                            .join(", ")}
                        </td>

                        <td>
                          <span className="fd-status">
                            {order.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default FarmerDashboard;
