import { useState, useEffect, useRef } from "react";
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
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    unlockScroll();
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    lockScroll();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isMenuOpen) return;

    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    // Swipe left to close (only when menu is open)
    if (diff > 50) {
      closeMenu();
    }
  };

  const handleOverlayTouch = (e) => {
    // Close menu when tapping on the right side of overlay (like Twitter)
    const tapX = e.touches ? e.touches[0].clientX : e.clientX;
    const screenWidth = window.innerWidth;

    if (tapX > screenWidth * 0.3) {
      // Tap on right 70% of screen
      closeMenu();
    }
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

  // Add swipe event listeners
  useEffect(() => {
    if (!isMobile) return;

    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;

    if (sidebar) {
      sidebar.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      sidebar.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    if (overlay) {
      overlay.addEventListener("touchstart", handleOverlayTouch, {
        passive: true,
      });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("touchstart", handleTouchStart);
        sidebar.removeEventListener("touchmove", handleTouchMove);
      }
      if (overlay) {
        overlay.removeEventListener("touchstart", handleOverlayTouch);
      }
    };
  }, [isMobile, isMenuOpen]);

  const mainNavItems = navItems(hasToken);

  return (
    <>
      {/* Top Header */}
      <header id="header">
        <div className="container">
          {/* Mobile Menu Toggle - Only show on mobile */}
          {isMobile && (
            <button
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Open menu"
            >
              {/* Hamburger icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>
          )}

          {/* Logo - Hidden when search is open on mobile */}
          {(!isMobile || !isSearchOpen) && (
            <Link to="/" id="logo" onClick={closeMenu}>
              <p>
                𝓑𝓲𝓼𝓬<span>𝓶</span>𝓪𝓻𝓴𝓮𝓽
              </p>
            </Link>
          )}

          {/* Desktop Search */}
          {!isMobile && (
            <div className="desktop-search">
              <Autocomplete />
            </div>
          )}

          {/* Mobile Controls (Search Toggle) */}
          {isMobile && (
            <div className="mobile-controls">
              {/* Search Toggle - Hidden when search is open */}
              {!isSearchOpen && (
                <button
                  className="search-toggle"
                  onClick={toggleSearch}
                  aria-label="Open search"
                >
                  {getIcon("search")}
                </button>
              )}
            </div>
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

        {/* Mobile Menu Overlay with Swipe Support */}
        {isMobile && (
          <div
            ref={overlayRef}
            className={`nav-overlay ${isMenuOpen ? "active" : ""}`}
            onClick={closeMenu}
          />
        )}

        {/* Mobile Sidebar Menu - Now from LEFT side */}
        {isMobile && (
          <div
            ref={sidebarRef}
            className={`mobile-sidebar ${isMenuOpen ? "active" : ""}`}
          >
            <div className="sidebar-header">
              <button
                className="sidebar-close"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                {/* Close icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <nav className="sidebar-nav">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <div className="nav-icon">{getIcon(item.icon)}</div>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
