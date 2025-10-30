// src/components/News.jsx
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newsThunk } from "../redux/news";
import "../style/news.scss";

export function News() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.news);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current === false) {
      hasRequested.current = true;
      dispatch(newsThunk());
    }
  }, [dispatch]);

  const handleClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatTickers = (tickers) => {
    if (!tickers || tickers.length === 0) return null;
    return tickers.slice(0, 2).join(", ");
  };

  // Group news by categories for better organization
  const featuredNews = data?.body?.slice(0, 1)[0];
  const topStories = data?.body?.slice(1, 11);
  const marketNews = data?.body?.slice(11, 22);
  const earningsNews = data?.body
    ?.filter(
      (item) =>
        item.title.toLowerCase().includes("earnings") ||
        item.title.toLowerCase().includes("q3") ||
        item.title.toLowerCase().includes("quarter")
    )
    .slice(0, 6);
  const technologyNews = data?.body
    ?.filter((item) =>
      item.tickers?.some((ticker) =>
        ["AAPL", "MSFT", "GOOGL", "META", "AMZN", "TSLA"].includes(
          ticker.replace("$", "")
        )
      )
    )
    .slice(0, 6);

  if (loading) {
    return (
      <div id="news-page">
        <div className="news-loading">
          <div className="loading-spinner"></div>
          <p>Loading financial news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="news-page">
        <div className="news-error">
          <h2>Market News</h2>
          <p>Unable to load news: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="news-page">
      {/* Header */}
      <header className="news-header">
        <div className="header-content">
          <h1 className="news-brand">Market News</h1>
          <div className="header-info">
            <span className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </span>
            <span className="news-count">
              {data?.meta?.total || 0}+ Stories
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="news-main">
        {/* Featured Story - Large Hero */}
        {featuredNews && (
          <section className="featured-story">
            <div
              className="featured-card"
              onClick={() => handleClick(featuredNews.url)}
            >
              <div className="featured-image">
                <img src={featuredNews.img} alt={featuredNews.title} />
                <div className="featured-badge">FEATURED</div>
              </div>
              <div className="featured-content">
                <div className="featured-meta">
                  <span className="source">{featuredNews.source}</span>
                  <span className="time">{featuredNews.ago}</span>
                  {featuredNews.tickers && (
                    <span className="tickers">
                      {formatTickers(featuredNews.tickers)}
                    </span>
                  )}
                </div>
                <h2 className="featured-title">{featuredNews.title}</h2>
                <p className="featured-summary">{featuredNews.text}</p>
                <button className="read-full">Read Full Story →</button>
              </div>
            </div>
          </section>
        )}

        {/* Top Stories Grid */}
        {topStories && topStories.length > 0 && (
          <section className="top-stories">
            <h3 className="section-title">Top Stories</h3>
            <div className="stories-grid">
              {topStories.map((news, index) => (
                <article
                  key={index}
                  className="story-card"
                  onClick={() => handleClick(news.url)}
                >
                  <div className="story-image">
                    <img src={news.img} alt={news.title} />
                  </div>
                  <div className="story-content">
                    <div className="story-meta">
                      <span className="source">{news.source}</span>
                      <span className="time">{news.ago}</span>
                    </div>
                    <h4 className="story-title">{news.title}</h4>
                    {news.tickers && (
                      <div className="story-tickers">
                        {formatTickers(news.tickers)}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="news-columns">
          {/* Left Column - Market News */}
          <section className="news-column">
            <h3 className="section-title">Market Movers</h3>
            <div className="news-list">
              {marketNews?.map((news, index) => (
                <article
                  key={index}
                  className="list-item"
                  onClick={() => handleClick(news.url)}
                >
                  <div className="item-content">
                    <div className="item-meta">
                      <span className="source">{news.source}</span>
                      <span className="time">{news.ago}</span>
                    </div>
                    <h4 className="item-title">{news.title}</h4>
                    {news.tickers && (
                      <div className="item-tickers">
                        {formatTickers(news.tickers)}
                      </div>
                    )}
                  </div>
                  {news.img && (
                    <div className="item-image">
                      <img src={news.img} alt={news.title} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Right Column - Earnings & Tech */}
          <section className="news-column">
            <h3 className="section-title">Earnings Reports</h3>
            <div className="news-list compact">
              {earningsNews?.map((news, index) => (
                <article
                  key={index}
                  className="list-item compact"
                  onClick={() => handleClick(news.url)}
                >
                  <div className="item-content">
                    <h4 className="item-title">{news.title}</h4>
                    <div className="item-meta">
                      <span className="source">{news.source}</span>
                      <span className="time">{news.ago}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h3 className="section-title" style={{ marginTop: "2rem" }}>
              Technology
            </h3>
            <div className="news-list compact">
              {technologyNews?.map((news, index) => (
                <article
                  key={index}
                  className="list-item compact"
                  onClick={() => handleClick(news.url)}
                >
                  <div className="item-content">
                    <h4 className="item-title">{news.title}</h4>
                    <div className="item-meta">
                      <span className="source">{news.source}</span>
                      <span className="time">{news.ago}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Breaking News Ticker */}
        <div className="breaking-news">
          <div className="breaking-label">BREAKING</div>
          <div className="breaking-content">
            {data?.body?.slice(0, 3).map((news, index) => (
              <span key={index} className="breaking-item">
                {news.title}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
