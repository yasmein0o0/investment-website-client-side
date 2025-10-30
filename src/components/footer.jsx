// src/components/Footer.jsx
import { Link } from "react-router-dom";
import "../style/footer.scss";

export const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer-content">
        {/* Left Section - Contact & Vision */}
        <div className="footer-section">
          <h3>CONTACT US</h3>
          <div className="vision-section">
            <h2>Let's Discuss Your Trading Strategy. With Us</h2>
            <Link to="/contact" className="schedule-call-btn">
              Schedule a call now →
            </Link>
          </div>
          <div className="email-section">
            <p>OR EMAIL US AT</p>
            <p className="email">support@biscmarket.com</p>
          </div>
        </div>

        {/* Middle Section - Quick Links */}
        <div className="footer-section">
          <h3>QUICK LINKS</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/calendars">Calendars</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            <li>
              <Link to="/login">Login/Account</Link>
            </li>
          </ul>
        </div>

        {/* Right Section - Information */}
        <div className="footer-section">
          <h3>INFORMATION</h3>
          <ul className="footer-links">
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/cookies">Cookies Settings</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="footer-bottom">
        <p>© BISCMARKET 2024. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};
