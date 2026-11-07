import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddProduct.css";

const PRODUCT_KEY = "health_farm_products";
const USER_KEY = "health_farm_users";

function getUsers() {
  try {
    const data = JSON.parse(
      localStorage.getItem(USER_KEY) || "{}"
    );

    if (Array.isArray(data)) {
      return Object.fromEntries(
        data
          .filter(user => user.userId)
          .map(user => [user.userId, user])
      );
    }

    if (data && typeof data === "object") {
      return Object.fromEntries(
        Object.entries(data).map(([id, user]) => [
          id,
          {
            ...user,
            userId: user.userId || id
          }
        ])
      );
    }

    return {};
  } catch {
    return {};
  }
}

function AddProduct() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#d9534f");

  const [form, setForm] = useState({
    product: "",
    quantity: "",
    price: "",
    location: "",
    date: ""
  });

  // Check farmer login
  useEffect(() => {
    let currentUser = null;

    try {
      currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
    } catch {
      currentUser = null;
    }

    if (
      !currentUser ||
      currentUser.role?.toLowerCase() !== "farmer"
    ) {
      navigate("/", { replace: true });
      return;
    }

    const users = getUsers();
    const currentFarmer = users[currentUser.userId];

    if (!currentFarmer) {
      alert("Farmer profile not found. Please login again.");
      localStorage.removeItem("currentUser");
      navigate("/");
      return;
    }

    setFarmer(currentFarmer);

    currentUser.name = currentFarmer.name;

    localStorage.setItem(
      "currentUser",
      JSON.stringify(currentUser)
    );

  }, [navigate]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
  }

  // Product image upload
  function handleImageChange(e) {
    const file = e.target.files[0];

    setSelectedImage("");
    setMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessageColor("#d9534f");
      setMessage("Please select an image file.");
      e.target.value = "";
      return;
    }

    // Maximum image size: 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setMessageColor("#d9534f");
      setMessage("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      setSelectedImage(event.target.result);
    };

    reader.onerror = () => {
      setMessageColor("#d9534f");
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  // Submit product
  function handleSubmit(e) {
    e.preventDefault();

    const product = form.product.trim();
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    const location = form.location.trim();
    const date = form.date;

    // Check empty fields
    if (
      !product ||
      !form.quantity ||
      !form.price ||
      !location ||
      !date
    ) {
      setMessageColor("#d9534f");
      setMessage("Please fill all the fields.");
      return;
    }

    // Check quantity
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessageColor("#d9534f");
      setMessage("Quantity must be greater than 0.");
      return;
    }

    // Check price
    if (!Number.isFinite(price) || price <= 0) {
      setMessageColor("#d9534f");
      setMessage("Price must be greater than 0.");
      return;
    }

    // Check image
    if (!selectedImage) {
      setMessageColor("#d9534f");
      setMessage("Please upload a product image.");
      return;
    }

    if (!farmer) {
      setMessageColor("#d9534f");
      setMessage("Farmer profile not found. Please login again.");
      return;
    }

    // Get existing products
    let products = [];

    try {
      const savedProducts = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      products = Array.isArray(savedProducts)
        ? savedProducts
        : [];
    } catch {
      products = [];
    }

    // Create new product
    const newProduct = {
      id: "PROD" + Date.now(),

      product: product,

      quantity: quantity,

      price: price,

      location: location,

      date: date,

      farmerId: farmer.userId,

      farmerName: farmer.name,

      farmerImage: farmer.image || "",

      image: selectedImage,

      status: "pending",

      createdAt: new Date().toISOString()
    };

    // Add product
    products.push(newProduct);

    // Save to Local Storage
    try {
      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(products)
      );
    } catch (error) {
      setMessageColor("#d9534f");
      setMessage(
        "Unable to save product. Try a smaller image or clear browser storage."
      );
      return;
    }

    // Notify other React components in this tab
    window.dispatchEvent(
      new Event("healthFarmProductsChanged")
    );

    // Success message
    setMessageColor("#168044");

    setMessage(
      "Product added successfully! Waiting for Admin approval."
    );

    // Reset form
    setForm({
      product: "",
      quantity: "",
      price: "",
      location: "",
      date: ""
    });

    setSelectedImage("");

    e.target.reset();
  }

  // Logout
  function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  }

  return (
    <div className="add-product-page">

      {/* HEADER */}
      <header className="ap-header">

        <div className="ap-logo">
          <img src="/logo.png" alt="Health Farm Logo" />
          <span>Health Farm</span>
        </div>

        <div className="ap-user">
          <span>
            {farmer?.name || "Farmer"} 👨‍🌾
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>

      </header>

      {/* NAVBAR */}
      <nav className="ap-navbar">

        <Link to="/farmer">
          Home
        </Link>

        <Link to="/farmer/my-products">
          My Products
        </Link>

        <Link
          to="/farmer/add-product"
          className="active"
        >
          Add Product
        </Link>

        <Link to="/farmer/orders">
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

      {/* MAIN CONTENT */}
      <main className="ap-content">

        <div className="ap-heading">

          <h1>Add Product</h1>

          <p>
            Add your agricultural product for Admin verification.
          </p>

        </div>

        {/* PRODUCT FORM */}
        <div className="ap-form-box">

          <form onSubmit={handleSubmit}>

            {/* PRODUCT NAME */}
            <div className="ap-form-group">

              <label htmlFor="product">
                Product Name
              </label>

              <input
                type="text"
                id="product"
                name="product"
                placeholder="Example: Rice"
                value={form.product}
                onChange={handleChange}
                required
              />

            </div>

            {/* QUANTITY */}
            <div className="ap-form-group">

              <label htmlFor="quantity">
                Quantity (Kg)
              </label>

              <input
                type="number"
                id="quantity"
                name="quantity"
                placeholder="Example: 500"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={handleChange}
                required
              />

            </div>

            {/* PRICE */}
            <div className="ap-form-group">

              <label htmlFor="price">
                Price per Kg (₹)
              </label>

              <input
                type="number"
                id="price"
                name="price"
                placeholder="Example: 52"
                min="0.01"
                step="any"
                value={form.price}
                onChange={handleChange}
                required
              />

            </div>

            {/* LOCATION */}
            <div className="ap-form-group">

              <label htmlFor="location">
                Location
              </label>

              <input
                type="text"
                id="location"
                name="location"
                placeholder="Example: Guntur"
                value={form.location}
                onChange={handleChange}
                required
              />

            </div>

            {/* AVAILABLE DATE */}
            <div className="ap-form-group">

              <label htmlFor="date">
                Available Date
              </label>

              <input
                type="date"
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />

            </div>

            {/* PRODUCT IMAGE */}
            <div className="ap-form-group">

              <label htmlFor="productImage">
                Product Image
              </label>

              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={handleImageChange}
                required
              />

              <small className="ap-image-help">
                Upload a clear image of your product.
                Maximum 2 MB.
              </small>

              {selectedImage && (
                <div className="ap-image-preview">

                  <img
                    src={selectedImage}
                    alt="Product Preview"
                  />

                </div>
              )}

            </div>

            {/* ADMIN VERIFICATION */}
            <div className="ap-approval-info">

              <strong>
                Admin Verification
              </strong>

              <p>
                Your product will be sent to Admin for verification.
                It will only be visible to buyers after Admin approval.
              </p>

            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="ap-submit-btn"
            >
              Add Product
            </button>

            {/* MESSAGE */}
            <p
              className="ap-form-message"
              style={{ color: messageColor }}
              role="status"
            >
              {message}
            </p>

          </form>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="ap-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default AddProduct;