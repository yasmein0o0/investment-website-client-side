import { useRef, useState, useEffect } from "react";
import "/home/bisky/repos/node/TOP-FULLSTACK/Inventory-App/client/src/styles/home/market-overview.scss"
import { CurveBox } from "./index-curve-box";
import { indicies } from "./utilities/markets_indicies_names";
import { IndiciesDropList } from "./indices-drop-list";
import { useSelector, useDispatch } from "react-redux";
import { fetchIndexData } from "../../redux/thunks/home_thunks/index_data";
import { changeIndex } from "../../redux/reducers/home/chosen_index";
export function MOverview() {
    const dispatch = useDispatch();
    const defaultIndex = useSelector(state => state.defaultIndex)
    const chosenIndex = useSelector(state => state.chosenIndex)
    const { indexData, loading, error } = useSelector(state => state.index)
    const [indexChange, setIndexChange] = useState({ change: 'loading...', percentage: 'loading...' });
    const [hoverIndex, setHoverIndex] = useState(null)

    const [isDefault, setIsDefault] = useState(true)

    //fetching defalut index data everytime the website open for frist time, or when it is refreshed;
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
          // Fetch default index data
        dispatch(fetchIndexData({
          symbol: defaultIndex.symbol,
          interval: defaultIndex.scale,
          start: defaultIndex.start,
          end_fix: defaultIndex.end_fix,
          type: defaultIndex.type
        }));
        setIsDefault(true)
      } else {
          // Fetch chosen index data only if it's different from the default
        dispatch(fetchIndexData({
          symbol: chosenIndex.symbol,
          interval: chosenIndex.scale,
          start: chosenIndex.start,
          end_fix: chosenIndex.end_fix,
          type: chosenIndex.type
        }));
          //change the default state for heart svg color
          console.log(chosenIndex.symbol, defaultIndex.symbol )
          chosenIndex.symbol === defaultIndex.symbol ? setIsDefault(true) : setIsDefault(false)
      }
    }, [dispatch, defaultIndex, chosenIndex]);

    useEffect(() => {
        if (indexData && indexData.length > 0) {
          const firstClose = indexData[0].close;
          const lastClose = indexData[indexData.length - 1].close;
          const change = (lastClose - firstClose).toFixed(2);
          const percentage = ((change / firstClose) * 100).toFixed(2);
          
          setIndexChange({
            change: change,
            percentage: percentage
          });
        }
      }, [indexData]);

    const changeDefaultIndex = () => {
        if (chosenIndex.symbol != defaultIndex.symbol) {
            dispatch(changeIndex({ name: chosenIndex.name, symbol: chosenIndex.symbol, type: chosenIndex.type, start: chosenIndex.start }))
        }
        else {
            console.log('nd')
            dispatch(changeIndex({ name: 'S&P 500', symbol: '^GSPC', type:  {
                days: 5,
                hours: 6.5
            }, start: 65
            }))
        }
        isDefault ? setIsDefault(false) : setIsDefault(true);
    }
    console.log(isDefault)
    return (
        <div id="market-overview">
            <div id="market-title-and-indice">
                <div id="market-name">Markets</div>
                <div id="global-markets">
                {
                    indicies.map((elem, index) => (
                        <div 
                            className="market" 
                            key={index}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            {elem.market}
                            <IndiciesDropList 
                                market={elem.market} 
                                indices={elem.indicies} 
                                isVisible={hoverIndex === index} 
                            />
                        </div>
                    ))
                }
                </div>
            </div>
            <div id="chosen-index">
                <div id="chosen-index-name-currency">
                    <div id="chosen-index-name">{chosenIndex.name}</div>
                    <div id="chosen-index-currency">currency in dollars</div>
                </div>
               
                <div id="chosen-index-value-change" className={indexChange.change >= 0 ? 'gain_trend' : 'lose_trend'}>
                    <div id="chosen-index-value" className={loading? 'text_loader': null}>{!loading ? indexChange.change : ''}M</div>
                    <div id="chosen-index-change" className={loading ? 'text_loader' : null}>{!loading ? `(${indexChange.percentage}%)`: ''}</div>
                </div>

                <div id="watchlist-default-container">
                    <div id="add-to-watchlist">add to watch list</div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 512 512" onClick={()=> changeDefaultIndex()}>
                        <path className={isDefault ? 'default_index' : 'undefault_index'} fill='red' d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>                </div>

            </div>

            <div id="chosen-index-navigation">
                <div id="chosen-index-general">overview</div>
                <div id="chosen-index-news">components</div>
                <div id="chosen-index-analysis">analysis</div>
            </div>
            <CurveBox></CurveBox>
        </div>
    )
}