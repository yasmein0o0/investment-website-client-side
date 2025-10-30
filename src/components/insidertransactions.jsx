// InsiderTransactions.jsx
import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { insiderThunk } from "../redux/insidertransactions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "../style/insidertransactions.scss";

export const InsiderTransactions = () => {
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const hasRequested = useRef(false);
  const { info } = useSelector((state) => state.ticker);
  const { data, loading, error } = useSelector(
    (state) => state.insidertransactions
  );
  const [filter, setFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("3m");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (hasRequested.current === false && info) {
      hasRequested.current = true;
      dispatch(insiderThunk(info.symbol));
    }
  }, [dispatch, info]);

  // Process insider data
  const { transactions, summary, chartData } = useMemo(() => {
    if (!data?.body?.transactions)
      return { transactions: [], summary: {}, chartData: [] };

    const allTransactions = data.body.transactions;

    // Filter by timeframe
    const now = Date.now();
    const timeframeMs = {
      "1m": 30 * 24 * 60 * 60 * 1000,
      "3m": 90 * 24 * 60 * 60 * 1000,
      "6m": 180 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }[timeframe];

    const filteredTransactions = allTransactions.filter((tx) => {
      const txDate = new Date(tx.startDate.raw * 1000);
      return now - txDate.getTime() <= timeframeMs;
    });

    // Calculate summary
    const totalTransactions = filteredTransactions.length;
    const totalValue = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.value?.raw || 0),
      0
    );
    const totalShares = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.shares?.raw || 0),
      0
    );

    const sales = filteredTransactions.filter(
      (tx) =>
        tx.transactionText?.includes("Sale") ||
        tx.transactionText?.includes("sell")
    ).length;

    const purchases = filteredTransactions.filter(
      (tx) =>
        tx.transactionText?.includes("Purchase") ||
        tx.transactionText?.includes("buy")
    ).length;

    const gifts = filteredTransactions.filter((tx) =>
      tx.transactionText?.includes("Gift")
    ).length;

    // Prepare chart data (transactions by month)
    const monthlyData = filteredTransactions.reduce((acc, tx) => {
      const date = new Date(tx.startDate.raw * 1000);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          sales: 0,
          purchases: 0,
          gifts: 0,
          total: 0,
        };
      }

      const isSale = tx.transactionText?.includes("Sale");
      const isGift = tx.transactionText?.includes("Gift");

      if (isSale) acc[monthKey].sales += tx.shares?.raw || 0;
      else if (isGift) acc[monthKey].gifts += tx.shares?.raw || 0;
      else acc[monthKey].purchases += tx.shares?.raw || 0;

      acc[monthKey].total += tx.shares?.raw || 0;

      return acc;
    }, {});

    const chartData = Object.values(monthlyData).slice(-6); // Last 6 months

    return {
      transactions: filteredTransactions,
      summary: {
        totalTransactions,
        totalValue,
        totalShares,
        sales,
        purchases,
        gifts,
        avgTransactionValue: totalValue / totalTransactions,
      },
      chartData,
    };
  }, [data, timeframe]);

  const formatCurrency = (value, compact = true) => {
    if (!value || value.raw === 0) return "—";

    if (compact) {
      return value.fmt || `$${(value.raw / 1000000).toFixed(2)}M`;
    }
    return (
      value.fmt ||
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value.raw)
    );
  };

  const formatShares = (shares) => {
    if (!shares?.raw) return "—";
    return shares.fmt || new Intl.NumberFormat("en-US").format(shares.raw);
  };

  const getTransactionType = (transaction) => {
    if (transaction.transactionText?.includes("Sale")) return "sale";
    if (transaction.transactionText?.includes("Purchase")) return "purchase";
    if (transaction.transactionText?.includes("Gift")) return "gift";
    return "other";
  };

  const getTransactionColor = (transaction) => {
    const type = getTransactionType(transaction);
    switch (type) {
      case "sale":
        return "#ef4444"; // Red for sales
      case "purchase":
        return "#10b981"; // Green for purchases
      case "gift":
        return "#8b5cf6"; // Purple for gifts
      default:
        return "#6b7280"; // Gray for others
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">{label}</div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-row">
                <span className="label" style={{ color: entry.color }}>
                  {entry.name}
                </span>
                <span className="value">
                  {entry.value.toLocaleString()} shares
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="insider-transactions">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading insider transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insider-transactions">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load insider transactions</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => dispatch(insiderThunk(info.symbol))}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="insider-transactions">
        <div className="empty-state">
          <h3>No insider transactions</h3>
          <p>No insider trading activity found for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insider-transactions">
      {/* Header */}
      <div className="header">
        <div className="title-section">
          <h1>Insider Transactions</h1>
          <div className="subtitle">
            <span className="ticker">{info?.symbol}</span>
            <span className="company">{info?.name}</span>
          </div>
        </div>

        <div className="controls">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{summary.totalTransactions}</div>
          <div className="metric-label">Total Transactions</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {formatCurrency({ raw: summary.totalValue })}
          </div>
          <div className="metric-label">Total Value</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{summary.sales}</div>
          <div className="metric-label">Sales</div>
          <div className="metric-change negative">-</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{summary.purchases}</div>
          <div className="metric-label">Purchases</div>
          <div className="metric-change positive">+</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="chart-section">
        <div className="section-header">
          <h2>Insider Trading Activity</h2>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color sales"></div>
              <span>Sales</span>
            </div>
            <div className="legend-item">
              <div className="legend-color purchases"></div>
              <span>Purchases</span>
            </div>
            <div className="legend-item">
              <div className="legend-color gifts"></div>
              <span>Gifts</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%">
            <BarChart
              data={chartData}
              margin={{
                top: isMobile ? 15 : 20,
                right: isMobile ? 5 : 10,
                left: isMobile ? 17 : 10,
                bottom: isMobile ? 10 : 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: isMobile ? 7 : 12 }}
              />
              <YAxis
                width={isMobile ? 9 : 50}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: isMobile ? 7 : 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Sales" fill="#ef4444" />
              <Bar dataKey="purchases" name="Purchases" fill="#10b981" />
              <Bar dataKey="gifts" name="Gifts" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <div className="transaction-count">
            {transactions.length} transactions
          </div>
        </div>

        <div className="transactions-table">
          <div className="table-header">
            <div className="table-cell name">Insider</div>
            <div className="table-cell position">Position</div>
            <div className="table-cell type">Type</div>
            <div className="table-cell shares">Shares</div>
            <div className="table-cell value">Value</div>
            <div className="table-cell date">Date</div>
          </div>

          <div className="table-body">
            {transactions.slice(0, 50).map((transaction, index) => (
              <div key={index} className="table-row">
                <div className="table-cell name">
                  <div className="insider-info">
                    <div>
                      <div className="insider-name">
                        {transaction.filerName}
                      </div>
                      <div className="transaction-desc">
                        {transaction.transactionText || "Transaction"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-cell position">
                  {transaction.filerRelation}
                </div>

                <div className="table-cell type">
                  <span
                    className={`transaction-type ${getTransactionType(
                      transaction
                    )}`}
                    style={{ color: getTransactionColor(transaction) }}
                  >
                    {getTransactionType(transaction).toUpperCase()}
                  </span>
                </div>

                <div className="table-cell shares">
                  {formatShares(transaction.shares)}
                </div>

                <div className="table-cell value">
                  {formatCurrency(transaction.value)}
                </div>

                <div className="table-cell date">
                  {transaction.startDate.fmt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <h2>Transaction Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">{summary.sales}</div>
            <div className="summary-label">Sales Transactions</div>
            <div className="summary-percentage">
              {((summary.sales / summary.totalTransactions) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-value">{summary.purchases}</div>
            <div className="summary-label">Purchase Transactions</div>
            <div className="summary-percentage">
              {((summary.purchases / summary.totalTransactions) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-value">{summary.gifts}</div>
            <div className="summary-label">Gift Transactions</div>
            <div className="summary-percentage">
              {((summary.gifts / summary.totalTransactions) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-value">
              {formatCurrency({ raw: summary.avgTransactionValue })}
            </div>
            <div className="summary-label">Avg. Transaction Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};
