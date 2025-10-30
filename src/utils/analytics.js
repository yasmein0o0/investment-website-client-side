// Analytics and performance calculation utilities
export const calculatePerformanceMetrics = (chartData) => {
  if (!chartData || chartData.length === 0) return null;

  const prices = chartData.map((item) => item.uv);
  const volumes = chartData.map((item) => item.volume || 0);
  const timestamps = chartData.map((item) => item.timestamp);

  const currentPrice = prices[prices.length - 1];
  const initialPrice = prices[0];
  const totalReturn = ((currentPrice - initialPrice) / initialPrice) * 100;

  // Calculate volatility (standard deviation of returns)
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(dailyReturn);
  }

  const volatility =
    returns.length > 0
      ? Math.sqrt(
        returns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) /
        returns.length
      ) * 100
      : 0;

  // Calculate max drawdown
  let peak = prices[0];
  let maxDrawdown = 0;

  prices.forEach((price) => {
    if (price > peak) peak = price;
    const drawdown = ((peak - price) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  // Calculate support and resistance levels
  const supportLevel = Math.min(...prices);
  const resistanceLevel = Math.max(...prices);

  // Calculate average volume
  const averageVolume =
    volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

  // Calculate performance by period
  const periodReturns = {
    week: calculatePeriodReturn(prices, 7),
    month: calculatePeriodReturn(prices, 30),
    quarter: calculatePeriodReturn(prices, 90),
    year: calculatePeriodReturn(prices, 365),
  };

  return {
    totalReturn,
    volatility: Math.min(volatility, 100), // Cap at 100% for display
    maxDrawdown,
    supportLevel,
    resistanceLevel,
    averageVolume,
    periodReturns,
    currentPrice,
    priceRange: {
      high: resistanceLevel,
      low: supportLevel,
      current: currentPrice,
    },
  };
};

const calculatePeriodReturn = (prices, days) => {
  if (prices.length <= days) return 0;
  const startPrice = prices[prices.length - days - 1];
  const endPrice = prices[prices.length - 1];
  return ((endPrice - startPrice) / startPrice) * 100;
};

export const calculateTrendAnalysis = (chartData) => {
  if (!chartData || chartData.length < 10) return null;

  const prices = chartData.map((item) => item.uv);

  // Simple linear regression for trend
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = prices;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, _, i) => a + x[i] * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const trendStrength = Math.abs(slope) * 1000; // Normalized strength

  // Determine trend direction
  let trendDirection = "neutral";
  if (slope > 0.001) trendDirection = "bullish";
  else if (slope < -0.001) trendDirection = "bearish";

  // Calculate momentum (recent performance)
  const recentPrices = prices.slice(-10);
  const momentum =
    ((recentPrices[recentPrices.length - 1] - recentPrices[0]) /
      recentPrices[0]) *
    100;

  return {
    trendDirection,
    trendStrength: Math.min(trendStrength, 100),
    momentum,
    slope,
  };
};

export const formatLargeNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toFixed(2);
};

export const getVolatilityLevel = (volatility) => {
  if (volatility < 10) return { level: "Low", color: "#22deff" };
  if (volatility < 25) return { level: "Medium", color: "#f59e0b" };
  return { level: "High", color: "#ef4444" };
};

export const getTrendIcon = (trendDirection) => {
  const icons = {
    bullish: "",
    bearish: "",
    neutral: "",
  };
  return icons[trendDirection] || icons.neutral;
};
