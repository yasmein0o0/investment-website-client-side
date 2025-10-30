import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { calendersThunk } from "../redux/calenders";
import "../style/calenders.scss";

export function Calenders() {
  const dispatch = useDispatch();
  const hasRequested = useRef(false);
  const { data, error, loading } = useSelector((state) => state.calenders);
  const [activeTab, setActiveTab] = useState("earnings");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (hasRequested.current === false) {
      hasRequested.current = true;
      dispatch(calendersThunk());
    }
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Loading and Error States
  if (loading) {
    return (
      <div className="calenders-container">
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <p>Loading financial events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calenders-container">
        <div className="calendar-error">
          <h2>Financial Calendar</h2>
          <p>Unable to load calendar data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (data) {
    const events = data?.finance?.result?.mixedEvents || [];
    const allRecords = [];

    events.forEach((dayEvent) => {
      if (dayEvent.records && dayEvent.records.length > 0) {
        dayEvent.records.forEach((record) => {
          if (record.earnings) {
            allRecords.push({ ...record, type: "earnings" });
          } else if (record.economicEvents) {
            allRecords.push({ ...record, type: "economic" });
          }
        });
      }
    });

    const earningsEvents = allRecords.filter(
      (record) => record.type === "earnings"
    );
    const economicEvents = allRecords.filter(
      (record) => record.type === "economic"
    );

    const sortByTime = (a, b) =>
      (a.eventTime || a.startDateTime) - (b.eventTime || b.startDateTime);
    earningsEvents.sort(sortByTime);
    economicEvents.sort(sortByTime);

    const getCurrentEvents = () => {
      return activeTab === "earnings" ? earningsEvents : economicEvents;
    };

    const currentEvents = getCurrentEvents();
    const totalPages = Math.ceil(currentEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEventsPage = currentEvents.slice(startIndex, endIndex);

    const formatTime = (timestamp) => {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const formatFullDate = (timestamp) => {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const PaginationControls = () => (
      <div className="pagination-controls">
        <button
          className="pagination-btn prev-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Previous
        </button>

        <div className="page-info">
          <span className="page-numbers">
            Page {currentPage} of {totalPages}
          </span>
          <span className="items-info">
            {startIndex + 1}-{Math.min(endIndex, currentEvents.length)} of{" "}
            {currentEvents.length} events
          </span>
        </div>

        <button
          className="pagination-btn next-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    );

    // Enhanced Mobile Card Component
    const MobileEventCard = ({ event, type, index }) => {
      const isEarnings = type === "earnings";
      const surprisePercent = event.surprisePercent;

      return (
        <div
          className={`mobile-event-card ${
            isEarnings ? "earnings-card" : "economic-card"
          }`}
        >
          <div className="card-header">
            <div className="card-badge">
              {isEarnings ? "Earnings" : "Economic"}
            </div>
            <div className="card-date">
              {formatFullDate(
                isEarnings ? event.startDateTime : event.eventTime
              )}
            </div>
          </div>

          <div className="card-content">
            {isEarnings ? (
              <>
                <div className="card-main-info">
                  <div className="symbol-name">
                    <span className="symbol">{event.ticker || "-"}</span>
                    <span className="company">
                      {event.companyShortName || event.ticker || "-"}
                    </span>
                  </div>
                  <div className="time-info">
                    <span className="time">
                      {formatTime(event.startDateTime)}
                    </span>
                    <span className="call-type">
                      {event.startDateTimeType || "-"}
                    </span>
                  </div>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <label>EPS Estimate</label>
                    <span className="value">
                      {event.epsEstimate ? event.epsEstimate.toFixed(2) : "-"}
                    </span>
                  </div>
                  <div className="stat">
                    <label>Reported EPS</label>
                    <span
                      className={`value ${event.epsActual ? "reported" : ""}`}
                    >
                      {event.epsActual ? event.epsActual.toFixed(2) : "-"}
                    </span>
                  </div>
                  <div className="stat">
                    <label>Surprise</label>
                    <span
                      className={`value surprise ${
                        surprisePercent > 0
                          ? "positive"
                          : surprisePercent < 0
                          ? "negative"
                          : ""
                      }`}
                    >
                      {surprisePercent
                        ? `${
                            surprisePercent > 0 ? "+" : ""
                          }${surprisePercent.toFixed(2)}%`
                        : "-"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="card-main-info">
                  <div className="event-title">
                    <h4>{event.event || "-"}</h4>
                    <div className="country-period">
                      {event.countryCode && (
                        <span className="country-flag">
                          {event.countryCode}
                        </span>
                      )}
                      <span className="period">{event.period || "-"}</span>
                    </div>
                  </div>
                  <div className="time-info">
                    <span className="time">{formatTime(event.eventTime)}</span>
                  </div>
                </div>

                <div className="card-stats economic-stats">
                  <div className="stat">
                    <label>Actual</label>
                    <span className="value actual">{event.actual || "-"}</span>
                  </div>
                  <div className="stat">
                    <label>Forecast</label>
                    <span className="value forecast">
                      {event.forecast || "-"}
                    </span>
                  </div>
                  <div className="stat">
                    <label>Previous</label>
                    <span className="value previous">
                      {event.previous || "-"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    };

    // Desktop Table Row Component
    const DesktopTableRow = ({ event, type, index }) => {
      const isEarnings = type === "earnings";
      const surprisePercent = event.surprisePercent;

      if (isEarnings) {
        return (
          <div className="table-row earnings-row">
            <div className="cell symbol-cell">
              <span className="ticker">{event.ticker || "-"}</span>
              <span className="company-name">
                {event.companyShortName || "-"}
              </span>
            </div>
            <div className="cell date-cell">
              {formatDate(event.startDateTime)}
            </div>
            <div className="cell time-cell">
              {formatTime(event.startDateTime)}
            </div>
            <div className="cell type-cell">
              {event.startDateTimeType || "-"}
            </div>
            <div className="cell estimate-cell">
              {event.epsEstimate ? event.epsEstimate.toFixed(2) : "-"}
            </div>
            <div className="cell reported-cell">
              {event.epsActual ? event.epsActual.toFixed(2) : "-"}
            </div>
            <div
              className={`cell surprise-cell ${
                surprisePercent > 0
                  ? "positive"
                  : surprisePercent < 0
                  ? "negative"
                  : ""
              }`}
            >
              {surprisePercent
                ? `${surprisePercent > 0 ? "+" : ""}${surprisePercent.toFixed(
                    2
                  )}%`
                : "-"}
            </div>
          </div>
        );
      } else {
        return (
          <div className="table-row economic-row">
            <div className="cell date-cell">{formatDate(event.eventTime)}</div>
            <div className="cell time-cell">{formatTime(event.eventTime)}</div>
            <div className="cell country-cell">
              {event.countryCode ? (
                <span className="country-flag">{event.countryCode}</span>
              ) : (
                "-"
              )}
            </div>
            <div className="cell event-cell">{event.event || "-"}</div>
            <div className="cell period-cell">{event.period || "-"}</div>
            <div className="cell actual-cell">{event.actual || "-"}</div>
            <div className="cell forecast-cell">{event.forecast || "-"}</div>
            <div className="cell previous-cell">{event.previous || "-"}</div>
          </div>
        );
      }
    };

    return (
      <div className="calenders-container">
        <div className="calendar-header">
          <h1 className="calendar-title">Financial Calendar</h1>
        </div>

        <div className="calendar-main">
          {/* Tab Navigation */}
          <div className="calendar-tabs">
            <button
              className={`tab ${activeTab === "earnings" ? "active" : ""}`}
              onClick={() => setActiveTab("earnings")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.56.62 4.18 1.63 4.18 3.68 0 1.8-1.39 2.83-3.13 3.16z" />
              </svg>
              Earnings Calls
            </button>
            <button
              className={`tab ${activeTab === "economic" ? "active" : ""}`}
              onClick={() => setActiveTab("economic")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Economic Events
            </button>
          </div>

          {/* Events Container */}
          <div className="events-container">
            {!isMobile && (
              <div
                className={`table-header ${
                  activeTab === "earnings"
                    ? "earnings-header"
                    : "economic-header"
                }`}
              >
                {activeTab === "earnings" ? (
                  <>
                    <div className="header-cell">Company</div>
                    <div className="header-cell">Date</div>
                    <div className="header-cell">Time</div>
                    <div className="header-cell">Type</div>
                    <div className="header-cell">EPS Estimate</div>
                    <div className="header-cell">Reported EPS</div>
                    <div className="header-cell">Surprise</div>
                  </>
                ) : (
                  <>
                    <div className="header-cell">Date</div>
                    <div className="header-cell">Time</div>
                    <div className="header-cell">Country</div>
                    <div className="header-cell">Event</div>
                    <div className="header-cell">Period</div>
                    <div className="header-cell">Actual</div>
                    <div className="header-cell">Forecast</div>
                    <div className="header-cell">Previous</div>
                  </>
                )}
              </div>
            )}

            <div className="events-body">
              {currentEventsPage.map((event, index) =>
                isMobile ? (
                  <MobileEventCard
                    key={`${activeTab}-mobile-${index}-${
                      event.ticker || event.event
                    }`}
                    event={event}
                    type={activeTab}
                    index={index}
                  />
                ) : (
                  <DesktopTableRow
                    key={`${activeTab}-desktop-${index}-${
                      event.ticker || event.event
                    }`}
                    event={event}
                    type={activeTab}
                    index={index}
                  />
                )
              )}
            </div>

            {currentEvents.length === 0 && (
              <div className="no-events">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
                </svg>
                <h3>No events found</h3>
                <p>
                  There are no {activeTab} events scheduled for this period.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {currentEvents.length > 0 && <PaginationControls />}
        </div>
      </div>
    );
  }

  return null;
}
