import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileThunk } from "../redux/profile";
import "../style/profile.scss";

export const CompanyProfile = () => {
  const dispatch = useDispatch();
  const hasRequested = useRef(false);
  const { info } = useSelector((state) => state.ticker);
  const { data, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    if (hasRequested.current === false && info) {
      console.log(info);
      hasRequested.current = true;
      dispatch(profileThunk(info.symbol));
    }
  }, [dispatch, info]);

  if (loading) {
    return (
      <div className="company-profile">
        <div className="skeleton-loader">
          <div className="skeleton-header"></div>
          <div className="skeleton-metrics"></div>
          <div className="skeleton-content">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-profile">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Company Data</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => dispatch(profileThunk(info.symbol))}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data?.body) {
    return (
      <div className="company-profile">
        <div className="empty-state">
          <h3>No Company Data Available</h3>
          <p>Select a ticker to view company profile</p>
        </div>
      </div>
    );
  }

  const profileData = data.body;
  const keyExecutives = profileData.companyOfficers?.slice(0, 5) || [];

  const formatCurrency = (value) => {
    if (!value?.fmt) return "N/A";
    return value.fmt;
  };

  const formatNumber = (num) => {
    if (!num) return "N/A";
    return new Intl.NumberFormat().format(num);
  };

  const formatPay = (pay) => {
    if (!pay?.raw) return "N/A";
    return `$${formatCurrency(pay)}`;
  };

  return (
    <div className="company-profile">
      {/* Header Section */}
      <div className="profile-header">
        <div className="company-info">
          <div className="company-main">
            <h1 className="company-name">{info?.name || data.meta?.symbol}</h1>
            <div className="ticker">{data.meta?.symbol}</div>
          </div>
          <div className="company-details">
            <span className="sector">{profileData.sector}</span>
            <span className="industry">{profileData.industry}</span>
            <span className="employees">
              {formatNumber(profileData.fullTimeEmployees)} employees
            </span>
          </div>
        </div>

        <div className="company-contact">
          <div className="contact-item">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M192 284.4C256.1 269.9 304 212.5 304 144 304 64.5 239.5 0 160 0S16 64.5 16 144c0 68.5 47.9 125.9 112 140.4L128 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-195.6zM168 96c-30.9 0-56 25.1-56 56 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-57.4 46.6-104 104-104 13.3 0 24 10.7 24 24s-10.7 24-24 24z" />
              </svg>
            </span>
            <span>
              {profileData.city}, {profileData.state} {profileData.zip}
            </span>
          </div>
          <div className="contact-item">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M415.9 344L225 344C227.9 408.5 242.2 467.9 262.5 511.4C273.9 535.9 286.2 553.2 297.6 563.8C308.8 574.3 316.5 576 320.5 576C324.5 576 332.2 574.3 343.4 563.8C354.8 553.2 367.1 535.8 378.5 511.4C398.8 467.9 413.1 408.5 416 344zM224.9 296L415.8 296C413 231.5 398.7 172.1 378.4 128.6C367 104.2 354.7 86.8 343.3 76.2C332.1 65.7 324.4 64 320.4 64C316.4 64 308.7 65.7 297.5 76.2C286.1 86.8 273.8 104.2 262.4 128.6C242.1 172.1 227.8 231.5 224.9 296zM176.9 296C180.4 210.4 202.5 130.9 234.8 78.7C142.7 111.3 74.9 195.2 65.5 296L176.9 296zM65.5 344C74.9 444.8 142.7 528.7 234.8 561.3C202.5 509.1 180.4 429.6 176.9 344L65.5 344zM463.9 344C460.4 429.6 438.3 509.1 406 561.3C498.1 528.6 565.9 444.8 575.3 344L463.9 344zM575.3 296C565.9 195.2 498.1 111.3 406 78.7C438.3 130.9 460.4 210.4 463.9 296L575.3 296z" />
              </svg>
            </span>
            <a
              href={profileData.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profileData.website?.replace(/(https?:\/\/)?(www\.)?/, "")}
            </a>
          </div>
          <div className="contact-item">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z" />
              </svg>
            </span>
            <span>{profileData.phone}</span>
          </div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M96 96C113.7 96 128 110.3 128 128L128 464C128 472.8 135.2 480 144 480L544 480C561.7 480 576 494.3 576 512C576 529.7 561.7 544 544 544L144 544C99.8 544 64 508.2 64 464L64 128C64 110.3 78.3 96 96 96zM208 288C225.7 288 240 302.3 240 320L240 384C240 401.7 225.7 416 208 416C190.3 416 176 401.7 176 384L176 320C176 302.3 190.3 288 208 288zM352 224L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224zM432 256C449.7 256 464 270.3 464 288L464 384C464 401.7 449.7 416 432 416C414.3 416 400 401.7 400 384L400 288C400 270.3 414.3 256 432 256zM576 160L576 384C576 401.7 561.7 416 544 416C526.3 416 512 401.7 512 384L512 160C512 142.3 526.3 128 544 128C561.7 128 576 142.3 576 160z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{profileData.auditRisk}/10</div>
            <div className="metric-label">Audit Risk</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{profileData.boardRisk}/10</div>
            <div className="metric-label">Board Risk</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M328 112l-144 0-37.3-74.5c-1.8-3.6-2.7-7.6-2.7-11.6 0-14.3 11.6-25.9 25.9-25.9L342.1 0c14.3 0 25.9 11.6 25.9 25.9 0 4-.9 8-2.7 11.6L328 112zM169.6 160l172.8 0 48.7 40.6C457.6 256 496 338 496 424.5 496 472.8 456.8 512 408.5 512l-305.1 0C55.2 512 16 472.8 16 424.5 16 338 54.4 256 120.9 200.6L169.6 160zM260 224c-11 0-20 9-20 20l0 4c-28.8 .3-52 23.7-52 52.5 0 25.7 18.5 47.6 43.9 51.8l41.7 7c6 1 10.4 6.2 10.4 12.3 0 6.9-5.6 12.5-12.5 12.5L216 384c-11 0-20 9-20 20s9 20 20 20l24 0 0 4c0 11 9 20 20 20s20-9 20-20l0-4.7c25-4.1 44-25.7 44-51.8 0-25.7-18.5-47.6-43.9-51.8l-41.7-7c-6-1-10.4-6.2-10.4-12.3 0-6.9 5.6-12.5 12.5-12.5l47.5 0c11 0 20-9 20-20s-9-20-20-20l-8 0 0-4c0-11-9-20-20-20z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {profileData.compensationRisk}/10
            </div>
            <div className="metric-label">Compensation Risk</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M384 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L398.4 160C393.2 185.8 375.5 207.1 352 217.3L352 512L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L128 576C110.3 576 96 561.7 96 544C96 526.3 110.3 512 128 512L288 512L288 217.3C264.5 207 246.8 185.7 241.6 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L256 96C270.6 76.6 293.8 64 320 64C346.2 64 369.4 76.6 384 96zM439.6 384L584.4 384L512 259.8L439.6 384zM512 480C449.1 480 396.8 446 386 401.1C383.4 390.1 387 378.8 392.7 369L487.9 205.8C492.9 197.2 502.1 192 512 192C521.9 192 531.1 197.3 536.1 205.8L631.3 369C637 378.8 640.6 390.1 638 401.1C627.2 445.9 574.9 480 512 480zM126.8 259.8L54.4 384L199.3 384L126.8 259.8zM.9 401.1C-1.7 390.1 1.9 378.8 7.6 369L102.8 205.8C107.8 197.2 117 192 126.9 192C136.8 192 146 197.3 151 205.8L246.2 369C251.9 378.8 255.5 390.1 252.9 401.1C242.1 445.9 189.8 480 126.9 480C64 480 11.7 446 .9 401.1z" />
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{profileData.overallRisk}/10</div>
            <div className="metric-label">Overall Risk</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Company Overview */}
        <div className="content-card overview-card">
          <div className="card-header">
            <h3>Company Overview</h3>
          </div>
          <div className="card-content">
            <p className="business-summary">
              {profileData.longBusinessSummary}
            </p>
          </div>
        </div>

        {/* Key Executives */}
        <div className="content-card">
          <div className="card-header">
            <h3>Key Leadership</h3>
          </div>
          <div className="card-content">
            <div className="executives-list">
              {keyExecutives.map((exec, index) => (
                <div key={index} className="executive-item">
                  <div className="executive-avatar">
                    {exec.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="executive-details">
                    <div className="executive-name">{exec.name}</div>
                    <div className="executive-title">{exec.title}</div>
                    {exec.age && (
                      <div className="executive-age">Age: {exec.age}</div>
                    )}
                    {exec.totalPay && (
                      <div className="executive-compensation">
                        Compensation: {formatPay(exec.totalPay)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="content-card">
          <div className="card-header">
            <h3>Company Details</h3>
          </div>
          <div className="card-content">
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">Headquarters</span>
                <span className="detail-value">
                  {profileData.address1}, {profileData.city},{" "}
                  {profileData.state} {profileData.zip}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Country</span>
                <span className="detail-value">{profileData.country}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sector</span>
                <span className="detail-value">{profileData.sector}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Industry</span>
                <span className="detail-value">{profileData.industry}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Time Employees</span>
                <span className="detail-value">
                  {formatNumber(profileData.fullTimeEmployees)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investor Relations */}
        <div className="content-card">
          <div className="card-header">
            <h3>Investor Relations</h3>
          </div>
          <div className="card-content">
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">IR Website</span>
                <span className="detail-value">
                  {profileData.irWebsite ? (
                    <a
                      href={profileData.irWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileData.irWebsite.replace(
                        /(https?:\/\/)?(www\.)?/,
                        ""
                      )}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Processed Time</span>
                <span className="detail-value">
                  {new Date(data.meta?.processedTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
