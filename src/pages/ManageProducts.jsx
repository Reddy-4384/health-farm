
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageProducts.css";

const STORAGE_KEY = "health_farm_products";

function readProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function ManageProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    setProducts(readProducts());

    function refresh() {
      setProducts(readProducts());
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("healthFarmProductsChanged", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("healthFarmProductsChanged", refresh);
    };
  }, [navigate]);

  function saveProducts(updatedProducts) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProducts)
    );

    setProducts(updatedProducts);

    window.dispatchEvent(
      new Event("healthFarmProductsChanged")
    );
  }

  function logout() {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  }

  function updateProduct(productId, changes) {
    const updated = products.map(product =>
      String(product.id) === String(productId)
        ? { ...product, ...changes }
        : product
    );

    saveProducts(updated);
  }

  function approveProduct(id) {
    if (!window.confirm(
      "Approve this product?\n\nAfter approval, buyers will be able to see it."
    )) return;

    const product = products.find(
      item => String(item.id) === String(id)
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    updateProduct(id, {
      status: "approved",
      approvedAt: new Date().toISOString()
    });

    alert("Product approved successfully!");
  }

  function rejectProduct(id) {
    if (!window.confirm("Are you sure you want to reject this product?")) {
      return;
    }

    const product = products.find(
      item => String(item.id) === String(id)
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    updateProduct(id, {
      status: "rejected",
      rejectedAt: new Date().toISOString()
    });

    alert("Product rejected.");
  }

  function approveDeletion(id) {
    if (!window.confirm(
      "Are you sure you want to permanently delete this product?"
    )) return;

    const exists = products.some(
      item => String(item.id) === String(id)
    );

    if (!exists) {
      alert("Product not found.");
      return;
    }

    const updated = products.filter(
      item => String(item.id) !== String(id)
    );

    saveProducts(updated);
    setSelectedProduct(null);

    alert("Product deleted successfully.");
  }

  function rejectDeletion(id) {
    const product = products.find(
      item => String(item.id) === String(id)
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    updateProduct(id, {
      status: "approved"
    });

    alert(
      "Deletion request rejected.\n\nThe product remains available to buyers."
    );
  }

  function getStatus(status) {
    const statuses = {
      pending: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
      "delete-pending": "Deletion Pending"
    };

    return statuses[status] || status || "Unknown";
  }

  function openDetails(product) {
    setSelectedProduct(product);
  }

  const pending = products.filter(
    p => p.status === "pending"
  ).length;

  const approved = products.filter(
    p => p.status === "approved"
  ).length;

  const deleteRequests = products.filter(
    p => p.status === "delete-pending"
  ).length;

  return (
    <div className="manage-products-page">

      <header className="mp-header">
        <div className="mp-logo">
          <img src="/logo.png" alt="Health Farm" />
          <span>Health Farm</span>
        </div>

        <div className="mp-user">
          <span>Admin 🛠️</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="mp-navbar">
        <Link to="/admin">Home</Link>
        <Link to="/admin/farmers">Farmers</Link>
        <Link to="/admin/buyers">Buyers</Link>
        <Link to="/admin/products" className="active">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/reports">Reports</Link>
      </nav>

      <main className="mp-content">

        <h1>Manage Products</h1>

        <p className="mp-subtitle">
          Review and verify products submitted by farmers.
        </p>

        <div className="mp-summary-grid">

          <div className="mp-summary-card">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>

          <div className="mp-summary-card">
            <h3>{pending}</h3>
            <p>Pending Approval</p>
          </div>

          <div className="mp-summary-card">
            <h3>{approved}</h3>
            <p>Approved</p>
          </div>

          <div className="mp-summary-card">
            <h3>{deleteRequests}</h3>
            <p>Delete Requests</p>
          </div>

        </div>

        <div className="mp-table-box">

          <table className="mp-table">

            <thead>
              <tr>
                <th>Image</th>
                <th>Product ID</th>
                <th>Product</th>
                <th>Farmer</th>
                <th>Quantity</th>
                <th>Price/Kg</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="mp-empty">
                    No products available.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (

                  <tr key={product.id ?? index}>

                    <td>
                      <img
                        src={product.image || "/logo.png"}
                        alt={product.product || "Product"}
                        className="mp-product-image"
                      />
                    </td>

                    <td>{product.id}</td>

                    <td>
                      <strong>{product.product || "Unnamed"}</strong>
                    </td>

                    <td>{product.farmerName || "Unknown"}</td>

                    <td>{product.quantity} Kg</td>

                    <td>₹{product.price}</td>

                    <td>{product.location || "-"}</td>

                    <td>
                      <span className={`mp-status mp-${product.status}`}>
                        {getStatus(product.status)}
                      </span>
                    </td>

                    <td>
                      <div className="mp-actions">

                        {product.status === "pending" && (
                          <>
                            <button
                              className="mp-approve"
                              onClick={() => approveProduct(product.id)}
                            >
                              Approve
                            </button>

                            <button
                              className="mp-reject"
                              onClick={() => rejectProduct(product.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {product.status === "delete-pending" && (
                          <>
                            <button
                              className="mp-delete-approve"
                              onClick={() => approveDeletion(product.id)}
                            >
                              Approve Delete
                            </button>

                            <button
                              className="mp-delete-reject"
                              onClick={() => rejectDeletion(product.id)}
                            >
                              Reject Delete
                            </button>
                          </>
                        )}

                        {["pending", "approved", "rejected", "delete-pending"].includes(
                          product.status
                        ) && (
                          <button
                            className="mp-view"
                            onClick={() => openDetails(product)}
                          >
                            View
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

        {selectedProduct && (
          <section className="mp-details">

            <div className="mp-details-header">
              <h2>Product Details</h2>

              <button
                className="mp-close"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>

            <div className="mp-details-content">

              <div>
                <img
                  src={selectedProduct.image || "/logo.png"}
                  alt="Product"
                  className="mp-detail-image"
                />
              </div>

              <div className="mp-product-info">

                <p><strong>Product ID:</strong> {selectedProduct.id}</p>

                <p><strong>Product:</strong> {selectedProduct.product}</p>

                <p><strong>Farmer:</strong> {selectedProduct.farmerName || "Not Available"}</p>

                <p><strong>Farmer ID:</strong> {selectedProduct.farmerId || "Not Available"}</p>

                <p><strong>Quantity:</strong> {selectedProduct.quantity} Kg</p>

                <p><strong>Price:</strong> ₹{selectedProduct.price}/Kg</p>

                <p><strong>Location:</strong> {selectedProduct.location}</p>

                <p><strong>Available Date:</strong> {selectedProduct.date || "Not Available"}</p>

                <p><strong>Status:</strong> {getStatus(selectedProduct.status)}</p>

              </div>

            </div>

          </section>
        )}

      </main>

      <footer className="mp-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default ManageProducts;
