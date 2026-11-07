
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyProducts.css";

const PRODUCT_KEY = "health_farm_products";

function MyProducts() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState({});

  // Load farmer's products
  const loadProducts = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );

      if (!user || user.role?.toLowerCase() !== "farmer" || !user.userId) {
        navigate("/", { replace: true });
        return;
      }

      setFarmer(user);

      const saved = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      const allProducts = Array.isArray(saved) ? saved : [];

      const myProducts = allProducts.filter(
        item => item.farmerId === user.userId
      );

      setProducts(myProducts);

      const priceValues = {};

      myProducts.forEach(item => {
        priceValues[item.id] = String(item.price ?? "");
      });

      setPrices(priceValues);
    } catch (error) {
      console.error("Unable to load products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();

    window.addEventListener(
      "healthFarmProductsChanged",
      loadProducts
    );

    window.addEventListener("storage", loadProducts);

    return () => {
      window.removeEventListener(
        "healthFarmProductsChanged",
        loadProducts
      );

      window.removeEventListener("storage", loadProducts);
    };
  }, []);

  // Change price input
  const handlePriceChange = (id, value) => {
    setPrices(previous => ({
      ...previous,
      [id]: value
    }));
  };

  // Update product price
  const updatePrice = (id) => {
    if (!farmer) return;

    const newPrice = Number(prices[id]);

    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      alert("Please enter a valid price greater than zero.");
      return;
    }

    try {
      const allProducts = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      if (!Array.isArray(allProducts)) {
        alert("Product data is not available.");
        return;
      }

      const productExists = allProducts.some(
        item =>
          item.id === id &&
          item.farmerId === farmer.userId
      );

      if (!productExists) {
        alert("Product not found.");
        loadProducts();
        return;
      }

      const updatedProducts = allProducts.map(item => {
        if (
          item.id === id &&
          item.farmerId === farmer.userId
        ) {
          return {
            ...item,
            price: newPrice,
            updatedAt: new Date().toISOString()
          };
        }

        return item;
      });

      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(updatedProducts)
      );

      window.dispatchEvent(
        new Event("healthFarmProductsChanged")
      );

      alert("Product price updated successfully!");
      loadProducts();

    } catch (error) {
      console.error("Price update failed:", error);
      alert("Unable to update price. Please try again.");
    }
  };

  // Delete product
  const deleteProduct = (id) => {
    if (!farmer) return;

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const allProducts = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      if (!Array.isArray(allProducts)) {
        alert("Product data is not available.");
        return;
      }

      const updatedProducts = allProducts.filter(
        item => !(
          item.id === id &&
          item.farmerId === farmer.userId
        )
      );

      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(updatedProducts)
      );

      window.dispatchEvent(
        new Event("healthFarmProductsChanged")
      );

      alert("Product deleted successfully!");
      loadProducts();

    } catch (error) {
      console.error("Product deletion failed:", error);
      alert("Unable to delete product. Please try again.");
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  return (
    <div className="mp-page">

      {/* HEADER */}
      <header className="mp-header">

        <div className="mp-brand">
          <img src="/logo.png" alt="Health Farm Logo" />
          <h2>Health Farm</h2>
        </div>

        <div className="mp-user">
          <span>{farmer?.name || "Farmer"} 👨‍🌾</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

      </header>

      {/* NAVBAR */}
      <nav className="mp-navbar">
        <Link to="/farmer">Home</Link>

        <Link to="/farmer/my-products" className="active">
          My Products
        </Link>

        <Link to="/farmer/add-product">Add Product</Link>
        <Link to="/farmer/orders">Orders</Link>
        <Link to="/farmer/sales">Sales</Link>
        <Link to="/farmer/market-prices">Market Prices</Link>
        <Link to="/farmer/profile">Profile</Link>
      </nav>

      {/* MAIN CONTENT */}
      <main className="mp-content">

        <div className="mp-heading">

          <div>
            <h1>My Products</h1>
            <p>View and manage your agricultural products.</p>
          </div>

          <Link
            to="/farmer/add-product"
            className="mp-add-btn"
          >
            + Add New Product
          </Link>

        </div>

        {/* PRODUCT COUNT */}
        <div className="mp-count">
          Total Products: <strong>{products.length}</strong>
        </div>

        {/* PRODUCT LIST */}
        {products.length === 0 ? (

          <div className="mp-empty">
            <span>🌾</span>
            <h2>No Products Added Yet</h2>
            <p>Your products will appear here after adding them.</p>

            <Link to="/farmer/add-product">
              Add Your First Product
            </Link>
          </div>

        ) : (

          <div className="mp-grid">

            {products.map(item => (

              <div className="mp-card" key={item.id}>

                <img
                  className="mp-image"
                  src={item.image || "/logo.png"}
                  alt={item.product}
                />

                <div className="mp-card-body">

                  <span
                    className={`mp-status ${(item.status || "pending").toLowerCase()}`}
                  >
                    {item.status || "Pending"}
                  </span>

                  <h2>{item.product}</h2>

                  <p>Quantity: {item.quantity} Kg</p>
                  <p>Location: {item.location}</p>
                  <p>Available Date: {item.date}</p>

                  {/* PRICE UPDATE */}
                  <div className="mp-price">

                    <label>Price per Kg (₹)</label>

                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={prices[item.id] ?? ""}
                      onChange={e =>
                        handlePriceChange(item.id, e.target.value)
                      }
                    />

                    <button
                      onClick={() => updatePrice(item.id)}
                      disabled={
                        prices[item.id] === "" ||
                        Number(prices[item.id]) === Number(item.price)
                      }
                    >
                      Update Price
                    </button>

                  </div>

                  {/* DELETE */}
                  <button
                    className="mp-delete-btn"
                    onClick={() => deleteProduct(item.id)}
                  >
                    Delete Product
                  </button>

                </div>
              </div>

            ))}

          </div>

        )}

      </main>

      {/* FOOTER */}
      <footer className="mp-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default MyProducts;
