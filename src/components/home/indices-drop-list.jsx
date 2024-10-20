import { useDispatch } from "react-redux";
import { changeIndex } from "../../redux/reducers/home/chosen_index";

export function IndiciesDropList({ market, indices, isVisible }) {
    const dispatch = useDispatch();

        const handleClick = (symbol, name, type) => {
            console.log(symbol, name)
            dispatch(changeIndex({ symbol: symbol, name: name, type: type}))
        }


    return (
        <div className={`indices-list ${isVisible ? 'visible' : 'hidden'}`} key={market}>
            {
                indices.map(elem => (
                    <div key={elem.symbol} className="indices-list-elemnts" onClick={()=> handleClick(elem.symbol, elem.name, elem.type)}>
                        {elem.name}
                    </div>
                ))
            }
        </div>
    );
}
