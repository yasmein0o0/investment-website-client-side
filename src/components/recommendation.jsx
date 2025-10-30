// RecommendationTrend.jsx
import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recommendationThunk } from "../redux/recommendation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../style/recommendation.scss";

export const RecommendationTrend = () => {
  const dispatch = useDispatch();
  const hasRequested = useRef(false);
  const { info } = useSelector((state) => state.ticker);
  const { data, loading, error } = useSelector((state) => state.recommendation);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (hasRequested.current === false && info) {
      hasRequested.current = true;
      dispatch(recommendationThunk(info.symbol));
    }
  }, [dispatch, info]);

  const getPeriodLabel = (period) => {
    const periods = {
      "0m": "Current",
      "-1m": "1M Ago",
      "-2m": "2M Ago",
      "-3m": "3M Ago",
    };
    return periods[period] || period;
  };

  // Process data
  const { currentRecommendation, trendData, summary } = useMemo(() => {
    if (!data?.body?.trend) return {};

    const trend = data.body.trend.map((period) => ({
      ...period,
      period: getPeriodLabel(period.period),
      total:
        period.strongBuy +
        period.buy +
        period.hold +
        period.sell +
        period.strongSell,
      buyPercentage:
        ((period.strongBuy + period.buy) /
          (period.strongBuy +
            period.buy +
            period.hold +
            period.sell +
            period.strongSell)) *
        100,
    }));

    const current = trend[0];
    const previous = trend[1];

    return {
      currentRecommendation: current,
      trendData: trend,
      summary: {
        totalAnalysts: current.total,
        buyRating: current.strongBuy + current.buy,
        holdRating: current.hold,
        sellRating: current.sell + current.strongSell,
        buyPercentage: current.buyPercentage,
        change: previous ? current.total - previous.total : 0,
      },
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">{label}</div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="label">Strong Buy</span>
              <span className="value strong-buy">{data.strongBuy}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Buy</span>
              <span className="value buy">{data.buy}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Hold</span>
              <span className="value hold">{data.hold}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Sell</span>
              <span className="value sell">{data.sell}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Strong Sell</span>
              <span className="value strong-sell">{data.strongSell}</span>
            </div>
            <div className="tooltip-total">Total: {data.total} analysts</div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="recommendation-trend">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analyst recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-trend">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load recommendations</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => dispatch(recommendationThunk(info.symbol))}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentRecommendation) {
    return (
      <div className="recommendation-trend">
        <div className="empty-state">
          <h3>No recommendation data</h3>
          <p>Select a ticker to view analyst recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-trend">
      {/* Header */}
      <div className="header">
        <div className="title-section">
          <h1>Analyst Recommendations</h1>
          <div className="subtitle">
            <span className="ticker">{info?.symbol}</span>
            <span className="company">{info?.name}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{summary.totalAnalysts}</div>
          <div className="metric-label">Total Analysts</div>
          {summary.change !== 0 && (
            <div
              className={`metric-change ${
                summary.change > 0 ? "positive" : "negative"
              }`}
            >
              {summary.change > 0 ? "+" : ""}
              {summary.change}
            </div>
          )}
        </div>

        <div className="metric-card highlight">
          <div className="metric-value">{summary.buyRating}</div>
          <div className="metric-label">Buy Ratings</div>
          <div className="metric-percentage">
            {summary.buyPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{summary.holdRating}</div>
          <div className="metric-label">Hold Ratings</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{summary.sellRating}</div>
          <div className="metric-label">Sell Ratings</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="section-header">
          <h2>Recommendation Trend</h2>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color strong-buy"></div>
              <span>Strong Buy</span>
            </div>
            <div className="legend-item">
              <div className="legend-color buy"></div>
              <span>Buy</span>
            </div>
            <div className="legend-item">
              <div className="legend-color hold"></div>
              <span>Hold</span>
            </div>
            <div className="legend-item">
              <div className="legend-color sell"></div>
              <span>Sell</span>
            </div>
            <div className="legend-item">
              <div className="legend-color strong-sell"></div>
              <span>Strong Sell</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%">
            <BarChart
              data={trendData}
              margin={{
                top: isMobile ? 15 : 20,
                right: isMobile ? 10 : 10,
                left: isMobile ? -30 : 10,
                bottom: isMobile ? 30 : 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                width={isMobile ? 1 : 50}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickCount={isMobile ? 6 : 7}
                padding={{ top: 0, bottom: 8 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="strongBuy" stackId="a" fill="#10b981" />
              <Bar dataKey="buy" stackId="a" fill="#3b82f6" />
              <Bar dataKey="hold" stackId="a" fill="#f59e0b" />
              <Bar dataKey="sell" stackId="a" fill="#f97316" />
              <Bar dataKey="strongSell" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Distribution */}
      <div className="distribution-section">
        <h2>Current Distribution</h2>
        <div className="distribution-bars">
          {[
            {
              label: "Strong Buy",
              value: currentRecommendation.strongBuy,
              color: "#10b981",
            },
            {
              label: "Buy",
              value: currentRecommendation.buy,
              color: "#3b82f6",
            },
            {
              label: "Hold",
              value: currentRecommendation.hold,
              color: "#f59e0b",
            },
            {
              label: "Sell",
              value: currentRecommendation.sell,
              color: "#f97316",
            },
            {
              label: "Strong Sell",
              value: currentRecommendation.strongSell,
              color: "#ef4444",
            },
          ].map((item, index) => (
            <div key={index} className="distribution-item">
              <div className="distribution-label">
                <span>{item.label}</span>
                <span className="distribution-count">{item.value}</span>
              </div>
              <div className="distribution-bar">
                <div
                  className="distribution-fill"
                  style={{
                    width: `${
                      (item.value / currentRecommendation.total) * 100
                    }%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
              <div className="distribution-percentage">
                {((item.value / currentRecommendation.total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
