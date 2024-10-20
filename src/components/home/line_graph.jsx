import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

const LineGraph = () => {
  const colors = {
    gain: {
      start: "#90e0ef",
      end: "#caf0f8",
      line: "#48cae4"

    },
    lose: {
      end:"#ff8fa3",
      start: "#ffccd5",
      line: "#c9184a"
    }
  }

  const svgRef = useRef();
  const color = useRef();
  const { indexData, error, loading } = useSelector((state) => state.index);
  const [hoveredData, setHoveredData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, margin: { top: 20, right: 10, bottom: 20, left: 40 } });

  

  useEffect(() => {
    if (!indexData || indexData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const margin = { top: 20, right: 0, bottom: 20, left: 35 };
    const filteredData = indexData.filter((elem) => {
      if(elem.close !== 0 && elem.open !== 0) return elem
    })
    //gain or lose
    color.current = filteredData[0].close > filteredData[filteredData.length - 1].close ? colors.lose : colors.gain
    

    setDimensions({ width, height, margin });

    const x = d3.scaleLinear()
      .domain([0, filteredData.length - 1])
      .range([margin.left, width]);
    
    const y = d3.scaleLinear()
      .domain([d3.min(filteredData, d => d.close) * 0.999, d3.max(filteredData, d => d.close)])
      .range([height - margin.bottom - 20, margin.top+20]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.close))
      .curve(d3.curveLinear);

    const area = d3.area()
      .x((d, i) => x(i))
      .y0(height - margin.bottom)
      .y1(d => y(d.close));

    svg.select('.line-path')
      .datum(filteredData)
      .attr('d', line);

    svg.select('.area-path')
      .datum(filteredData)
      .attr('d', area);

    svg.select('.x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(width / 100)
        .tickFormat(d => {
          const format = d3.timeFormat("%m-%d %H:%M");
          return format(new Date(filteredData[Math.round(d)].date_utc * 1000));
        })
        .tickSize(0)
      )  .call(g => g.select('.domain').remove())      ;

    svg.select('.y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(height / 60)
      .tickSize(0))
      .call(g => g.select('.domain').remove());

    const handleMouseMove = (event) => {
      const [mouseX] = d3.pointer(event);
      const xValue = x.invert(mouseX);
      const index = Math.round(xValue);
      
      if (index >= 0 && index < filteredData.length) {
        const isRightHalf = mouseX > width / 2;
        setHoveredData({
          ...filteredData[index],
          x: x(index),
          y: y(filteredData[index].close),
          isRightHalf
        });
      }
    };

    const handleMouseOut = () => {
      setHoveredData(null);
    };

    svg.select('.overlay')
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

  }, [indexData]);

  const getTooltipStyle = () => {
    if (!hoveredData) return {};
    
    const baseStyle = {
      position: 'absolute',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '10px',
      pointerEvents: 'none',
      transition: 'all 0.1s ease-out',
    };

    if (hoveredData.isRightHalf) {
      return {
        ...baseStyle,
        right: `${dimensions.width - hoveredData.x + 30}px`,
        top: `${hoveredData.y + 28}px`,
      };
    } else {
      return {
        ...baseStyle,
        left: `${hoveredData.x + 30}px`,
        top: `${hoveredData.y + 28}px`,
      };
    }
  };

  if (loading) return <div className='loading_box'>
    <div className="loader"></div>
  </div>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!indexData) return null;

  return (
    <div style={{ width: '100%', height: '100%', padding: '20px 20px 20px 0', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="line-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="100%" x2="0" y2="0">
            <stop offset="0%" stopColor={`${color.current?color.current.start: ''}`} stopOpacity="0" />
            <stop offset="70%" stopColor={`${color.current? color.current.end: ''}`} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path className="area-path" fill="url(#line-gradient)" />
        <path className="line-path" fill="none" stroke={`${color.current? color.current.line: ''}`} strokeWidth="1.2" />
        <g className="x-axis" />
        <g className="y-axis" />
        <rect className="overlay" width="100%" height="100%" opacity="0" />
        {hoveredData && (
          <line
            className="tooltip-line"
            x1={hoveredData.x}
            x2={hoveredData.x}
            y1={dimensions.height - dimensions.margin.bottom}
            y2={hoveredData.y}
            stroke="black"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        )}
      </svg>
      {hoveredData && (
        <div className="tooltip" style={getTooltipStyle()}>
          <p>Date: {new Date(hoveredData.date_utc * 1000).toLocaleString()}</p>
          <p>Close: ${hoveredData.close.toFixed(2)}</p>
          <p>Volume: {hoveredData.volume.toLocaleString()}</p>
          <p>High: ${hoveredData.high.toFixed(2)}</p>
          <p>Low: ${hoveredData.low.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default LineGraph;