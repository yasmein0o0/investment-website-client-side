import { useSelector, useDispatch } from "react-redux";
import { crypto, commodities, currencies, usFlag } from "../utils/icons.js";
import { useEffect, useRef } from "react";
import { qoutesThunk } from "../redux/qoutes.js";

export function Databox() {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.qoutes);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!hasRequested.current) {
      dispatch(qoutesThunk());
      hasRequested.current = true;
    }
  });
  if (data) {
    return (
      <div className="non-stocks-box">
        <h3 className="title">{title}</h3>
        <div className="header">
          <div className="header-name">name</div>
          <div className="header-price">last</div>
          <div className="header-change">chg.</div>
          <div className="header-change-percent">chg.%</div>
        </div>

        {data.map((elem, index) => (
          <div className="row" key={index}>
            <div className="name-logo" title={elem.longName || elem.shortName}>
              <img className="logo" src={logos[index]} />
              <span className="name">{elem.shortName || elem.longName}</span>
            </div>
            <div className={`last`}>
              {elem.regularMarketPrice
                ? elem.regularMarketPrice.toFixed(2)
                : "-"}
            </div>
            <div
              className={`chg ${
                elem.regularMarketChange > 0 ? "gain" : "lose"
              }`}
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
  } else return <div className="non-stocks-box">error</div>;
}
