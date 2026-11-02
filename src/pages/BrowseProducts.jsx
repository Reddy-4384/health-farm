
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BrowseProducts.css";

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function formatDate(date) {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function BrowseProducts() {
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = readStorage("currentUser", null);

    if (!user || user.role !== "buyer") {
      navigate("/", { replace: true });
      return;
    }

    const usersData = readStorage("health_farm_users", {});
    const users = Array.isArray(usersData)
      ? usersData
      : Object.values(usersData);

    const profile = users.find(
      item =>
        item.userId === user.userId &&
        item.role === "buyer"
    );

    setBuyer({
      ...user,
      name: profile?.name || user.name || "Buyer"
    });

    loadProducts();

    window.addEventListener("storage", loadProducts);
    window.addEventListener("healthFarmProductsChanged", loadProducts);

    return () => {
      window.removeEventListener("storage", loadProducts);
      window.removeEventListener("healthFarmProductsChanged", loadProducts);
    };
  }, [navigate]);

  function loadProducts() {
    const allProducts = readStorage("health_farm_products", []);

    const approved = (Array.isArray(allProducts) ? allProducts : [])
      .filter(product => product.status === "approved")
      .sort((a, b) => {
        const dateA = new Date(
          a.approvedAt || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.approvedAt || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });

    setProducts(approved);
  }

  const filteredProducts = products.filter(product => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return (
      String(product.product || "").toLowerCase().includes(searchText) ||
      String(product.farmerName || "").toLowerCase().includes(searchText) ||
      String(product.location || "").toLowerCase().includes(searchText)
    );
  });

  function addToCart(productId) {
    const allProducts = readStorage("health_farm_products", []);

    const product = allProducts.find(
      item =>
        String(item.id) === String(productId) &&
        item.status === "approved"
    );

    if (!product) {
      setMessage("This product is no longer available.");
      loadProducts();
      return;
    }

    const availableQuantity = Number(product.quantity) || 0;

    if (availableQuantity <= 0) {
      setMessage("This product is currently out of stock.");
      return;
    }

    const cart = readStorage("health_farm_cart", []);

    if (!Array.isArray(cart)) {
      setMessage("Unable to read your cart.");
      return;
    }

    const existingIndex = cart.findIndex(
      item =>
        String(item.productId) === String(product.id) &&
        item.buyerId === buyer.userId
    );

    if (existingIndex !== -1) {
      const existing = cart[existingIndex];
      const currentQuantity = Number(existing.quantity) || 0;

      if (currentQuantity >= availableQuantity) {
        setMessage("You cannot add more than the available quantity.");
        return;
      }

      cart[existingIndex] = {
        ...existing,
        quantity: currentQuantity + 1,
        availableQuantity,
        price: Number(product.price),
        product: product.product,
        image: product.image,
        location: product.location
      };
    } else {
      cart.push({
        productId: product.id,
        product: product.product,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        price: Number(product.price),
        availableQuantity,
        quantity: 1,
        location: product.location,
        image: product.image || "/logo.png",
        buyerId: buyer.userId,
        buyerName: buyer.name,
        addedAt: new Date().toISOString()
      });
    }

    try {
      localStorage.setItem(
        "health_farm_cart",
        JSON.stringify(cart)
      );

      setMessage(`${product.product} added to cart successfully!`);
    } catch {
      setMessage("Unable to save your cart. Please try again.");
    }
  }

  function logout() {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  }

  return (
    <div className="browse-page">

      <header className="bp-header">

        <div className="bp-logo">
          <img src="/logo.png" alt="Health Farm" />
          <span>Health Farm</span>
        </div>

        <div className="bp-search">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setMessage("");
            }}
          />

          <button onClick={() => setSearch(search.trim())}>
            Search
          </button>
        </div>

        <div className="bp-user">
          <span>{buyer?.name || "Buyer"}</span>
          <button onClick={logout}>Logout</button>
        </div>

      </header>

      <nav className="bp-navbar">
        <Link to="/buyer">Home</Link>
        <Link to="/buyer/products" className="active">Products</Link>
        <Link to="/buyer/cart">Cart</Link>
        <Link to="/buyer/orders">Orders</Link>
        <Link to="/buyer/profile">Profile</Link>
      </nav>

      <main className="bp-content">

        <h1>Browse Products</h1>

        <p className="bp-subtitle">
          Buy fresh products directly from verified farmers.
        </p>

        <div className="bp-product-info">
          {filteredProducts.length}
          {filteredProducts.length === 1
            ? " product available"
            : " products available"}
        </div>

        {message && (
          <p className="bp-message" role="status">
            {message}
          </p>
        )}

        {filteredProducts.length > 0 ? (

          <div className="bp-product-grid">

            {filteredProducts.map(product => (

              <article className="bp-product-card" key={product.id}>

                <img
                  className="bp-product-image"
                  src={product.image || "/logo.png"}
                  alt={product.product}
                />

                <div className="bp-product-details">

                  <span className="bp-verified">
                    ✓ Admin Verified
                  </span>

                  <h2>{product.product}</h2>

                  <p>
                    <strong>Farmer:</strong>{" "}
                    {product.farmerName || "Farmer"}
                  </p>

                  <p>
                    <strong>Price:</strong>{" "}
                    ₹{Number(product.price || 0).toFixed(2)}/kg
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {product.location || "Not specified"}
                  </p>

                  <p>
                    <strong>Available:</strong>{" "}
                    {Number(product.quantity || 0)} kg
                  </p>

                  <p>
                    <strong>Available Date:</strong>{" "}
                    {formatDate(product.date)}
                  </p>

                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={Number(product.quantity) <= 0}
                  >
                    Add to Cart
                  </button>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="bp-no-products">
            <h2>No products found</h2>

            <p>
              {search.trim()
                ? "No approved products match your search."
                : "There are currently no approved products available."}
            </p>
          </div>

        )}

      </main>

      <footer className="bp-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default BrowseProducts;
