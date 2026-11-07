
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// LOGIN
import Login from "./pages/Login";

// ADMIN PAGES
import AdminDashboard from "./pages/AdminDashboard";
import ManageProducts from "./pages/ManageProducts";
import AdminOrders from "./pages/AdminOrders";
import ManageUsers from "./pages/ManageUsers";
import AdminReports from "./pages/AdminReports";

// FARMER PAGES
import FarmerDashboard from "./pages/FarmerDashboard";
import MyProducts from "./pages/MyProducts";
import AddProduct from "./pages/AddProduct";
import FarmerOrders from "./pages/FarmerOrders";
import FarmerSales from "./pages/FarmerSales";
import FarmerMarketPrices from "./pages/FarmerMarketPrices";
import FarmerProfile from "./pages/FarmerProfile";

// BUYER PAGES
import BuyerDashboard from "./pages/BuyerDashboard";
import BrowseProducts from "./pages/BrowseProducts";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import BuyerProfile from "./pages/BuyerProfile";

// PROTECTED ROUTE
function ProtectedDashboard({ role, children }) {
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// APP
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedDashboard role="admin">
              <AdminDashboard />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedDashboard role="admin">
              <ManageProducts />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedDashboard role="admin">
              <AdminOrders />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/admin/farmers"
          element={
            <ProtectedDashboard role="admin">
              <ManageUsers role="farmer" />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/admin/buyers"
          element={
            <ProtectedDashboard role="admin">
              <ManageUsers role="buyer" />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedDashboard role="admin">
              <AdminReports />
            </ProtectedDashboard>
          }
        />

        {/* ================= FARMER ================= */}

        <Route
          path="/farmer"
          element={
            <ProtectedDashboard role="farmer">
              <FarmerDashboard />
            </ProtectedDashboard>
          }
        />

        {/* NEW: MY PRODUCTS */}
        <Route
          path="/farmer/my-products"
          element={
            <ProtectedDashboard role="farmer">
              <MyProducts />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/farmer/add-product"
          element={
            <ProtectedDashboard role="farmer">
              <AddProduct />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/farmer/orders"
          element={
            <ProtectedDashboard role="farmer">
              <FarmerOrders />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/farmer/sales"
          element={
            <ProtectedDashboard role="farmer">
              <FarmerSales />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/farmer/market-prices"
          element={
            <ProtectedDashboard role="farmer">
              <FarmerMarketPrices />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/farmer/profile"
          element={
            <ProtectedDashboard role="farmer">
              <FarmerProfile />
            </ProtectedDashboard>
          }
        />

        {/* ================= BUYER ================= */}

        <Route
          path="/buyer"
          element={
            <ProtectedDashboard role="buyer">
              <BuyerDashboard />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/buyer/products"
          element={
            <ProtectedDashboard role="buyer">
              <BrowseProducts />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/buyer/cart"
          element={
            <ProtectedDashboard role="buyer">
              <Cart />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/buyer/orders"
          element={
            <ProtectedDashboard role="buyer">
              <Orders />
            </ProtectedDashboard>
          }
        />

        <Route
          path="/buyer/profile"
          element={
            <ProtectedDashboard role="buyer">
              <BuyerProfile />
            </ProtectedDashboard>
          }
        />

        {/* INVALID ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
