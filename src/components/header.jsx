import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Autocomplete } from "./searchbar";
import { useAuthCheck } from "../utils/useAuthCheck";
import { useDevice, useScrollLock } from "../utils/deviceUtils";
import { getIcon, navItems } from "../utils/iconUtils";
import "../style/header.scss";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isMobile } = useDevice();
  const { lockScroll, unlockScroll } = useScrollLock();
  const { hasToken } = useAuthCheck();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    unlockScroll();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  // Handle scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isMobile, isMenuOpen, lockScroll, unlockScroll]);

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
    closeSearch();
  }, [location, hasToken]);

  const mainNavItems = navItems(hasToken);

  return (
    <>
      {/* Top Header */}
      <header id="header">
        <div className="container">
          {/* Logo - Hidden when search is open on mobile */}
          {(!isMobile || !isSearchOpen) && (
            <Link to="/" id="logo" onClick={closeMenu}>
              <p>
                𝓑𝓲𝓼𝓬<span>𝓶</span>𝓪𝓻𝓴𝓮𝓽
              </p>
            </Link>
          )}

          {/* Desktop Search */}
          {!isMobile && <Autocomplete />}

          {/* Mobile Search Toggle - Hidden when search is open */}
          {isMobile && !isSearchOpen && (
            <button
              className="search-toggle"
              onClick={toggleSearch}
              aria-label="Open search"
            >
              {getIcon("search")}
            </button>
          )}

          {/* Mobile Search Bar - Takes full width when open */}
          {isMobile && isSearchOpen && (
            <div className="mobile-search-fullscreen">
              <button
                className="search-back"
                onClick={closeSearch}
                aria-label="Close search"
              >
                {getIcon("back")}
              </button>
              <Autocomplete onSearchClose={closeSearch} />
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="nav desktop-nav">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <div className="nav-overlay active" onClick={closeMenu} />
        )}
      </header>

      {/* Bottom Navigation Bar (Mobile Only) */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-link ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <div className="bottom-nav-icon">{getIcon(item.icon)}</div>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
