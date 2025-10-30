import { DataBox } from "./databox.jsx";
import { useDispatch, useSelector } from "react-redux";
import "../style/sidebar.scss";
import { useEffect, useRef, useState } from "react";
import { moversThunk } from "../redux/movers.js";

export function Sidebar() {
  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => state.movers);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current === false) {
      hasRequested.current = true;
      dispatch(moversThunk());
    }
  });

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  if (data) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`}
          onClick={closeMobileSidebar}
        />

        <div id="sidebar" className={isMobileOpen ? "mobile-open" : ""}>
          <div id="watchlists-container">
            <DataBox
              title={data.finance.result[0].title}
              data={data.finance.result[0].quotes}
            />
            <DataBox
              title={data.finance.result[1].title}
              data={data.finance.result[1].quotes}
            />
            <DataBox
              title={data.finance.result[2].title}
              data={data.finance.result[2].quotes}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <button className="sidebar-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <div id="sidebar"></div>
      </>
    );
  }
}
