import { Routes, Route } from "react-router-dom";
import { HomeSidebar } from "./homesidebar";
import { IndexChart } from "./linegraph";
import { CompanyProfile } from "./profile";
import { Earnings } from "./earnings";
import { IncomeStatement } from "./incomestatement";
import { RecommendationTrend } from "./recommendation";
import { InsiderTransactions } from "./insidertransactions";
export const Home = () => {
  return (
    <div id="home">
      <HomeSidebar />
      <div id="home-content">
        <Routes>
          <Route path="/" element={<IndexChart />} />
          <Route path="/index" element={<IndexChart />} />
          <Route path="/income-statement" element={<IncomeStatement />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/profile" element={<CompanyProfile />} />
          <Route
            path="/recommendation-trend"
            element={<RecommendationTrend />}
          />
          <Route
            path="/insider-transactions"
            element={<InsiderTransactions />}
          />
          {/* Add more sections as needed */}
        </Routes>
      </div>
    </div>
  );
};
