
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageUsers.css";

function ManageUsers({ role }) {
  const navigate = useNavigate();

  const isFarmerPage = role === "farmer";
  const pageTitle = isFarmerPage ? "Manage Farmers" : "Manage Buyers";
  const roleName = isFarmerPage ? "farmer" : "buyer";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const admin = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const loadUsers = () => {
    const savedUsers = JSON.parse(
      localStorage.getItem("health_farm_users") || "[]"
    );

    const userList = Array.isArray(savedUsers)
      ? savedUsers
      : Object.values(savedUsers || {});

    const filteredUsers = userList.filter(
      (user) => user.role?.toLowerCase() === roleName
    );

    setUsers(filteredUsers);
  };

  useEffect(() => {
    loadUsers();

    const handleUpdate = () => loadUsers();

    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
    };
  }, [roleName]);

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      String(user.name || "").toLowerCase().includes(searchText) ||
      String(user.userId || "").toLowerCase().includes(searchText) ||
      String(user.email || "").toLowerCase().includes(searchText) ||
      String(user.phone || "").toLowerCase().includes(searchText)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <div className="mu-page">

      {/* HEADER */}
      <header className="mu-header">
        <div className="mu-brand">
          <img src="/logo.png" alt="Health Farm Logo" />
          <h2>Health Farm</h2>
        </div>

        <div className="mu-admin">
          <span>{admin?.name || "System Admin"} 👨‍💼</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="mu-navbar">
        <Link to="/admin">Home</Link>

        <Link
          to="/admin/farmers"
          className={isFarmerPage ? "active" : ""}
        >
          Farmers
        </Link>

        <Link
          to="/admin/buyers"
          className={!isFarmerPage ? "active" : ""}
        >
          Buyers
        </Link>

        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/reports">Reports</Link>
      </nav>

      {/* CONTENT */}
      <main className="mu-content">

        <section className="mu-heading">
          <h1>{pageTitle}</h1>
          <p>View and search registered {roleName} accounts.</p>
        </section>

        {/* SUMMARY */}
        <section className="mu-summary">
          <div className="mu-summary-card">
            <p>Total {isFarmerPage ? "Farmers" : "Buyers"}</p>
            <h2>{users.length}</h2>
          </div>
        </section>

        {/* REGISTERED USERS */}
        <section className="mu-list-card">

          <div className="mu-list-heading">
            <h2>
              Registered {isFarmerPage ? "Farmers" : "Buyers"}
            </h2>

            <input
              type="text"
              placeholder="Search name, ID, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="mu-empty">
              <span>📭</span>
              <h3>No {roleName}s found</h3>
              <p>
                {search
                  ? "Try another search term."
                  : `No registered ${roleName} accounts are available.`}
              </p>
            </div>
          ) : (
            <div className="mu-table-wrapper">
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.userId || index}>
                      <td>{index + 1}</td>
                      <td>{user.userId || "N/A"}</td>
                      <td>{user.name || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>{user.location || user.address || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mu-count">
            Showing {filteredUsers.length} of {users.length} accounts
          </p>

        </section>

      </main>
    </div>
  );
}

export default ManageUsers;
