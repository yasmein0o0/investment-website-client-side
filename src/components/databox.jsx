export function DataBox({ title, data }) {
  return (
    <div className="side-bar-box open-box">
      <h3 className="title">{title}</h3>
      <div className="header">
        <div className="header-name">name</div>
        <div className="header-price">last</div>
        <div className="header-change">chg.</div>
        <div className="header-change-percent">chg.%</div>
      </div>

      {data.map((elem, index) => (
        <div className="row" key={index}>
          <div className="name" title={elem.longName || elem.shortName}>
            {elem.shortName || elem.longName}
          </div>
          <div className={`last`}>
            {elem.regularMarketPrice ? elem.regularMarketPrice.toFixed(2) : "-"}
          </div>
          <div
            className={`chg ${elem.regularMarketChange > 0 ? "gain" : "lose"}`}
          >
            {elem.regularMarketChange
              ? elem.regularMarketChange.toFixed(2)
              : "-"}
          </div>
          <div
            className={`chg-perecnt ${
              elem.regularMarketChangePercent > 0 ? "gain" : "lose"
            }`}
          >
            {`(${
              elem.regularMarketChangePercent
                ? elem.regularMarketChangePercent.toFixed(2)
                : "-"
            }%)`}
          </div>
        </div>
      ))}
    </div>
  );
}
