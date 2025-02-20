// python3 -m http.server 8080
// http://localhost:8080/

// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents_modified.csv").then(data => {

    // 2.b: ... AND TRANSFORM DATA
    // Convert year to a number 
    data.forEach(d => {
        d.Year = +d.Year;       
    });

    // Group data by year, and count entries
    const yearAccidents = d3.rollup(data,
        v => v.length, // Aggregation: count accidents in each year
        d => d.Year // Group by year
    );

    // Convert yearAccidents to an array of {year, count} objects
    const yearAccidentsArray = Array.from(yearAccidents, ([Year, Count]) => ({ Year, Count }))
        .sort((a, b) => d3.ascending(a.Year, b.Year));
    
    console.log("yearAccidents:", yearAccidentsArray);

    // 3.a: SET SCALES FOR CHART 1
    let xYear = d3.scaleLinear()
        .domain([d3.min(yearAccidentsArray, d => d.Year), d3.max(yearAccidentsArray, d => d.Year)])
        .range([0, width]);
    
    let yCount = d3.scaleLinear()
        .domain([0, d3.max(yearAccidentsArray, d => d.Count)])
        .nice() 
        .range([height, 0]);
    
    // Define line generator for plotting line
    const line = d3.line()
        .x(d => xYear(d.Year))  
        .y(d => yCount(d.Count)); 

    // 4.a: PLOT DATA FOR CHART 1
    svgLine.append("path")
        .datum(yearAccidentsArray) 
        .attr("d", line) 
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

});