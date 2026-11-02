import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FarmerOrders.css";

const ORDER_KEY = "health_farm_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(ORDER_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function FarmerOrders() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      user = null;
    }

    if (!user || user.role !== "farmer") {
      navigate("/");
      return;
    }

    setFarmer(user);
    loadFarmerOrders(user.userId);
  }, [navigate]);

  const loadFarmerOrders = (farmerId) => {
    const allOrders = readOrders();

    const farmerOrders = allOrders
      .map(order => {
        const farmerItems = (Array.isArray(order.items) ? order.items : [])
          .filter(item => item.farmerId === farmerId);

        if (farmerItems.length === 0) return null;

        return {
          ...order,
          farmerItems
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

    setOrders(farmerOrders);
  };

  const updateItemStatus = (orderId, productId, newStatus) => {
    const allOrders = readOrders();

    const updatedOrders = allOrders.map(order => {
      if ((order.id || order.orderId) !== orderId) {
        return order;
      }

      return {
        ...order,
        items: (Array.isArray(order.items) ? order.items : []).map(item => {
          if (
            item.farmerId === farmer.userId &&
            item.productId === productId
          ) {
            return {
              ...item,
              farmerStatus: newStatus
            };
          }

          return item;
        })
      };
    });

    localStorage.setItem(
      ORDER_KEY,
      JSON.stringify(updatedOrders)
    );

    loadFarmerOrders(farmer.userId);

    window.dispatchEvent(
      new Event("healthFarmOrdersChanged")
    );
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  const formatDate = date => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Date unavailable"
      : parsed.toLocaleString("en-IN");
  };

  const totalProducts = orders.reduce(
    (sum, order) => sum + order.farmerItems.length,
    0
  );

  const totalQuantity = orders.reduce(
    (sum, order) =>
      sum + order.farmerItems.reduce(
        (itemSum, item) => itemSum + Number(item.quantity || 0),
        0
      ),
    0
  );

  const totalSales = orders.reduce(
    (sum, order) =>
      sum + order.farmerItems.reduce(
        (itemSum, item) =>
          itemSum +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    0
  );

  if (!farmer) return null;

  return (
    <div className="farmer-orders-page">

      {/* HEADER */}
      <header className="farmer-orders-header">

        <div className="farmer-orders-top">

          <div className="farmer-orders-brand">
            <img src="/logo.png" alt="Health Farm Logo" />
            <h2>Health Farm</h2>
          </div>

          <div className="farmer-orders-user">
            <span>
              {farmer.name || "Farmer"} 👨‍🌾
            </span>

            <button onClick={logout}>
              Logout
            </button>
          </div>

        </div>

        {/* NAVIGATION BAR */}
        <nav className="farmer-orders-nav">

          <Link to="/farmer">
            Home
          </Link>

          <Link to="/farmer/add-product">
            My Products
          </Link>

          <Link
            to="/farmer/orders"
            className="active"
          >
            Orders
          </Link>

          <Link to="/farmer/sales">
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
      <main className="farmer-orders-container">

        <div className="farmer-orders-heading">
          <h1>My Orders</h1>
          <p>Manage orders containing your farm products.</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="farmer-order-stats">

          <div className="farmer-order-stat">
            <span>Total Orders</span>
            <h2>{orders.length}</h2>
          </div>

          <div className="farmer-order-stat">
            <span>Products Ordered</span>
            <h2>{totalProducts}</h2>
          </div>

          <div className="farmer-order-stat">
            <span>Total Quantity</span>
            <h2>{totalQuantity} Kg</h2>
          </div>

          <div className="farmer-order-stat">
            <span>My Sales Value</span>
            <h2>₹{totalSales.toFixed(2)}</h2>
          </div>

        </div>

        {/* ORDER LIST */}
        {orders.length === 0 ? (

          <div className="farmer-orders-empty">

            <div>📦</div>

            <h2>No Orders Yet</h2>

            <p>
              Orders containing your approved products will appear here.
            </p>

            <Link to="/farmer/add-product">
              Add Products
            </Link>

          </div>

        ) : (

          <div className="farmer-orders-list">

            {orders.map((order, index) => {

              const orderId = order.id || order.orderId || index;

              return (
                <article
                  className="farmer-order-card"
                  key={orderId}
                >

                  {/* ORDER HEADER */}
                  <div className="farmer-order-card-header">

                    <div>
                      <span>Order ID</span>

                      <h3>
                        {order.orderId || order.id || "N/A"}
                      </h3>

                      <p>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span className="farmer-order-main-status">
                      Admin Status: {order.status || "Pending"}
                    </span>

                  </div>

                  {/* BUYER DETAILS */}
                  <div className="farmer-order-buyer">

                    <strong>Buyer:</strong>{" "}
                    {order.buyerName || "Unknown"}

                    <span>
                      ({order.buyerId || "N/A"})
                    </span>

                  </div>

                  {/* FARMER PRODUCTS */}
                  {order.farmerItems.map((item, itemIndex) => (

                    <div
                      className="farmer-order-product"
                      key={`${item.productId}-${itemIndex}`}
                    >

                      <img
                        src={item.image || "/logo.png"}
                        alt={item.product || "Product"}
                      />

                      <div className="farmer-order-product-info">

                        <h4>
                          {item.product || "Product"}
                        </h4>

                        <p>
                          Quantity: {item.quantity} Kg
                        </p>

                        <p>
                          Price: ₹
                          {Number(item.price || 0).toFixed(2)} / Kg
                        </p>

                        <p>
                          Item Total: ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toFixed(2)}
                        </p>

                      </div>

                      {/* FULFILMENT STATUS */}
                      <div className="farmer-item-status">

                        <label>
                          Fulfilment Status
                        </label>

                        <select
                          value={item.farmerStatus || "processing"}
                          onChange={e =>
                            updateItemStatus(
                              orderId,
                              item.productId,
                              e.target.value
                            )
                          }
                        >

                          <option value="processing">
                            Processing
                          </option>

                          <option value="ready">
                            Ready
                          </option>

                          <option value="dispatched">
                            Dispatched
                          </option>

                        </select>

                      </div>

                    </div>

                  ))}

                  {/* ORDER TOTAL */}
                  <div className="farmer-order-total">

                    <span>
                      Value of Your Products
                    </span>

                    <strong>
                      ₹
                      {order.farmerItems.reduce(
                        (sum, item) =>
                          sum +
                          Number(item.price || 0) *
                          Number(item.quantity || 0),
                        0
                      ).toFixed(2)}
                    </strong>

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

export default FarmerOrders;