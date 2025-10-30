import { useMemo } from "react";

import {
  calculatePerformanceMetrics,
  calculateTrendAnalysis,
  formatLargeNumber,
  getVolatilityLevel,
  getTrendIcon,
} from "../utils/analytics";

// ... (keep all your existing utility functions and components)

// Add this new component for the analytics section
export const StockAnalytics = ({ chartData, interval }) => {
  const metrics = useMemo(
    () => calculatePerformanceMetrics(chartData),
    [chartData]
  );
  const trendAnalysis = useMemo(
    () => calculateTrendAnalysis(chartData),
    [chartData]
  );

  if (!metrics || !trendAnalysis) return null;

  const volatilityInfo = getVolatilityLevel(metrics.volatility);

  return (
    <div className="analytics-section">
      <h3 className="section-title">Stock Performance Analytics</h3>

      <div className="analytics-grid">
        {/* Key Metrics */}
        <div className="analytics-card">
          <h4 className="card-title">Key Performance Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Total Return</span>
              <span
                className={`metric-value ${
                  metrics.totalReturn >= 0 ? "positive" : "negative"
                }`}
              >
                {metrics.totalReturn >= 0 ? "+" : ""}
                {metrics.totalReturn.toFixed(2)}%
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Volatility</span>
              <div className="metric-with-badge">
                <span className="metric-value">
                  {metrics.volatility.toFixed(1)}%
                </span>
                <span
                  className="volatility-badge"
                  style={{ backgroundColor: volatilityInfo.color }}
                >
                  {volatilityInfo.level}
                </span>
              </div>
            </div>
            <div className="metric-item">
              <span className="metric-label">Max Drawdown</span>
              <span className="metric-value negative">
                -{metrics.maxDrawdown.toFixed(2)}%
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Current Trend</span>
              <div className="metric-with-badge">
                <span className="metric-value">
                  {getTrendIcon(trendAnalysis.trendDirection)}{" "}
                  {trendAnalysis.trendDirection}
                </span>
                <div
                  className="trend-strength"
                  style={{
                    width: `${trendAnalysis.trendStrength}%`,
                    backgroundColor:
                      trendAnalysis.trendDirection === "bullish"
                        ? "#10b981"
                        : trendAnalysis.trendDirection === "bearish"
                        ? "#ef4444"
                        : "#6b7280",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className="analytics-card">
          <h4 className="card-title">Price Levels & Range</h4>
          <div className="price-levels">
            <div className="price-level-item">
              <span className="level-label">Resistance</span>
              <span className="level-value">
                ${metrics.resistanceLevel.toFixed(2)}
              </span>
            </div>
            <div className="price-level-item">
              <span className="level-label">Current</span>
              <span className="level-value current">
                ${metrics.currentPrice.toFixed(2)}
              </span>
            </div>
            <div className="price-level-item">
              <span className="level-label">Support</span>
              <span className="level-value">
                ${metrics.supportLevel.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="price-range-bar">
            <div
              className="range-fill"
              style={{
                left: "0%",
                width: "100%",
                background: `linear-gradient(90deg, #ef4444 0%, #22deff 100%)`,
              }}
            />
            <div
              className="current-price-marker"
              style={{
                left: `${
                  ((metrics.currentPrice - metrics.supportLevel) /
                    (metrics.resistanceLevel - metrics.supportLevel)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Period Returns */}
        <div className="analytics-card">
          <h4 className="card-title">Period Returns</h4>
          <div className="period-returns">
            {Object.entries(metrics.periodReturns).map(
              ([period, returnValue]) => (
                <div key={period} className="period-item">
                  <span className="period-label">
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </span>
                  <span
                    className={`period-value ${
                      returnValue >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {returnValue >= 0 ? "+" : ""}
                    {returnValue.toFixed(2)}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="analytics-card">
          <h4 className="card-title">Trend Analysis</h4>
          <div className="trend-metrics">
            <div className="trend-item">
              <span className="trend-label">Direction</span>
              <span className={`trend-value ${trendAnalysis.trendDirection}`}>
                {trendAnalysis.trendDirection.charAt(0).toUpperCase() +
                  trendAnalysis.trendDirection.slice(1)}
              </span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Strength</span>
              <span className="trend-value">
                {trendAnalysis.trendStrength.toFixed(1)}%
              </span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Momentum</span>
              <span
                className={`trend-value ${
                  trendAnalysis.momentum >= 0 ? "positive" : "negative"
                }`}
              >
                {trendAnalysis.momentum >= 0 ? "+" : ""}
                {trendAnalysis.momentum.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
