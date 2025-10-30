import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchThunk } from "../redux/ticker";
import "../style/linechart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StockAnalytics } from "./analyticsChart";

// Utility functions
const formatTimeByInterval = (timestamp, interval) => {
  const date = new Date(timestamp);
  switch (interval) {
    case "5m":
    case "30m":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1h":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1d":
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    case "1wk":
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    case "1mo":
      return date.toLocaleDateString([], {
        month: "short",
        year: "numeric",
      });
    default:
      return date.toLocaleTimeString();
  }
};

const CustomTooltip = ({ active, payload, label, interval }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
        {interval && (
          <p className="tooltip-interval">{interval.toUpperCase()}</p>
        )}
      </div>
    );
  }
  return null;
};

// Custom YAxis Tick Component for Mobile
const CustomYAxisTick = ({ x, y, payload, isMobile }) => {
  if (isMobile) {
    return (
      <text
        x={x + 4}
        y={y}
        dy={2}
        textAnchor="end"
        fill="#666"
        fontSize={5}
        className="y-axis-tick-mobile"
      >
        ${payload.value.toFixed(0)}
      </text>
    );
  }

  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize={11}>
      ${payload.value.toFixed(0)}
    </text>
  );
};

export const IndexChart = () => {
  const dispatch = useDispatch();
  const { data, info, loading, error } = useSelector((state) => state.ticker);
  const [chartData, setChartData] = useState([]);
  const [interval, setInterval] = useState("5m");
  const [change, setChange] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const hasRequested = useRef(false);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      dispatch(searchThunk({ symbol: "AAPL", interval: "5m" }));
    }
  }, [dispatch]);

  // Memoized data processing
  const processChartData = useCallback((rawData, currentInterval) => {
    if (!rawData?.body) return [];

    const firstPrice = rawData.body[0]?.close;
    const lastPrice = rawData.body[rawData.body.length - 1]?.close;

    if (!firstPrice || !lastPrice) return [];

    const changeAmount = lastPrice - firstPrice;
    const changePercent = (changeAmount / firstPrice) * 100;

    const transformedData = rawData.body
      .map((item) => ({
        name: new Date(item.timestamp_unix * 1000),
        uv: Number(item.close),
        timestamp: item.timestamp_unix,
        formattedTime: formatTimeByInterval(
          item.timestamp_unix * 1000,
          currentInterval
        ),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    setChange({
      amount: changeAmount.toFixed(2),
      percent: changePercent.toFixed(2),
      isPositive: changeAmount >= 0,
    });

    return transformedData;
  }, []);

  useEffect(() => {
    if (data) {
      const processedData = processChartData(data, interval);
      setChartData(processedData);
    }
  }, [data, interval, processChartData]);

  const handleIntervalChange = useCallback(
    (newInterval) => {
      setInterval(newInterval);
      dispatch(searchThunk({ symbol: "AAPL", interval: newInterval }));
    },
    [dispatch]
  );

  // Memoized calculations
  const calculateYAxisDomain = useCallback(() => {
    if (chartData.length === 0) return [0, 100];

    const values = chartData.map((item) => item.uv);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // Add padding to domain for better visualization
    return [min - range * 0.02, max + range * 0.02];
  }, [chartData]);

  const getXAxisInterval = useCallback(() => {
    const dataLength = chartData.length;
    if (dataLength <= 8) return 0;
    if (dataLength <= 15) return 1;
    if (dataLength <= 30) return 2;
    if (dataLength <= 60) return 3;
    return Math.floor(dataLength / (isMobile ? 6 : 8));
  }, [chartData, isMobile]);

  const intervals = useMemo(() => ["5m", "30m", "1h", "1d", "1wk", "1mo"], []);

  // Loading state with skeleton screen
  if (loading) {
    return (
      <div id="index-chart-container">
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-price"></div>
          <div className="skeleton-change"></div>
        </div>
        <div className="skeleton-chart">
          <div className="skeleton-intervals">
            {intervals.map((_, index) => (
              <div key={index} className="skeleton-interval"></div>
            ))}
          </div>
          <div className="skeleton-graph"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="index-chart-container">
        <div className="chart-error-state">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h3>Unable to Load Chart</h3>
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={() => dispatch(searchThunk({ symbol: "AAPL", interval }))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="index-chart-container"
      className={isMobile ? "chart-mobile" : "chart-desktop"}
    >
      {/* Header Section */}
      <div id="index-header">
        <div className="header-content">
          <div className="stock-info">
            <h1 className="stock-name">
              {info?.name ? info.name : "Apple Inc. Index"}
              {info?.symbol && (
                <span className="stock-symbol">({info.symbol})</span>
              )}
            </h1>
            <div className="price-change-container">
              <span className="price">${change.amount || "0.00"}</span>
              <span
                className={`change ${
                  change.isPositive ? "positive" : "negative"
                }`}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`change-arrow ${
                    change.isPositive ? "up" : "down"
                  }`}
                >
                  {change.isPositive ? (
                    <path d="M7 14l5-5 5 5z" />
                  ) : (
                    <path d="M7 10l5 5 5-5z" />
                  )}
                </svg>
                {change.percent || "0.00"}%
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button id="add-to-watchlist" className="watchlist-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
              </svg>
              {isMobile ? "Watch" : "Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div id="chart-container">
        {/* Interval Selector */}
        <div className="interval-section">
          <h3 className="section-title">Time Interval</h3>
          <div id="intervals" className="interval-selector">
            {intervals.map((int) => (
              <button
                key={int}
                className={`interval-btn ${interval === int ? "active" : ""}`}
                onClick={() => handleIntervalChange(int)}
              >
                {int}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div id="chart" className="chart-area">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: isMobile ? 15 : 20,
                  right: isMobile ? 5 : 10,
                  left: isMobile ? 6 : 10,
                  bottom: isMobile ? 30 : 30,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  dataKey="formattedTime"
                  tick={{
                    fontSize: isMobile ? 7 : 11,
                    fill: "#666",
                  }}
                  interval={getXAxisInterval()}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                  height={isMobile ? 35 : 40}
                  padding={{ left: 0, right: 1 }}
                />

                <YAxis
                  width={isMobile ? 1 : 50}
                  domain={calculateYAxisDomain()}
                  tick={(props) => (
                    <CustomYAxisTick {...props} isMobile={isMobile} />
                  )}
                  axisLine={false}
                  tickLine={false}
                  tickCount={isMobile ? 6 : 7}
                  mirror={isMobile ? true : false}
                  padding={{ top: 0, bottom: 8 }}
                />

                <Tooltip
                  content={<CustomTooltip interval={interval} />}
                  cursor={{
                    stroke: change.isPositive ? "#48cae4" : "#c9184a",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke={change.isPositive ? "#48cae4" : "#c9184a"}
                  fill="url(#colorGradient)"
                  fillOpacity={0.8}
                  strokeWidth={isMobile ? 1.5 : 2}
                  dot={false}
                  activeDot={{
                    r: isMobile ? 3 : 4,
                    fill: change.isPositive ? "#90e0ef" : "#c9184a",
                    stroke: change.isPositive ? "#46daff" : "#c9184a",
                    strokeWidth: 2,
                  }}
                />

                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={change.isPositive ? "#90e0ef" : "#ffccd5"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={change.isPositive ? "#caf0f8" : "#ff8fa3"}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
              <h3>No Data Available</h3>
              <p>Try selecting a different time interval</p>
            </div>
          )}
        </div>

        {/* Chart Stats */}
        {chartData.length > 0 && (
          <div className="chart-stats">
            <div className="stat">
              <span className="stat-label">Current</span>
              <span className="stat-value">
                ${chartData[chartData.length - 1]?.uv.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Change</span>
              <span
                className={`stat-value ${
                  change.isPositive ? "positive" : "negative"
                }`}
              >
                {change.isPositive ? "+" : ""}
                {change.amount} ({change.isPositive ? "+" : ""}
                {change.percent}%)
              </span>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <StockAnalytics chartData={chartData} interval={interval} />
        )}
      </div>
    </div>
  );
};
