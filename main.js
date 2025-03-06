// python3 -m http.server 8000
// http://localhost:8000/

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
    svgLine.selectAll("path.data-line")
        .data([yearAccidentsArray]) // Bind the yearAccidentsArray as a single line
        .enter()
        .append("path")
        .attr("class", "data-line")
        .attr("d", d3.line()
            .x(d => xYear(d.Year)) // Assuming "Year" is the field you are using
            .y(d => yCount(d.Count)) // Assuming "Count" is the field for accident counts
        )
        .style("stroke", "steelblue")
        .style("fill", "none")
        .style("stroke-width", 2);


    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xYear)
            .tickFormat(d3.format("d")));
    
            svgLine.append("g")
        .call(d3.axisLeft(yCount));
    
    // 6.a: ADD LABELS FOR CHART 1
    // x label
    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 - 20)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Year");

    // y label
    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Number of Accidents");

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    function updateChart(selectedGroup) {
        // Filter data based on the selected group (category)
        const filteredData = data.filter(d => d.Country === selectedGroup);
    
        // Group data by year and calculate the count of accidents
        const groupedData = d3.rollup(filteredData, v => v.length, d => d.Year);
    
        // Convert grouped data to an array of {year, count} objects and sort by year
        const groupedDataArray = Array.from(groupedData, ([Year, Count]) => ({ Year, Count }))
            .sort((a, b) => d3.ascending(a.Year, b.Year));
    
        // Update the x and y domains based on the grouped data
        xYear.domain([d3.min(groupedDataArray, d => d.Year), d3.max(groupedDataArray, d => d.Year)]);
        yCount.domain([0, d3.max(groupedDataArray, d => d.Count)]).nice();
    
        // Remove the previous line if it exists
        svgLine.selectAll("path.data-line").remove();
    
        // Add the new line path
        svgLine.append("path")
            .datum(groupedDataArray)
            .attr("class", "data-line")
            .attr("d", line)
            .style("stroke", "steelblue")
            .style("fill", "none")
            .style("stroke-width", 2);
    
        // Redraw the data points (circles) with new data
        svgLine.selectAll(".data-point")
            .data(groupedDataArray)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => xYear(d.Year))
            .attr("cy", d => yCount(d.Count))
            .attr("r", 5)
            .style("fill", "steelblue")
            .style("opacity", 0) // Start with invisible circles
            .on("mouseover", function (event, d) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>Year:</strong> ${d.Year} <br><strong>Accidents:</strong> ${d.Count}`)
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
    
                // Make the hovered circle visible
                d3.select(this).style("opacity", 1);
                
                // Add a large circle at the hovered point
                svgLine.append("circle")
                    .attr("class", "hover-circle")
                    .attr("cx", xYear(d.Year))
                    .attr("cy", yCount(d.Count))
                    .attr("r", 6)
                    .style("fill", "steelblue")
                    .style("stroke-width", 2);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
    
                // Remove the hover circle when mouseout occurs
                svgLine.selectAll(".hover-circle").remove();
    
                // Make the data point circle invisible again
                d3.select(this).style("opacity", 0);
            });
    }
    
    

    d3.select("#categorySelect").on("change", function() {
        var selectedCategory = d3.select(this).property("value");
        updateChart(selectedCategory); // Update the chart based on the selected option
    }); 
    

});