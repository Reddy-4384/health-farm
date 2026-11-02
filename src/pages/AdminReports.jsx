
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminReports.css";

function AdminReports() {
  const navigate = useNavigate();

  const [report, setReport] = useState({
    farmers: 0,
    buyers: 0,
    products: 0,
    approved: 0,
    pendingProducts: 0,
    rejected: 0,
    orders: 0,
    pendingOrders: 0,
    sales: 0
  });

  const admin = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const loadReports = () => {
    const savedUsers = JSON.parse(
      localStorage.getItem("health_farm_users") || "[]"
    );

    const users = Array.isArray(savedUsers)
      ? savedUsers
      : Object.values(savedUsers || {});

    const products = JSON.parse(
      localStorage.getItem("health_farm_products") || "[]"
    );

    const orders = JSON.parse(
      localStorage.getItem("health_farm_orders") || "[]"
    );

    const safeProducts = Array.isArray(products) ? products : [];
    const safeOrders = Array.isArray(orders) ? orders : [];

    setReport({
      farmers: users.filter(
        user => user.role?.toLowerCase() === "farmer"
      ).length,

      buyers: users.filter(
        user => user.role?.toLowerCase() === "buyer"
      ).length,

      products: safeProducts.length,

      approved: safeProducts.filter(
        product => product.status === "approved"
      ).length,

      pendingProducts: safeProducts.filter(
        product =>
          product.status === "pending" ||
          product.status === "delete-pending"
      ).length,

      rejected: safeProducts.filter(
        product => product.status === "rejected"
      ).length,

      orders: safeOrders.length,

      pendingOrders: safeOrders.filter(
        order => order.status?.toLowerCase() === "pending"
      ).length,

      sales: safeOrders.reduce(
        (total, order) =>
          total + Number(order.totalAmount || 0),
        0
      )
    });
  };

  useEffect(() => {
    loadReports();

    window.addEventListener("storage", loadReports);
    window.addEventListener("healthFarmOrdersChanged", loadReports);
    window.addEventListener("healthFarmProductsChanged", loadReports);

    return () => {
      window.removeEventListener("storage", loadReports);
      window.removeEventListener("healthFarmOrdersChanged", loadReports);
      window.removeEventListener("healthFarmProductsChanged", loadReports);
    };
  }, []);

  // DOWNLOAD CSV REPORT
  const downloadCSV = () => {
    const rows = [
      ["HEALTH FARM - ADMIN REPORT"],
      ["Generated On", new Date().toLocaleString()],
      [],
      ["Report", "Value"],
      ["Total Farmers", report.farmers],
      ["Total Buyers", report.buyers],
      ["Total Products", report.products],
      ["Approved Products", report.approved],
      ["Pending Products", report.pendingProducts],
      ["Rejected Products", report.rejected],
      ["Total Orders", report.orders],
      ["Pending Orders", report.pendingOrders],
      ["Total Sales Value", `Rs. ${report.sales}`]
    ];

    const csvContent = rows
      .map(row =>
        row.map(value =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Health_Farm_Admin_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // DOWNLOAD PDF USING PRINT
  const downloadPDF = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const cards = [
    { title: "Total Farmers", value: report.farmers, icon: "👨‍🌾" },
    { title: "Total Buyers", value: report.buyers, icon: "🛒" },
    { title: "Total Products", value: report.products, icon: "🌾" },
    { title: "Approved Products", value: report.approved, icon: "✅" },
    { title: "Pending Products", value: report.pendingProducts, icon: "⏳" },
    { title: "Rejected Products", value: report.rejected, icon: "❌" },
    { title: "Total Orders", value: report.orders, icon: "📦" },
    { title: "Pending Orders", value: report.pendingOrders, icon: "🕒" }
  ];

  return (
    <div className="ar-page">

      {/* HEADER */}
      <header className="ar-header no-print">
        <div className="ar-brand">
          <img src="/logo.png" alt="Health Farm Logo" />
          <h2>Health Farm</h2>
        </div>

        <div className="ar-admin">
          <span>{admin?.name || "System Admin"} 👨‍💼</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="ar-navbar no-print">
        <Link to="/admin">Home</Link>
        <Link to="/admin/farmers">Farmers</Link>
        <Link to="/admin/buyers">Buyers</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/reports" className="active">Reports</Link>
      </nav>

      {/* CONTENT */}
      <main className="ar-content">

        <section className="ar-heading">
          <h1>Admin Reports</h1>
          <p>View and monitor Health Farm system statistics.</p>
        </section>

        {/* DOWNLOAD BUTTONS */}
        <section className="ar-download-section no-print">
          <button className="ar-download-btn csv-btn" onClick={downloadCSV}>
            📊 Download CSV
          </button>

          <button className="ar-download-btn pdf-btn" onClick={downloadPDF}>
            📄 Download PDF
          </button>
        </section>

        {/* REPORT DATE */}
        <p className="ar-report-date">
          Report generated on: {new Date().toLocaleDateString()}
        </p>

        {/* STATISTICS */}
        <section className="ar-grid">
          {cards.map((card, index) => (
            <div className="ar-card" key={index}>
              <div className="ar-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <h2>{card.value}</h2>
            </div>
          ))}
        </section>

        {/* SALES */}
        <section className="ar-sales-card">
          <div>
            <h2>Total Sales Value</h2>
            <p>Based on recorded orders</p>
          </div>

          <h1>₹{report.sales.toLocaleString("en-IN")}</h1>
        </section>

        {/* SUMMARY */}
        <section className="ar-summary-card">
          <h2>System Summary</h2>

          <div className="ar-summary-row">
            <span>Registered Farmers</span>
            <strong>{report.farmers}</strong>
          </div>

          <div className="ar-summary-row">
            <span>Registered Buyers</span>
            <strong>{report.buyers}</strong>
          </div>

          <div className="ar-summary-row">
            <span>Approved Products</span>
            <strong>{report.approved}</strong>
          </div>

          <div className="ar-summary-row">
            <span>Pending Products</span>
            <strong>{report.pendingProducts}</strong>
          </div>

          <div className="ar-summary-row">
            <span>Total Orders</span>
            <strong>{report.orders}</strong>
          </div>

          <div className="ar-summary-row">
            <span>Pending Orders</span>
            <strong>{report.pendingOrders}</strong>
          </div>
        </section>

        <p className="ar-footer">
          Health Farm | Admin Report
        </p>

      </main>
    </div>
  );
}

export default AdminReports;
