
import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import "./BuyerDashboard.css";
import "./BrowseProducts.css";

function BuyerDashboard() {
  const navigate = useNavigate();

  const [buyer] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const buyerId = buyer?.userId;

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
        product => product.status === "approved"
      )
    );

    setOrders(
      orderList.filter(
        order => order.buyerId === buyerId
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
  }, [buyerId]);

  const totalOrders = orders.length;

  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) =>
          itemSum + Number(item.quantity || 0),
        0
      ),
    0
  );

  const totalSpending = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
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

  const handleSearch = (e) => {
    e.preventDefault();

    navigate(
      `/buyer/products?search=${encodeURIComponent(searchTerm.trim())}`
    );
  };

  return (
    <div className="bd-page">

      {/* HEADER - SAME DESIGN AS PRODUCTS PAGE */}
      <header className="bp-header">

        <div className="bp-logo">
          <img src="/logo.png" alt="Health Farm" />
          <span>Health Farm</span>
        </div>

        <form className="bp-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <div className="bp-user">
          <span>{buyer?.name || "Buyer"}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

      </header>

      {/* NAVIGATION */}
      <nav className="bp-navbar">
        <Link to="/buyer" className="active">Home</Link>
        <Link to="/buyer/products">Products</Link>
        <Link to="/buyer/cart">Cart</Link>
        <Link to="/buyer/orders">Orders</Link>
        <Link to="/buyer/profile">Profile</Link>
      </nav>

      {/* MAIN CONTENT */}
      <main className="bd-content">

        <section className="bd-welcome">
          <h1>Buyer Dashboard</h1>

          <p>
            Welcome to Health Farm! Buy fresh products directly from farmers.
          </p>

          <Link to="/buyer/products" className="bd-shop-btn">
            Browse Products
          </Link>
        </section>

        {/* STATISTICS */}
        <section className="bd-stats">

          <div className="bd-stat-card">
            <div className="bd-stat-icon">📦</div>
            <div>
              <p>Total Orders</p>
              <h2>{totalOrders}</h2>
            </div>
          </div>

          <div className="bd-stat-card">
            <div className="bd-stat-icon">🛒</div>
            <div>
              <p>Items Ordered</p>
              <h2>{totalItems}</h2>
            </div>
          </div>

          <div className="bd-stat-card">
            <div className="bd-stat-icon">💰</div>
            <div>
              <p>Total Spending</p>
              <h2>₹{totalSpending.toLocaleString("en-IN")}</h2>
            </div>
          </div>

          <div className="bd-stat-card">
            <div className="bd-stat-icon">🌾</div>
            <div>
              <p>Available Products</p>
              <h2>{products.length}</h2>
            </div>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="bd-section">
          <h2>Quick Actions</h2>

          <div className="bd-actions">

            <Link to="/buyer/products">
              <span>🥬</span>
              <div>
                <h3>Browse Products</h3>
                <p>Explore fresh farm products</p>
              </div>
            </Link>

            <Link to="/buyer/cart">
              <span>🛒</span>
              <div>
                <h3>My Cart</h3>
                <p>View your selected products</p>
              </div>
            </Link>

            <Link to="/buyer/orders">
              <span>📦</span>
              <div>
                <h3>My Orders</h3>
                <p>Track your orders</p>
              </div>
            </Link>

          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="bd-section">

          <div className="bd-section-heading">
            <h2>Recent Orders</h2>
            <Link to="/buyer/orders">View All</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bd-empty">
              <span>📭</span>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here.</p>
              <Link to="/buyer/products">Shop Now</Link>
            </div>
          ) : (
            <div className="bd-table-wrapper">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Products</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order.id || order.orderId || index}>
                      <td>{order.id || order.orderId || "N/A"}</td>

                      <td>
                        {(order.items || [])
                          .map(item => item.product)
                          .join(", ")}
                      </td>

                      <td>
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span className="bd-status">
                          {order.status || "Pending"}
                        </span>
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

export default BuyerDashboard;
