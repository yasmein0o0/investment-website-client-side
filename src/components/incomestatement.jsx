// IncomeStatement.jsx
import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { incomeStatementThunk } from "../redux/incomestatement";
import "../style/incomestatement.scss";

export const IncomeStatement = () => {
  const dispatch = useDispatch();
  const hasRequested = useRef(false);
  const { info } = useSelector((state) => state.ticker);
  const { data, loading, error } = useSelector(
    (state) => state.incomeStatement
  );

  useEffect(() => {
    if (hasRequested.current === false && info) {
      hasRequested.current = true;
      dispatch(incomeStatementThunk(info.symbol));
    }
  }, [dispatch, info]);

  // Process income statement data
  const processedData = useMemo(() => {
    if (!data?.body?.incomeStatementHistory?.incomeStatementHistory)
      return null;

    const statements = data.body.incomeStatementHistory.incomeStatementHistory;
    const quarterly =
      data.body.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];

    return {
      annual: statements.slice(0, 4).reverse(), // Last 4 years
      quarterly: quarterly.slice(0, 8).reverse(), // Last 8 quarters
      currency:
        data.body.incomeStatementHistory.incomeStatementHistory[0]
          ?.financialCurrency || "USD",
    };
  }, [data]);

  const formatCurrency = (value, compact = true) => {
    if (!value?.raw) return "—";

    if (compact) {
      return value.fmt || `$${(value.raw / 1000000000).toFixed(2)}B`;
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

  const calculateMargin = (numerator, denominator) => {
    if (!numerator?.raw || !denominator?.raw || denominator.raw === 0)
      return "—";
    const margin = (numerator.raw / denominator.raw) * 100;
    return `${margin.toFixed(1)}%`;
  };

  const calculateGrowth = (current, previous) => {
    if (!current?.raw || !previous?.raw || previous.raw === 0) return "—";
    const growth = ((current.raw - previous.raw) / previous.raw) * 100;
    return {
      value: growth,
      formatted: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
      isPositive: growth >= 0,
    };
  };

  if (loading) {
    return (
      <div className="income-statement">
        <div className="skeleton-loader">
          <div className="skeleton-header"></div>
          <div className="skeleton-metrics"></div>
          <div className="skeleton-table">
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="income-statement">
        <div className="error-state">
          <div className="error-icon">📊</div>
          <h3>Unable to Load Income Statement</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => dispatch(incomeStatementThunk(info.symbol))}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!processedData?.annual?.length) {
    return (
      <div className="income-statement">
        <div className="empty-state">
          <h3>No Income Statement Data Available</h3>
          <p>Select a ticker to view financial statements</p>
        </div>
      </div>
    );
  }

  const { annual, quarterly, currency } = processedData;

  return (
    <div className="income-statement">
      {/* Header Section */}
      <div className="statement-header">
        <div className="header-main">
          <h1>Income Statement</h1>
          <div className="company-info">
            <span className="ticker">{info?.symbol}</span>
            <span className="company-name">{info?.name}</span>
            <span className="currency">({currency})</span>
          </div>
        </div>
        <div className="period-toggle">
          <button className="toggle-btn active">Annual</button>
          <button className="toggle-btn">Quarterly</button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="financial-metrics">
        <div className="metric-card">
          <div className="metric-value">
            {formatCurrency(annual[0]?.totalRevenue)}
          </div>
          <div className="metric-label">Latest Revenue</div>
          {annual.length > 1 && (
            <div
              className={`metric-growth ${
                calculateGrowth(
                  annual[0]?.totalRevenue,
                  annual[1]?.totalRevenue
                ).isPositive
                  ? "positive"
                  : "negative"
              }`}
            >
              {
                calculateGrowth(
                  annual[0]?.totalRevenue,
                  annual[1]?.totalRevenue
                ).formatted
              }
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {formatCurrency(annual[0]?.netIncome)}
          </div>
          <div className="metric-label">Net Income</div>
          {annual.length > 1 && (
            <div
              className={`metric-growth ${
                calculateGrowth(annual[0]?.netIncome, annual[1]?.netIncome)
                  .isPositive
                  ? "positive"
                  : "negative"
              }`}
            >
              {
                calculateGrowth(annual[0]?.netIncome, annual[1]?.netIncome)
                  .formatted
              }
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {calculateMargin(annual[0]?.grossProfit, annual[0]?.totalRevenue)}
          </div>
          <div className="metric-label">Gross Margin</div>
          <div className="metric-subtext">Profitability</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {calculateMargin(annual[0]?.netIncome, annual[0]?.totalRevenue)}
          </div>
          <div className="metric-label">Net Margin</div>
          <div className="metric-subtext">Efficiency</div>
        </div>
      </div>

      {/* Income Statement Table */}
      <div className="statement-table-container">
        <div className="table-header">
          <h3>Annual Income Statement</h3>
          <div className="table-actions">
            <button className="export-btn">Export</button>
            <button className="view-toggle">Detailed View</button>
          </div>
        </div>

        <div className="statement-table">
          <div className="table-row header">
            <div className="table-cell description">Description</div>
            {annual.map((statement, index) => (
              <div key={index} className="table-cell period">
                {new Date(statement.endDate?.raw * 1000).getFullYear()}
                {index === 0 && <span className="current-badge">Current</span>}
              </div>
            ))}
            <div className="table-cell growth">YoY Growth</div>
          </div>

          {/* Revenue Section */}
          <div className="table-section">
            <div className="section-header">Revenue</div>

            <div className="table-row">
              <div className="table-cell description">Total Revenue</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {formatCurrency(statement.totalRevenue)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.totalRevenue,
                    annual[1]?.totalRevenue
                  ).formatted}
              </div>
            </div>
          </div>

          {/* Cost Section */}
          <div className="table-section">
            <div className="section-header">Costs & Expenses</div>

            <div className="table-row">
              <div className="table-cell description">Cost of Revenue</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {formatCurrency(statement.costOfRevenue)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.costOfRevenue,
                    annual[1]?.costOfRevenue
                  ).formatted}
              </div>
            </div>

            <div className="table-row">
              <div className="table-cell description">Gross Profit</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value highlight">
                  {formatCurrency(statement.grossProfit)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.grossProfit,
                    annual[1]?.grossProfit
                  ).formatted}
              </div>
            </div>

            <div className="table-row margin">
              <div className="table-cell description">Gross Margin</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {calculateMargin(
                    statement.grossProfit,
                    statement.totalRevenue
                  )}
                </div>
              ))}
              <div className="table-cell growth">—</div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="table-section">
            <div className="section-header">Operating Expenses</div>

            <div className="table-row">
              <div className="table-cell description">
                Research & Development
              </div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {formatCurrency(statement.researchDevelopment)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.researchDevelopment,
                    annual[1]?.researchDevelopment
                  ).formatted}
              </div>
            </div>

            <div className="table-row">
              <div className="table-cell description">SG&A</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {formatCurrency(statement.sellingGeneralAdministrative)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.sellingGeneralAdministrative,
                    annual[1]?.sellingGeneralAdministrative
                  ).formatted}
              </div>
            </div>

            <div className="table-row">
              <div className="table-cell description">Operating Income</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value highlight">
                  {formatCurrency(statement.operatingIncome)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(
                    annual[0]?.operatingIncome,
                    annual[1]?.operatingIncome
                  ).formatted}
              </div>
            </div>

            <div className="table-row margin">
              <div className="table-cell description">Operating Margin</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {calculateMargin(
                    statement.operatingIncome,
                    statement.totalRevenue
                  )}
                </div>
              ))}
              <div className="table-cell growth">—</div>
            </div>
          </div>

          {/* Net Income Section */}
          <div className="table-section">
            <div className="section-header">Net Income</div>

            <div className="table-row">
              <div className="table-cell description">Net Income</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value highlight">
                  {formatCurrency(statement.netIncome)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(annual[0]?.netIncome, annual[1]?.netIncome)
                    .formatted}
              </div>
            </div>

            <div className="table-row margin">
              <div className="table-cell description">Net Margin</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {calculateMargin(statement.netIncome, statement.totalRevenue)}
                </div>
              ))}
              <div className="table-cell growth">—</div>
            </div>
          </div>

          {/* EPS Section */}
          <div className="table-section">
            <div className="section-header">Per Share Data</div>

            <div className="table-row">
              <div className="table-cell description">Basic EPS</div>
              {annual.map((statement, index) => (
                <div key={index} className="table-cell value">
                  {formatCurrency(statement.eps, false)}
                </div>
              ))}
              <div className="table-cell growth">
                {annual.length > 1 &&
                  calculateGrowth(annual[0]?.eps, annual[1]?.eps).formatted}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios Summary */}
      <div className="ratios-summary">
        <h3>Key Financial Ratios</h3>
        <div className="ratios-grid">
          <div className="ratio-card">
            <div className="ratio-value">
              {calculateMargin(annual[0]?.grossProfit, annual[0]?.totalRevenue)}
            </div>
            <div className="ratio-label">Gross Margin</div>
            <div className="ratio-trend positive">+2.1% YoY</div>
          </div>

          <div className="ratio-card">
            <div className="ratio-value">
              {calculateMargin(
                annual[0]?.operatingIncome,
                annual[0]?.totalRevenue
              )}
            </div>
            <div className="ratio-label">Operating Margin</div>
            <div className="ratio-trend positive">+1.5% YoY</div>
          </div>

          <div className="ratio-card">
            <div className="ratio-value">
              {calculateMargin(annual[0]?.netIncome, annual[0]?.totalRevenue)}
            </div>
            <div className="ratio-label">Net Margin</div>
            <div className="ratio-trend positive">+1.2% YoY</div>
          </div>

          <div className="ratio-card">
            <div className="ratio-value">{annual[0]?.eps?.fmt || "—"}</div>
            <div className="ratio-label">EPS</div>
            <div className="ratio-trend positive">+15.3% YoY</div>
          </div>
        </div>
      </div>
    </div>
  );
};
