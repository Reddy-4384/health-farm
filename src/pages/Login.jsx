
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const initialAccounts = {
  ADMIN001: {
    password: "admin123",
    role: "admin",
    name: "System Admin",
    phone: "",
    email: "admin@healthfarm.com",
    location: "",
    farmSize: "",
    image: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  FARM001: {
    password: "farmer123",
    role: "farmer",
    name: "Ramesh Kumar",
    phone: "9876543210",
    email: "ramesh@healthfarm.com",
    location: "Guntur",
    farmSize: "5 Acres",
    image: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  BUY001: {
    password: "buyer123",
    role: "buyer",
    name: "Rahul Sharma",
    phone: "",
    email: "rahul@healthfarm.com",
    location: "",
    farmSize: "",
    image: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  }
};

function loadUsers() {
  let users = {};

  try {
    users = JSON.parse(
      localStorage.getItem("health_farm_users") || "{}"
    );
  } catch {
    users = {};
  }

  Object.keys(initialAccounts).forEach((id) => {
    if (!users[id]) {
      users[id] = { ...initialAccounts[id] };
    } else {
      Object.keys(initialAccounts[id]).forEach((key) => {
        if (users[id][key] === undefined) {
          users[id][key] = initialAccounts[id][key];
        }
      });
    }
  });

  localStorage.setItem(
    "health_farm_users",
    JSON.stringify(users)
  );

  return users;
}

function Login() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loginMessage, setLoginMessage] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#d9534f");
  const [selectedImage, setSelectedImage] = useState("");

  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
    role: "admin"
  });

  const [signupData, setSignupData] = useState({
    name: "",
    userId: "",
    phone: "",
    email: "",
    location: "",
    farmSize: "",
    role: "farmer",
    password: "",
    confirmPassword: ""
  });

  function switchTab(value) {
    setTab(value);
    setLoginMessage("");
    setSignupMessage("");
  }

  function handleLogin(e) {
    e.preventDefault();

    const userId = loginData.userId.trim();
    const password = loginData.password.trim();
    const role = loginData.role;

    const users = loadUsers();
    const user = users[userId];

    if (
      user &&
      user.password === password &&
      user.role === role
    ) {
      setMessageColor("#168044");
      setLoginMessage(
        `Login successful! Welcome, ${user.name}.`
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          userId,
          role,
          name: user.name
        })
      );

      setTimeout(() => {
        navigate(`/${role}`);
      }, 800);
    } else {
      setMessageColor("#d9534f");
      setLoginMessage(
        "Invalid User ID, Password or Role."
      );
    }
  }

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) {
      setSelectedImage("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      setSelectedImage("");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2 MB.");
      e.target.value = "";
      setSelectedImage("");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setSelectedImage(event.target.result);
    };

    reader.readAsDataURL(file);
  }

  function handleSignup(e) {
    e.preventDefault();

    const {
      name,
      userId,
      phone,
      email,
      location,
      farmSize,
      role,
      password,
      confirmPassword
    } = signupData;

    const id = userId.trim();

    if (password !== confirmPassword) {
      setSignupMessage("Passwords do not match!");
      setMessageColor("#d9534f");
      return;
    }

    if (role === "farmer" && !selectedImage) {
      setSignupMessage("Please upload a farmer image.");
      setMessageColor("#d9534f");
      return;
    }

    const users = loadUsers();

    if (users[id]) {
      setSignupMessage(
        "User ID already exists. Try logging in."
      );
      setMessageColor("#d9534f");
      return;
    }

    users[id] = {
      password,
      role,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      farmSize: farmSize.trim(),
      image: role === "farmer" ? selectedImage : "",
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(
      "health_farm_users",
      JSON.stringify(users)
    );

    setMessageColor("#168044");
    setSignupMessage("Account created successfully!");

    setTimeout(() => {
      setLoginData({
        userId: id,
        password: "",
        role
      });

      setSignupData({
        name: "",
        userId: "",
        phone: "",
        email: "",
        location: "",
        farmSize: "",
        role: "farmer",
        password: "",
        confirmPassword: ""
      });

      setSelectedImage("");
      setTab("login");
      setSignupMessage("");
    }, 1000);
  }

  return (
    <div className="login-page">

      <section className="left-section">
        <img
          src="/banner.png"
          alt="Agriculture Banner"
          className="banner"
        />
      </section>

      <section className="right-section">
        <div className="login-card">

          <div className="brand">
            <img
              src="/logo.png"
              alt="Health Farm Logo"
              className="logo"
            />

            <h2>Health Farm</h2>
            <p>Farm-to-Fork Ecosystem</p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={
                tab === "login"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() => switchTab("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={
                tab === "signup"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() => switchTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin}>

              <div className="form-group">
                <label>User ID / Email</label>
                <input
                  type="text"
                  placeholder="Enter your User ID"
                  required
                  value={loginData.userId}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      userId: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      password: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Login As</label>
                <select
                  value={loginData.role}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      role: e.target.value
                    })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                Login to Health Farm
              </button>

              <p
                className="status-msg"
                style={{ color: messageColor }}
              >
                {loginMessage}
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup}>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      name: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Choose User ID / Email</label>
                <input
                  type="text"
                  placeholder="Enter a unique ID"
                  required
                  value={signupData.userId}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      userId: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  value={signupData.phone}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      phone: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      email: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Enter your location"
                  required
                  value={signupData.location}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      location: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Farm Size</label>
                <input
                  type="text"
                  placeholder="Example: 5 Acres"
                  required
                  value={signupData.farmSize}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      farmSize: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Register As</label>
                <select
                  value={signupData.role}
                  onChange={(e) => {
                    setSignupData({
                      ...signupData,
                      role: e.target.value
                    });
                    setSelectedImage("");
                  }}
                >
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {signupData.role === "farmer" && (
                <div className="form-group">
                  <label>Farmer Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="image-input"
                    onChange={handleImage}
                  />

                  <small className="image-help">
                    Upload a clear farmer photo. Maximum 2 MB.
                  </small>

                  {selectedImage && (
                    <div className="image-preview">
                      <img
                        src={selectedImage}
                        alt="Image Preview"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  required
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      password: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value
                    })
                  }
                />
              </div>

              <button type="submit" className="submit-btn">
                Create Account
              </button>

              <p
                className="status-msg"
                style={{ color: messageColor }}
              >
                {signupMessage}
              </p>
            </form>
          )}

          <div className="bottom-text">
            Connecting farmers with buyers 🌱
          </div>

        </div>
      </section>

    </div>
  );
}

export default Login;
