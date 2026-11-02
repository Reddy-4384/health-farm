
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BuyerProfile.css";

function BuyerProfile() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const savedUsers = JSON.parse(
    localStorage.getItem("health_farm_users") || "[]"
  );

  const buyerId = currentUser?.userId;

  const buyerRecord = Array.isArray(savedUsers)
    ? savedUsers.find((user) => user.userId === buyerId)
    : savedUsers?.[buyerId] || currentUser;

  const [profile, setProfile] = useState({
    name: buyerRecord?.name || currentUser?.name || "",
    email: buyerRecord?.email || currentUser?.email || "",
    phone: buyerRecord?.phone || currentUser?.phone || "",
    address:
      buyerRecord?.address ||
      buyerRecord?.location ||
      currentUser?.address ||
      currentUser?.location ||
      ""
  });

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!currentUser || !buyerId) {
      setMessage("Please login again.");
      return;
    }

    let users = JSON.parse(
      localStorage.getItem("health_farm_users") || "[]"
    );

    if (Array.isArray(users)) {
      users = users.map((user) =>
        user.userId === buyerId
          ? { ...user, ...profile }
          : user
      );
    } else {
      users = {
        ...users,
        [buyerId]: {
          ...(users[buyerId] || currentUser),
          ...profile
        }
      };
    }

    localStorage.setItem(
      "health_farm_users",
      JSON.stringify(users)
    );

    const updatedUser = {
      ...currentUser,
      ...profile
    };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(updatedUser)
    );

    setMessage("Profile updated successfully!");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    navigate(
      `/buyer/products?search=${encodeURIComponent(searchTerm.trim())}`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <div className="bp-page">

      {/* HEADER */}
      <header className="bp-header">
        <div className="bp-brand">
          <img src="/logo.png" alt="Health Farm Logo" />
          <h2>Health Farm</h2>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      {/* SEARCH BAR */}
      <div className="bp-search-row">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>
      </div>

      {/* NAVIGATION */}
      <nav className="bp-navbar">
        <Link to="/buyer">Home</Link>
        <Link to="/buyer/products">Products</Link>
        <Link to="/buyer/cart">Cart</Link>
        <Link to="/buyer/orders">Orders</Link>
        <Link to="/buyer/profile" className="active">Profile</Link>
      </nav>

      {/* PROFILE CONTENT */}
      <main className="bp-content">

        <section className="bp-heading">
          <h1>My Profile</h1>
          <p>View and update your personal information.</p>
        </section>

        <section className="bp-profile-card">

          <div className="bp-avatar">
            👤
          </div>

          <h2>{profile.name || "Buyer"}</h2>
          <p className="bp-role">Buyer Account</p>

          <form onSubmit={handleSave}>

            <div className="bp-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="bp-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="bp-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="bp-form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              />
            </div>

            <button type="submit" className="bp-save-btn">
              Save Profile
            </button>

            {message && (
              <p className="bp-message">{message}</p>
            )}

          </form>

        </section>

      </main>
    </div>
  );
}

export default BuyerProfile;
