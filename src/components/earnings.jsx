import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../style/earning.scss";
import { earningsThunk } from "../redux/earnings";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export const Earnings = () => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const hasRequested = useRef(false);
  const { info } = useSelector((state) => state.ticker);
  const { data, loading, error } = useSelector((state) => state.earnings);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (hasRequested.current === false && info) {
      hasRequested.current = true;
      dispatch(earningsThunk(info.symbol));
    }
  }, [dispatch, info]);

  // Data processing for charts
  const processQuarterlyData = () => {
    if (!data?.body?.earnings?.earningsChart?.quarterly) return [];
    return data.body.earnings.earningsChart.quarterly
      .slice()
      .reverse()
      .map((quarter) => ({
        name: quarter.date,
        actual: quarter.actual.raw,
        estimate: quarter.estimate.raw,
        surprise: parseFloat(quarter.surprisePct),
        difference: parseFloat(quarter.difference),
      }));
  };

  const processYearlyData = () => {
    if (!data?.body?.earnings?.financialsChart?.yearly) return [];
    return data.body.earnings.financialsChart.yearly.map((year) => ({
      name: year.date.toString(),
      revenue: year.revenue.raw / 1000000000, // Convert to billions
      earnings: year.earnings.raw / 1000000000, // Convert to billions
      revenueGrowth:
        year.revenue.raw /
          data.body.earnings.financialsChart.yearly[0]?.revenue.raw -
        1,
    }));
  };

  const processEPSTrendData = () => {
    if (!data?.body?.earningsTrend?.trend) return [];
    return data.body.earningsTrend.trend.map((period) => ({
      name:
        period.period === "0q"
          ? "Current Qtr"
          : period.period === "+1q"
          ? "Next Qtr"
          : period.period === "0y"
          ? "Current Year"
          : "Next Year",
      current: period.epsTrend?.current?.raw,
      trend7d: period.epsTrend?.["7daysAgo"]?.raw,
      trend30d: period.epsTrend?.["30daysAgo"]?.raw,
      trend90d: period.epsTrend?.["90daysAgo"]?.raw,
    }));
  };

  const processSurpriseHistory = () => {
    if (!data?.body?.earningsHistory?.history) return [];
    return data.body.earningsHistory.history
      .slice()
      .reverse()
      .map((history) => ({
        name: new Date(history.quarter.raw * 1000).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        surprise: history.surprisePercent.raw * 100,
        actual: history.epsActual.raw,
        estimate: history.epsEstimate.raw,
      }));
  };

  if (loading) {
    return (
      <div className="earnings">
        <div className="skeleton-loader">
          <div className="skeleton-header"></div>
          <div className="skeleton-metrics"></div>
          <div className="skeleton-content">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="earnings">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Earnings Data</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => dispatch(earningsThunk(info.symbol))}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data?.body) {
    return (
      <div className="earnings">
        <div className="empty-state">
          <h3>No Earnings Data Available</h3>
          <p>Select a ticker to view earnings information</p>
        </div>
      </div>
    );
  }

  const { earnings, earningsTrend, earningsHistory } = data.body;
  const nextEarningsDate = earnings.earningsChart.earningsDate?.[0];
  const currentQuarterEstimate = earnings.earningsChart.currentQuarterEstimate;

  const formatCurrency = (value) => {
    if (!value?.fmt) return "N/A";
    return value.fmt;
  };

  const formatPercent = (value) => {
    if (!value?.fmt) return "N/A";
    return value.fmt;
  };

  const getSurpriseColor = (surprisePercent) => {
    const surprise = surprisePercent?.raw || 0;
    if (surprise > 0.05) return "#10b981";
    if (surprise > 0) return "#059669";
    if (surprise < -0.05) return "#ef4444";
    return "#f59e0b";
  };

  const quarterlyData = processQuarterlyData();
  const yearlyData = processYearlyData();
  const epsTrendData = processEPSTrendData();
  const surpriseData = processSurpriseHistory();

  return (
    <div className="earnings">
      {/* Header Section */}
      <div className="earnings-header">
        <div className="header-main">
          <h1>Earnings & Revenue</h1>
          <div className="ticker-info">
            <span className="ticker">{info?.symbol}</span>
            <span className="company-name">{info?.name}</span>
          </div>
        </div>

        {nextEarningsDate && (
          <div className="next-earnings">
            <div className="next-earnings-label">Next Earnings</div>
            <div className="next-earnings-date">
              {new Date(nextEarningsDate.raw * 1000).toLocaleDateString()}
            </div>
            <div className="next-earnings-estimate">
              Est: ${formatCurrency(currentQuarterEstimate)}
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M96 96C113.7 96 128 110.3 128 128L128 464C128 472.8 135.2 480 144 480L544 480C561.7 480 576 494.3 576 512C576 529.7 561.7 544 544 544L144 544C99.8 544 64 508.2 64 464L64 128C64 110.3 78.3 96 96 96zM208 288C225.7 288 240 302.3 240 320L240 384C240 401.7 225.7 416 208 416C190.3 416 176 401.7 176 384L176 320C176 302.3 190.3 288 208 288zM352 224L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224zM432 256C449.7 256 464 270.3 464 288L464 384C464 401.7 449.7 416 432 416C414.3 416 400 401.7 400 384L400 288C400 270.3 414.3 256 432 256zM576 160L576 384C576 401.7 561.7 416 544 416C526.3 416 512 401.7 512 384L512 160C512 142.3 526.3 128 544 128C561.7 128 576 142.3 576 160z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatCurrency(earningsTrend.trend?.[0]?.earningsEstimate?.avg)}
            </div>
            <div className="metric-label">Current Qtr EPS Estimate</div>
            <div className="metric-subtext">
              {earningsTrend.trend?.[0]?.earningsEstimate?.numberOfAnalysts
                ?.raw || 0}{" "}
              Analysts
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            {" "}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M328 112l-144 0-37.3-74.5c-1.8-3.6-2.7-7.6-2.7-11.6 0-14.3 11.6-25.9 25.9-25.9L342.1 0c14.3 0 25.9 11.6 25.9 25.9 0 4-.9 8-2.7 11.6L328 112zM169.6 160l172.8 0 48.7 40.6C457.6 256 496 338 496 424.5 496 472.8 456.8 512 408.5 512l-305.1 0C55.2 512 16 472.8 16 424.5 16 338 54.4 256 120.9 200.6L169.6 160zM260 224c-11 0-20 9-20 20l0 4c-28.8 .3-52 23.7-52 52.5 0 25.7 18.5 47.6 43.9 51.8l41.7 7c6 1 10.4 6.2 10.4 12.3 0 6.9-5.6 12.5-12.5 12.5L216 384c-11 0-20 9-20 20s9 20 20 20l24 0 0 4c0 11 9 20 20 20s20-9 20-20l0-4.7c25-4.1 44-25.7 44-51.8 0-25.7-18.5-47.6-43.9-51.8l-41.7-7c-6-1-10.4-6.2-10.4-12.3 0-6.9 5.6-12.5 12.5-12.5l47.5 0c11 0 20-9 20-20s-9-20-20-20l-8 0 0-4c0-11-9-20-20-20z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatCurrency(earningsTrend.trend?.[0]?.revenueEstimate?.avg)}
            </div>
            <div className="metric-label">Current Qtr Revenue Estimate</div>
            <div className="metric-subtext">
              {earningsTrend.trend?.[0]?.revenueEstimate?.numberOfAnalysts
                ?.raw || 0}{" "}
              Analysts
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M416 224C398.3 224 384 209.7 384 192C384 174.3 398.3 160 416 160L576 160C593.7 160 608 174.3 608 192L608 352C608 369.7 593.7 384 576 384C558.3 384 544 369.7 544 352L544 269.3L374.6 438.7C362.1 451.2 341.8 451.2 329.3 438.7L224 333.3L86.6 470.6C74.1 483.1 53.8 483.1 41.3 470.6C28.8 458.1 28.8 437.8 41.3 425.3L201.3 265.3C213.8 252.8 234.1 252.8 246.6 265.3L352 370.7L498.7 224L416 224z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatPercent(
                earningsTrend.trend?.[0]?.earningsEstimate?.growth
              )}
            </div>
            <div className="metric-label">EPS Growth (YoY)</div>
            <div className="metric-subtext">
              vs{" "}
              {formatCurrency(
                earningsTrend.trend?.[0]?.earningsEstimate?.yearAgoEps
              )}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M128 320L24.5 320c-24.9 0-40.2-27.1-27.4-48.5L50 183.3C58.7 168.8 74.3 160 91.2 160l95 0c76.1-128.9 189.6-135.4 265.5-124.3 12.8 1.9 22.8 11.9 24.6 24.6 11.1 75.9 4.6 189.4-124.3 265.5l0 95c0 16.9-8.8 32.5-23.3 41.2l-88.2 52.9c-21.3 12.8-48.5-2.6-48.5-27.4L192 384c0-35.3-28.7-64-64-64l-.1 0zM400 160a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatPercent(earningsTrend.trend?.[0]?.revenueEstimate?.growth)}
            </div>
            <div className="metric-label">Revenue Growth (YoY)</div>
            <div className="metric-subtext">
              vs{" "}
              {formatCurrency(
                earningsTrend.trend?.[0]?.revenueEstimate?.yearAgoRevenue
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid with Recharts */}
      <div className="content-grid">
        {/* Quarterly EPS Performance Chart */}
        <div className="content-card chart-card">
          <div className="card-header">
            <h3>Quarterly EPS Performance</h3>
            <div className="card-subtitle">Actual vs Estimate</div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%">
              <BarChart
                data={quarterlyData}
                margin={{
                  top: isMobile ? 15 : 20,
                  right: isMobile ? 5 : 10,
                  left: isMobile ? 5 : 10,
                  bottom: isMobile ? 30 : 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <YAxis
                  width={isMobile ? 7 : 50}
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, "Value"]}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="estimate"
                  name="Estimate"
                  fill="#93c5fd"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="actual"
                  name="Actual"
                  fill="#2563eb"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EPS Surprise History */}
        <div className="content-card chart-card">
          <div className="card-header">
            <h3>EPS Surprise History</h3>
            <div className="card-subtitle">% Beat/Miss vs Estimates</div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%">
              <BarChart
                data={surpriseData}
                margin={{
                  top: isMobile ? 15 : 20,
                  right: isMobile ? 5 : 10,
                  left: isMobile ? 5 : 10,
                  bottom: isMobile ? 30 : 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <YAxis
                  width={isMobile ? 7 : 50}
                  tickFormatter={(value) => `${value}%`}
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "surprise")
                      return [`${value.toFixed(2)}%`, "Surprise %"];
                    return [`$${value.toFixed(2)}`, name];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="surprise"
                  name="Surprise %"
                  fill="#8884d8"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Annual Revenue & Earnings Trend */}
        <div className="content-card chart-card">
          <div className="card-header">
            <h3>Annual Financial Performance</h3>
            <div className="card-subtitle">Revenue & Earnings (Billions)</div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%">
              <AreaChart
                data={yearlyData}
                margin={{
                  top: isMobile ? 15 : 20,
                  right: isMobile ? 5 : 10,
                  left: isMobile ? 5 : 10,
                  bottom: isMobile ? 30 : 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <YAxis
                  width={isMobile ? 7 : 50}
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`$${value}B`, ""]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EPS Estimate Trend */}
        <div className="content-card chart-card">
          <div className="card-header">
            <h3>EPS Estimate Trend</h3>
            <div className="card-subtitle">Analyst Revisions Over Time</div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%">
              <LineChart
                data={epsTrendData}
                margin={{
                  top: isMobile ? 15 : 20,
                  right: isMobile ? 5 : 10,
                  left: isMobile ? 5 : 10,
                  bottom: isMobile ? 30 : 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <YAxis
                  width={isMobile ? 7 : 50}
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "#666",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`$${value?.toFixed(2)}`, "EPS"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Estimate"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="trend90d"
                  name="90 Days Ago"
                  stroke="#9ca3af"
                  strokeDasharray="3 3"
                  dot={{ fill: "#9ca3af", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="trend30d"
                  name="30 Days Ago"
                  stroke="#6b7280"
                  strokeDasharray="3 3"
                  dot={{ fill: "#6b7280", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarterly Earnings Table */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Quarterly Performance</h3>
            <div className="card-subtitle">Detailed Breakdown</div>
          </div>
          <div className="card-content">
            <div className="earnings-table">
              <div className="table-header">
                <div>Quarter</div>
                <div>EPS Actual</div>
                <div>EPS Estimate</div>
                <div>Difference</div>
                <div>% Surprise</div>
              </div>
              <div className="table-body">
                {earnings.earningsChart.quarterly
                  ?.slice()
                  .reverse()
                  .map((quarter, index) => (
                    <div key={index} className="table-row">
                      <div className="quarter">{quarter.date}</div>
                      <div className="eps-actual">
                        ${formatCurrency(quarter.actual)}
                      </div>
                      <div className="eps-estimate">
                        ${formatCurrency(quarter.estimate)}
                      </div>
                      <div className="eps-difference">
                        {quarter.difference ? `+${quarter.difference}` : "0.00"}
                      </div>
                      <div
                        className="surprise-percent"
                        style={{
                          color: getSurpriseColor({
                            raw: parseFloat(quarter.surprisePct) / 100,
                          }),
                        }}
                      >
                        +{quarter.surprisePct}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analyst Estimates */}
        <div className="content-card">
          <div className="card-header">
            <h3>Analyst Estimates & Revisions</h3>
            <div className="card-subtitle">Current Quarter Consensus</div>
          </div>
          <div className="card-content">
            {earningsTrend.trend?.[0] && (
              <div className="estimate-range">
                <div className="range-bar">
                  <div className="range-track">
                    <div className="range-fill"></div>
                    <div
                      className="range-current"
                      style={{
                        left: `${
                          ((earningsTrend.trend[0].earningsEstimate.avg.raw -
                            earningsTrend.trend[0].earningsEstimate.low.raw) /
                            (earningsTrend.trend[0].earningsEstimate.high.raw -
                              earningsTrend.trend[0].earningsEstimate.low
                                .raw)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="range-labels">
                  <div className="range-label">
                    <div className="label">Low</div>
                    <div className="value">
                      $
                      {formatCurrency(
                        earningsTrend.trend[0].earningsEstimate.low
                      )}
                    </div>
                  </div>
                  <div className="range-label">
                    <div className="label">Average</div>
                    <div className="value highlight">
                      $
                      {formatCurrency(
                        earningsTrend.trend[0].earningsEstimate.avg
                      )}
                    </div>
                  </div>
                  <div className="range-label">
                    <div className="label">High</div>
                    <div className="value">
                      $
                      {formatCurrency(
                        earningsTrend.trend[0].earningsEstimate.high
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="analyst-counts">
              <div className="analyst-count">
                <span className="count up">
                  +
                  {earningsTrend.trend?.[0]?.epsRevisions?.upLast7days?.raw ||
                    0}
                </span>
                <span className="label">Up (7D)</span>
              </div>
              <div className="analyst-count">
                <span className="count down">
                  -
                  {earningsTrend.trend?.[0]?.epsRevisions?.downLast7Days?.raw ||
                    0}
                </span>
                <span className="label">Down (7D)</span>
              </div>
              <div className="analyst-count">
                <span className="count total">
                  {earningsTrend.trend?.[0]?.earningsEstimate?.numberOfAnalysts
                    ?.raw || 0}
                </span>
                <span className="label">Total Analysts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
