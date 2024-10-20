import "/home/bisky/repos/node/TOP-FULLSTACK/Inventory-App/client/src/styles/home/curve-box.scss"
import LineGraph from "./line_graph";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndexData } from "../../redux/thunks/home_thunks/index_data";
import { changeInterval } from "../../redux/reducers/home/chosen_index";
export function CurveBox() {
    const index = useSelector((state) => state.chosenIndex);
    const dispatch = useDispatch();
    const chooseInterval = (interval, fix) => {
        dispatch(changeInterval({ scale: interval, start: 0, end_fix: fix}))
        dispatch(fetchIndexData({ symbol: index.symbol, interval: interval }))
    }
    const choseRange = (range) => {
        if (range === '1_day') {
            dispatch(changeInterval({ scale: '5m', start: index.type.hours * 12, end_fix: 0 }))
        } else if (range === '1_week') {
            dispatch(changeInterval({ scale: '30m', start: index.type.hours * 2 * index.type.days, end_fix: 0 }))
        } else if (range === '3_months') {
            dispatch(changeInterval({ scale: '1d', start: index.type.days * 4 * 3, end_fix: 0 }))
        } else if (range === '1_month') {
            dispatch(changeInterval({ scale: '1d', start: index.type.days * 4 , end_fix: 0 }))
        } else if (range === '1_year') {
            dispatch(changeInterval({ scale: '1d', start: index.type.days * 4 * 12, end_fix: 0 }))
        } else if (range === '5_years') {
            dispatch(changeInterval({ scale: '1mo', start: 60, end_fix: -1 }))
        } else {
             dispatch(changeInterval({ scale: '3mo', start:42, end_fix: -1 }))
        }
    };
    
    return (
        <div id="curve-box">
            <div id="curve-tools">
                <div id="chart-types">
                    intervals  |
                </div>
                <div id="periods">
                <span className="period" onClick={()=>chooseInterval('5m', -1)}>5M</span>
                <span className="period" onClick={()=>chooseInterval('15m', -1)}>15M</span>
                <span className="period" onClick={()=>chooseInterval('30m', -1)}>30M</span>
                <span className="period" onClick={()=>chooseInterval('1h', -1)}>1H</span>
                <span className="period" onClick={()=>chooseInterval('1d', 0)}>1D</span>
                <span className="period" onClick={()=>chooseInterval('1wk', 0)}>1W</span>
                    <span className="period" onClick={()=>chooseInterval('1mo', 0)}>1MO</span>
                    <span className="period" onClick={()=>chooseInterval('3mo', 0)}>3MO</span>
                </div>
            </div>
            <div id="curve">
                <LineGraph></LineGraph>
            </div>
            <div id="curve-time">
                <div className="curve-time" onClick={()=> choseRange('1_day')}>1 Day</div>
                <div className="curve-time" onClick={()=> choseRange('1_week')}>1 Week</div>
                <div className="curve-time" onClick={()=> choseRange('1_month')}>1 Month</div>
                <div className="curve-time" onClick={()=> choseRange('3_months')}>3 Months</div>
                <div className="curve-time" onClick={()=> choseRange('1_year')}>1 Year</div>
                <div className="curve-time" onClick={()=> choseRange('5_years')}>5 Years</div>
                <div className="curve-time" onClick={()=> choseRange('max')}>MAX</div>
            </div>
        </div>
    )
}