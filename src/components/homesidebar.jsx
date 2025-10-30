import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../style/homesidebar.scss";

export const HomeSidebar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const circleRef = useRef(null);

  console.log(isMobile, isSidebarOpen);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Keep open on desktop by default
      } else {
        setIsSidebarOpen(false); // Closed on mobile by default
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Dragging functionality
  const handleDragStart = (e) => {
    if (!isMobile) return;

    setIsDragging(true);
    if (e.type === "touchstart") {
      dragStartPos.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else {
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleDrag = (e) => {
    if (!isDragging || !isMobile) return;

    e.preventDefault();
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    const newX = clientX - dragStartPos.current.x;
    const newY = clientY - dragStartPos.current.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY)),
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (!isMobile) return;

    const handleMouseMove = (e) => handleDrag(e);
    const handleTouchMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, isMobile]);

  const menuItems = [
    { path: "/home/index", icon: "line", label: "Chart" },
    { path: "/home/profile", icon: "profile", label: "Profile" },
    { path: "/home/earnings", icon: "earnings", label: "Earnings" },
    { path: "/home/income-statement", icon: "IS", label: "Income" },
    { path: "/home/recommendation-trend", icon: "RT", label: "Recommend" },
    { path: "/home/insider-transactions", icon: "IT", label: "Insiders" },
  ];

  const getIcon = (iconType) => {
    const icons = {
      line: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M128 128C128 110.3 113.7 96 96 96C78.3 96 64 110.3 64 128L64 464C64 508.2 99.8 544 144 544L544 544C561.7 544 576 529.7 576 512C576 494.3 561.7 480 544 480L144 480C135.2 480 128 472.8 128 464L128 128zM534.6 214.6C547.1 202.1 547.1 181.8 534.6 169.3C522.1 156.8 501.8 156.8 489.3 169.3L384 274.7L326.6 217.4C314.1 204.9 293.8 204.9 281.3 217.4L185.3 313.4C172.8 325.9 172.8 346.2 185.3 358.7C197.8 371.2 218.1 371.2 230.6 358.7L304 285.3L361.4 342.7C373.9 355.2 394.2 355.2 406.7 342.7L534.7 214.7z" />
        </svg>
      ),
      profile: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z" />
        </svg>
      ),
      earnings: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M416 224C398.3 224 384 209.7 384 192C384 174.3 398.3 160 416 160L576 160C593.7 160 608 174.3 608 192L608 352C608 369.7 593.7 384 576 384C558.3 384 544 369.7 544 352L544 269.3L374.6 438.7C362.1 451.2 341.8 451.2 329.3 438.7L224 333.3L86.6 470.6C74.1 483.1 53.8 483.1 41.3 470.6C28.8 458.1 28.8 437.8 41.3 425.3L201.3 265.3C213.8 252.8 234.1 252.8 246.6 265.3L352 370.7L498.7 224L416 224z" />
        </svg>
      ),
      IS: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM160 160L160 224L224 224L224 160L160 160zM480 160L288 160L288 224L480 224L480 160zM160 288L160 352L224 352L224 288L160 288zM480 288L288 288L288 352L480 352L480 288zM160 416L160 480L224 480L224 416L160 416zM480 416L288 416L288 480L480 480L480 416z" />
        </svg>
      ),
      RT: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M544 72C544 58.7 533.3 48 520 48L418.2 48C404.9 48 394.2 58.7 394.2 72C394.2 85.3 404.9 96 418.2 96L462.1 96L350.8 207.3L255.7 125.8C246.7 118.1 233.5 118.1 224.5 125.8L112.5 221.8C102.4 230.4 101.3 245.6 109.9 255.6C118.5 265.6 133.7 266.8 143.7 258.2L240.1 175.6L336.5 258.2C346 266.4 360.2 265.8 369.1 256.9L496.1 129.9L496.1 173.8C496.1 187.1 506.8 197.8 520.1 197.8C533.4 197.8 544.1 187.1 544.1 173.8L544 72zM112 320C85.5 320 64 341.5 64 368L64 528C64 554.5 85.5 576 112 576L528 576C554.5 576 576 554.5 576 528L576 368C576 341.5 554.5 320 528 320L112 320zM159.3 376C155.9 396.1 140.1 412 119.9 415.4C115.5 416.1 111.9 412.5 111.9 408.1L111.9 376.1C111.9 371.7 115.5 368.1 119.9 368.1L151.9 368.1C156.3 368.1 160 371.7 159.2 376.1zM159.3 520.1C160 524.5 156.4 528.1 152 528.1L120 528.1C115.6 528.1 112 524.5 112 520.1L112 488.1C112 483.7 115.6 480 120 480.8C140.1 484.2 156 500 159.4 520.2zM520 480.7C524.4 480 528 483.6 528 488L528 520C528 524.4 524.4 528 520 528L488 528C483.6 528 479.9 524.4 480.7 520C484.1 499.9 499.9 484 520.1 480.6zM480.7 376C480 371.6 483.6 368 488 368L520 368C524.4 368 528 371.6 528 376L528 408C528 412.4 524.4 416.1 520 415.3C499.9 411.9 484 396.1 480.6 375.9zM256 448C256 412.7 284.7 384 320 384C355.3 384 384 412.7 384 448C384 483.3 355.3 512 320 512C284.7 512 256 483.3 256 448z" />
        </svg>
      ),
      IT: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M300.9 149.2L184.3 278.8C179.7 283.9 179.9 291.8 184.8 296.7C215.3 327.2 264.8 327.2 295.3 296.7L327.1 264.9C331.3 260.7 336.6 258.4 342 258C348.8 257.4 355.8 259.7 361 264.9L537.6 440L608 384L608 96L496 160L472.2 144.1C456.4 133.6 437.9 128 418.9 128L348.5 128C347.4 128 346.2 128 345.1 128.1C328.2 129 312.3 136.6 300.9 149.2zM148.6 246.7L255.4 128L215.8 128C190.3 128 165.9 138.1 147.9 156.1L144 160L32 96L32 384L188.4 514.3C211.4 533.5 240.4 544 270.3 544L286 544L279 537C269.6 527.6 269.6 512.4 279 503.1C288.4 493.8 303.6 493.7 312.9 503.1L353.9 544.1L362.9 544.1C382 544.1 400.7 539.8 417.7 531.8L391 505C381.6 495.6 381.6 480.4 391 471.1C400.4 461.8 415.6 461.7 424.9 471.1L456.9 503.1L474.4 485.6C483.3 476.7 485.9 463.8 482 452.5L344.1 315.7L329.2 330.6C279.9 379.9 200.1 379.9 150.8 330.6C127.8 307.6 126.9 270.7 148.6 246.6z" />
        </svg>
      ),
    };
    return icons[iconType] || icons.line;
  };

  if (isMobile) {
    return (
      <>
        {/* Draggable Circle Button */}
        <div
          ref={circleRef}
          className={`mobile-sidebar-circle ${isSidebarOpen ? "open" : ""} ${
            isDragging ? "dragging" : ""
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={(e) => {
            // Only toggle if not dragging (small movement)
            if (!isDragging) {
              toggleSidebar();
            }
          }}
        >
          <div className="circle-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {isSidebarOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              )}
            </svg>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`home-sidebar ${isSidebarOpen ? "open" : ""} ${
            isMobile ? "mobile" : ""
          }`}
        >
          <div className="sidebar-content">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
                title={item.label}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="sidebar-icon">{getIcon(item.icon)}</div>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </>
    );
  } else
    return (
      <div className="home-sidebar open">
        <div className="sidebar-content">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
              title={item.label}
            >
              <div className="sidebar-icon">{getIcon(item.icon)}</div>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
};
