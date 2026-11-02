
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const CART_KEY = "health_farm_cart";
const PRODUCT_KEY = "health_farm_products";
const ORDER_KEY = "health_farm_orders";

function readData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function Cart() {
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

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

    const allCart = readData(CART_KEY);

    setCart(
      allCart.filter(item => item.buyerId === user.userId)
    );
  }, [navigate]);

  const saveCart = (updatedCart) => {
    const allCart = readData(CART_KEY);

    const otherItems = allCart.filter(
      item => item.buyerId !== buyer.userId
    );

    localStorage.setItem(
      CART_KEY,
      JSON.stringify([...otherItems, ...updatedCart])
    );

    setCart(updatedCart);
    setMessage("");
  };

  const updateQuantity = (productId, change) => {
    const products = readData(PRODUCT_KEY);

    const product = products.find(
      p => p.id === productId
    );

    if (!product || product.status !== "approved") {
      setMessage("This product is no longer available.");
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.productId !== productId) return item;

      const newQuantity = Number(item.quantity) + change;

      if (
        newQuantity < 1 ||
        newQuantity > Number(product.quantity)
      ) {
        setMessage("Available stock limit reached.");
        return item;
      }

      return {
        ...item,
        quantity: newQuantity
      };
    });

    saveCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(
      item => item.productId !== productId
    );

    saveCart(updatedCart);
  };

  const totalAmount = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const placeOrder = () => {
    if (!buyer || cart.length === 0) return;

    const products = readData(PRODUCT_KEY);
    const orders = readData(ORDER_KEY);

    // Validate all products before placing order.
    for (const item of cart) {
      const product = products.find(
        p => p.id === item.productId
      );

      if (
        !product ||
        product.status !== "approved" ||
        Number(product.quantity) < Number(item.quantity)
      ) {
        setMessage(
          `${item.product} is unavailable or has insufficient stock.`
        );
        return;
      }
    }

    // Update product stock.
    const updatedProducts = products.map(product => {
      const orderedItem = cart.find(
        item => item.productId === product.id
      );

      if (!orderedItem) return product;

      return {
        ...product,
        quantity:
          Number(product.quantity) -
          Number(orderedItem.quantity)
      };
    });

    const orderId = "ORD" + Date.now();

    const newOrder = {
      id: orderId,
      orderId,
      buyerId: buyer.userId,
      buyerName: buyer.name || "Buyer",
      items: cart,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(
      PRODUCT_KEY,
      JSON.stringify(updatedProducts)
    );

    localStorage.setItem(
      ORDER_KEY,
      JSON.stringify([...orders, newOrder])
    );

    // Clear only current buyer's cart.
    const allCart = readData(CART_KEY);

    const remainingCart = allCart.filter(
      item => item.buyerId !== buyer.userId
    );

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(remainingCart)
    );

    window.dispatchEvent(
      new Event("healthFarmProductsChanged")
    );

    alert("Your order has been placed successfully!");

    navigate("/buyer/orders");
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!buyer) return null;

  return (
    <div className="cart-page">

      {/* HEADER */}
      <header className="cart-header">

        {/* TOP ROW */}
        <div className="cart-top">
          <div className="cart-brand">
            <img src="/logo.png" alt="Health Farm" />
            <h2>Health Farm</h2>
          </div>

          <button
            className="cart-logout"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* SEARCH ROW */}
        <div className="cart-search">
          <input
            type="text"
            placeholder="Search products..."
            onFocus={() => navigate("/buyer/products")}
          />

          <button
            onClick={() => navigate("/buyer/products")}
          >
            Search
          </button>
        </div>

        {/* NAVIGATION ROW */}
        <nav className="cart-nav">
          <Link to="/buyer">Home</Link>

          <Link to="/buyer/products">
            Products
          </Link>

          <Link to="/buyer/cart" className="active">
            Cart
          </Link>

          <Link to="/buyer/orders">
            Orders
          </Link>

          <Link to="/buyer/profile">
            Profile
          </Link>
        </nav>

      </header>

      {/* MAIN CONTENT */}
      <main className="cart-container">

        <div className="cart-heading">
          <h1>My Shopping Cart</h1>
          <p>Review your products before placing your order.</p>

          <Link
            to="/buyer/products"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>
        </div>

        {message && (
          <p className="cart-message">{message}</p>
        )}

        {cart.length === 0 ? (

          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>

            <h2>Your Cart is Empty</h2>

            <p>
              Explore fresh products directly from farmers.
            </p>

            <Link to="/buyer/products">
              Browse Products
            </Link>
          </div>

        ) : (

          <div className="cart-layout">

            {/* CART PRODUCTS */}
            <section className="cart-items">

              {cart.map(item => (

                <div
                  className="cart-item"
                  key={item.productId}
                >

                  <img
                    src={item.image || "/logo.png"}
                    alt={item.product}
                    className="cart-product-image"
                  />

                  <div className="cart-product-info">
                    <h3>{item.product}</h3>

                    <p>
                      Farmer: {item.farmerName}
                    </p>

                    <p>
                      Location: {item.location}
                    </p>

                    <strong>
                      ₹{Number(item.price).toFixed(2)} / Kg
                    </strong>
                  </div>

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, -1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, 1)
                      }
                    >
                      +
                    </button>

                  </div>

                  <div className="cart-item-total">

                    <strong>
                      ₹{(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>

                    <button
                      className="remove-item"
                      onClick={() =>
                        removeItem(item.productId)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </section>

            {/* ORDER SUMMARY */}
            <aside className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span>To be confirmed</span>
              </div>

              <hr />

              <div className="summary-total">
                <span>Total Amount</span>

                <strong>
                  ₹{totalAmount.toFixed(2)}
                </strong>
              </div>

              <button
                className="place-order-btn"
                onClick={placeOrder}
              >
                Place Order
              </button>

              <p className="cart-note">
                Your order will be saved for processing.
              </p>

            </aside>

          </div>

        )}

      </main>

    </div>
  );
}

export default Cart;
