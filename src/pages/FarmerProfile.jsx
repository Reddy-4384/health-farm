import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FarmerProfile.css";

const USER_KEY = "health_farm_users";

function FarmerProfile() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#168044");

  useEffect(() => {
    let currentUser = null;

    try {
      currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
    } catch {
      currentUser = null;
    }

    if (!currentUser || currentUser.role !== "farmer") {
      navigate("/", { replace: true });
      return;
    }

    let users = {};

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem(USER_KEY) || "{}"
      );

      if (Array.isArray(savedUsers)) {
        users = Object.fromEntries(
          savedUsers
            .filter(user => user.userId)
            .map(user => [user.userId, user])
        );
      } else if (savedUsers && typeof savedUsers === "object") {
        users = savedUsers;
      }
    } catch {
      users = {};
    }

    const profile = users[currentUser.userId] || currentUser;

    setFarmer(profile);

    setForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || ""
    });
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!farmer) return;

    const updatedFarmer = {
      ...farmer,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim()
    };

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem(USER_KEY) || "{}"
      );

      let updatedUsers;

      if (Array.isArray(savedUsers)) {
        updatedUsers = savedUsers.map(user =>
          user.userId === farmer.userId
            ? updatedFarmer
            : user
        );
      } else {
        updatedUsers = {
          ...(savedUsers && typeof savedUsers === "object"
            ? savedUsers
            : {}),
          [farmer.userId]: updatedFarmer
        };
      }

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(updatedUsers)
      );

      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...currentUser,
          name: updatedFarmer.name
        })
      );

      setFarmer(updatedFarmer);
      setMessageColor("#168044");
      setMessage("Profile updated successfully!");
    } catch {
      setMessageColor("#d9534f");
      setMessage("Unable to update profile. Please try again.");
    }
  }

  function logout() {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  }

  if (!farmer) return null;

  return (
    <div className="farmer-profile-page">

      {/* HEADER */}
      <header className="farmer-profile-header">

        <div className="farmer-profile-top">

          <div className="farmer-profile-brand">
            <img src="/logo.png" alt="Health Farm Logo" />
            <h2>Health Farm</h2>
          </div>

          <div className="farmer-profile-user">
            <span>{form.name || "Farmer"} 👨‍🌾</span>

            <button onClick={logout}>
              Logout
            </button>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="farmer-profile-nav">

          <Link to="/farmer">Home</Link>

          <Link to="/farmer/add-product">
            My Products
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

          <Link
            to="/farmer/profile"
            className="active"
          >
            Profile
          </Link>

        </nav>

      </header>

      {/* MAIN CONTENT */}
      <main className="farmer-profile-container">

        <div className="farmer-profile-heading">
          <h1>My Profile</h1>
          <p>View and update your farmer information.</p>
        </div>

        {/* PROFILE CARD */}
        <div className="farmer-profile-card">

          <div className="farmer-profile-avatar">
            👨‍🌾
          </div>

          <h2>{form.name || "Farmer"}</h2>

          <p className="farmer-profile-role">
            Farmer Account
          </p>

          <div className="farmer-profile-id">
            Farmer ID: {farmer.userId || "N/A"}
          </div>

          <form onSubmit={handleSubmit}>

            <div className="farmer-profile-form-grid">

              <div className="farmer-profile-field">
                <label htmlFor="name">Full Name</label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="farmer-profile-field">
                <label htmlFor="email">Email Address</label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="farmer-profile-field">
                <label htmlFor="phone">Phone Number</label>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="farmer-profile-field">
                <label htmlFor="location">Location</label>

                <input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                />
              </div>

            </div>

            <div className="farmer-profile-account">
              <strong>Account Role:</strong> Farmer
              <br />
              <strong>Farmer ID:</strong> {farmer.userId || "N/A"}
            </div>

            <button
              type="submit"
              className="farmer-profile-save"
            >
              Save Changes
            </button>

            <p
              className="farmer-profile-message"
              style={{ color: messageColor }}
              role="status"
            >
              {message}
            </p>

          </form>

        </div>

      </main>

      <footer className="farmer-profile-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default FarmerProfile;
