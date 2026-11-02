import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FarmerMarketPrices.css";

const marketData = [
  {
    id: 1,
    name: "Rice",
    category: "Grains",
    price: 42,
    market: "Guntur",
    trend: "Stable",
    change: "0%"
  },
  {
    id: 2,
    name: "Wheat",
    category: "Grains",
    price: 35,
    market: "Vijayawada",
    trend: "Up",
    change: "+3%"
  },
  {
    id: 3,
    name: "Tomato",
    category: "Vegetables",
    price: 28,
    market: "Guntur",
    trend: "Down",
    change: "-2%"
  },
  {
    id: 4,
    name: "Onion",
    category: "Vegetables",
    price: 32,
    market: "Vijayawada",
    trend: "Up",
    change: "+4%"
  },
  {
    id: 5,
    name: "Potato",
    category: "Vegetables",
    price: 25,
    market: "Tenali",
    trend: "Stable",
    change: "0%"
  },
  {
    id: 6,
    name: "Chilli",
    category: "Spices",
    price: 180,
    market: "Guntur",
    trend: "Up",
    change: "+5%"
  },
  {
    id: 7,
    name: "Groundnut",
    category: "Pulses & Oilseeds",
    price: 65,
    market: "Tenali",
    trend: "Down",
    change: "-1%"
  },
  {
    id: 8,
    name: "Maize",
    category: "Grains",
    price: 24,
    market: "Guntur",
    trend: "Stable",
    change: "0%"
  }
];

function FarmerMarketPrices() {
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
    } catch {
      user = null;
    }

    if (!user || user.role !== "farmer") {
      navigate("/");
      return;
    }

    setFarmer(user);
  }, [navigate]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  const filteredPrices = marketData.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  if (!farmer) return null;

  return (
    <div className="farmer-market-page">

      {/* HEADER */}
      <header className="farmer-market-header">

        <div className="farmer-market-top">

          <div className="farmer-market-brand">
            <img src="/logo.png" alt="Health Farm Logo" />
            <h2>Health Farm</h2>
          </div>

          <div className="farmer-market-user">
            <span>{farmer.name || "Farmer"} 👨‍🌾</span>

            <button onClick={logout}>
              Logout
            </button>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="farmer-market-nav">

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

          <Link
            to="/farmer/market-prices"
            className="active"
          >
            Market Prices
          </Link>

          <Link to="/farmer/profile">
            Profile
          </Link>

        </nav>

      </header>

      {/* MAIN CONTENT */}
      <main className="farmer-market-container">

        <div className="farmer-market-heading">
          <h1>Market Prices</h1>
          <p>
            Check indicative agricultural product prices.
          </p>
        </div>

        {/* NOTICE */}
        <div className="farmer-market-notice">
          <strong>Sample Market Data</strong>
          <p>
            These prices are demonstration values for the Health Farm
            project. They are not verified live market rates.
          </p>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="farmer-market-controls">

          <input
            type="text"
            placeholder="Search crop name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Grains">Grains</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Spices">Spices</option>
            <option value="Pulses & Oilseeds">
              Pulses & Oilseeds
            </option>
          </select>

        </div>

        {/* PRICE CARDS */}
        <div className="farmer-market-grid">

          {filteredPrices.length === 0 ? (

            <div className="farmer-market-empty">
              <h3>No Products Found</h3>
              <p>Try another crop name or category.</p>
            </div>

          ) : (

            filteredPrices.map(item => (

              <article
                className="farmer-market-card"
                key={item.id}
              >

                <div className="farmer-market-card-top">
                  <span>{item.category}</span>

                  <span
                    className={`farmer-market-trend ${item.trend.toLowerCase()}`}
                  >
                    {item.trend === "Up"
                      ? "↑"
                      : item.trend === "Down"
                      ? "↓"
                      : "—"}{" "}
                    {item.change}
                  </span>
                </div>

                <h2>{item.name}</h2>

                <div className="farmer-market-price">
                  ₹{item.price}
                  <small> / Kg</small>
                </div>

                <p className="farmer-market-location">
                  <span>Market:</span> {item.market}
                </p>

                <p className="farmer-market-description">
                  Indicative sample price
                </p>

              </article>

            ))

          )}

        </div>

        {/* FOOTER INFORMATION */}
        <div className="farmer-market-info">
          <h3>About Market Prices</h3>
          <p>
            Market prices can vary depending on crop quality,
            demand, supply and location. Always verify the latest
            rates with your local agricultural market before selling.
          </p>
        </div>

      </main>

      <footer className="farmer-market-footer">
        © 2026 Health Farm
      </footer>

    </div>
  );
}

export default FarmerMarketPrices;