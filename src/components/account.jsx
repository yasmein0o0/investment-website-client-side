// src/components/Account.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutThunk } from "../redux/logout";
import { deleteThunk } from "../redux/deleteaccount";
import "../style/account.scss";

export function Account() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.accessToken);
  const [activeTab, setActiveTab] = useState("profile");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("delete account failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      // dispatch(clearAuth());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
    // You can implement theme switching logic here
    document.body.classList.toggle("dark-theme");
  };

  return (
    <div id="account-page">
      <div className="account-container">
        {/* Header */}
        <header className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your account preferences and security</p>
        </header>

        <div className="account-layout">
          {/* Sidebar Navigation */}
          <aside className="account-sidebar">
            <div className="user-profile-card">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-info">
                <h3>{user?.name || "User"}</h3>
                <p>{user?.email || "No email provided"}</p>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z" />
                  </svg>
                </span>
                Profile Information
              </button>

              <button
                className={`nav-item ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                <span className="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z" />
                  </svg>
                </span>
                Security
              </button>

              <button
                className={`nav-item ${
                  activeTab === "preferences" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preferences")}
              >
                <span className="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z" />
                  </svg>
                </span>
                Preferences
              </button>

              {/* Placeholder for future features */}
              <div className="nav-section">
                <span className="section-label">Coming Soon</span>
                <button className="nav-item disabled">
                  <span className="nav-icon">📊</span>
                  Trading Preferences
                </button>
                <button className="nav-item disabled">
                  <span className="nav-icon">🔔</span>
                  Notifications
                </button>
                <button className="nav-item disabled">
                  <span className="nav-icon">💳</span>
                  Billing & Subscription
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="account-content">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="tab-content">
                <h2>Profile Information</h2>
                <p className="tab-description">
                  Manage your basic account information and personal details.
                </p>

                <div className="info-card">
                  <div className="info-item">
                    <label>Full Name</label>
                    <div className="info-value">
                      {user?.name || "Not provided"}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Email Address</label>
                    <div className="info-value">
                      {user?.email || "Not provided"}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Account Type</label>
                    <div className="info-value">
                      <span className="badge">Standard Trader</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Member Since</label>
                    <div className="info-value">October 2024</div>
                  </div>
                </div>

                <div className="action-section">
                  <h3>Profile Actions</h3>
                  <div className="action-buttons">
                    <button className="btn-secondary" disabled>
                      Edit Profile (Coming Soon)
                    </button>
                    <button className="btn-secondary" disabled>
                      Update Email (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="tab-content">
                <h2>Security Settings</h2>
                <p className="tab-description">
                  Keep your account secure with these safety measures.
                </p>

                <div className="security-cards">
                  <div className="security-card">
                    <div className="security-icon">🔑</div>
                    <div className="security-content">
                      <h4>Change Password</h4>
                      <p>Update your password to keep your account secure</p>
                      <button
                        className="btn-primary"
                        onClick={() => navigate("/change-password")}
                      >
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="security-card warning">
                    <div className="security-icon">🚫</div>
                    <div className="security-content">
                      <h4>Delete Account</h4>
                      <p>
                        Permanently delete your account and all associated data
                      </p>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete()}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="tab-content">
                <h2>Preferences</h2>
                <p className="tab-description">
                  Customize your trading experience and application settings.
                </p>

                <div className="preferences-grid">
                  <div className="preference-card">
                    <div className="preference-header">
                      <h4>Theme</h4>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          id="theme-toggle"
                          checked={isDarkTheme}
                          onChange={handleThemeToggle}
                        />
                        <label htmlFor="theme-toggle">
                          <span className="toggle-label">
                            {isDarkTheme ? "Dark" : "Light"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <p>
                      Choose between light and dark theme for better visibility
                    </p>
                  </div>

                  <div className="preference-card">
                    <div className="preference-header">
                      <h4>Language</h4>
                      <select className="select-input" disabled>
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <p>Set your preferred language (Coming Soon)</p>
                  </div>

                  <div className="preference-card">
                    <div className="preference-header">
                      <h4>Currency</h4>
                      <select className="select-input" disabled>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                    <p>Default currency for trading (Coming Soon)</p>
                  </div>

                  <div className="preference-card">
                    <div className="preference-header">
                      <h4>Data Refresh Rate</h4>
                      <select className="select-input" disabled>
                        <option>Real-time</option>
                        <option>15 seconds</option>
                        <option>30 seconds</option>
                      </select>
                    </div>
                    <p>How often market data updates (Coming Soon)</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer Actions */}
        <footer className="account-footer">
          <div className="footer-actions">
            <button className="btn-logout" onClick={handleLogout}>
              Sign Out
            </button>
            <div className="footer-info">
              <span>Need help? Contact support@biscmarket.com</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
