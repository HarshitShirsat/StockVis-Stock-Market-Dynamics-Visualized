
function loadData(industry) {
    let filepath = ""
    // Check the industry and set the corresponding file path
    if (industry === "techSector") {
        filePath = "data/tech_industry_stock_data.csv";
    } else if (industry === "fmcgSector") {
        filePath = "data/fmcg_industry_stock_data.csv";
    } else if (industry === "finSector") {
        filePath = "data/financial_services_stock_data.csv";
    } else if (industry === "healthSector") {
        filePath = "data/healthcare_stock_data.csv";
    } else if (industry === "oilSector") {
        filePath = "data/oil_and_gas_stock_data.csv";
    } else {
        // If none of the above, return a rejected promise to handle the error
        return Promise.reject(new Error("Invalid industry selected"));
    }

    // If a valid file path is set, load the CSV file
    return d3.csv(filePath);
}


function drawOneViz(svgId, data, color) {
    // Parsing the date / time
    var parseDate = d3.timeParse("%d-%m-%Y %H:%M");

    // Preprocess the data
    data.forEach(function(d) {
        d.date = parseDate(d.Date);
        d.Close = +d.Close;
        d.Volume = +d.Volume;
    });

    // Selecting the SVG element
    var svg = d3.select("#"+svgId);

    // Removing all child elements of the SVG
    svg.selectAll('*').remove();

    var margin = {top: 10, right: 70, bottom: 50, left: 80},
    width = +svg.style('width').replace('px','')-margin.left-margin.right,
    height = +svg.style('height').replace('px','')-margin.top-margin.bottom;

    // Setting the ranges
    var x = d3.scaleTime().range([0, width]);
    var y0 = d3.scaleLinear().range([height, 0]);
    var y1 = d3.scaleLinear().range([height, 0]);

    // Defining the axes
    var xAxis = d3.axisBottom(x).ticks(5);
    var yAxisLeft = d3.axisLeft(y0).ticks(5).tickFormat(d3.format(""));
    var yAxisRight = d3.axisRight(y1).ticks(5);

    // Defining the line
    var priceline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y1(d.Close); });

    // Appending a 'g' element to the SVG, not to the body
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    
    // Getting the selected year from the select element
    var selectedYear = +d3.select("#year").node().value;
    // Filtering the data for the selected year
    var filteredData = data.filter(function(d) {
        return d.date.getFullYear() === selectedYear;
    });

    filteredData.sort(function(a, b) {
        return a.date - b.date;
    });

    // Scaling the range of the data
    x.domain(d3.extent(filteredData, function(d) { return d.date; }));
    y0.domain([0, d3.max(filteredData, function(d) { return d.Volume; })]);
    y1.domain([0, d3.max(filteredData, function(d) { return d.Close; })]);

    // Defining the colors for each quarter
    var quarterColors = ["#FFB6C1", "#ADD8E6", "#90EE90", "#FFFACD"];

    // Adding a rectangle for each quarter
    for (var i = 0; i < 4; i++) {
        g.append("rect")
            .attr("x", i * width / 4)
            .attr("y", 0)
            .attr("width", width / 4)
            .attr("height", height)
            .attr("fill", quarterColors[i]);
    }

    // Adding the bars for the histogram
    g.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", function(d, i) {
            if (i < filteredData.length - 1) {
                return x(filteredData[i + 1].date) - x(d.date);
            } else {
                return 0;
            }
        })
        .attr("y", function(d) { return y0(d.Volume); })
        .attr("height", function(d) { return height - y0(d.Volume); })
        .attr("fill", color)
        .attr("stroke", "black")  // Add a black border
        .attr("stroke-width", 1);  // Set the border width

    // Adding the priceline path.
    g.append("path")
        .datum(filteredData)
        .attr("class", "line")
        .attr("d", priceline)
        .style("stroke", "red")
        .attr("fill","none");  // Set the stroke color to red

    // Adding the scatterplot points
    g.selectAll("dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("r", 1.5) // radius of circle
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y1(d.Close); })
        .style("fill", "red");

    // Adding the X Axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Adding the Y0 Axis
    g.append("g")
        .attr("class", "y axis")
        .style("fill", "steelblue")
        .call(yAxisLeft);

    // Adding the Y1 Axis
    g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + " ,0)")	
        .style("fill", "red")
        .call(yAxisRight);

    // Add X axis label
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Quarter");

    // Add Y axis label for Volume (left side)
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -(height / 2))
        .text("Volume");

    // Add Y axis label for Price (right side)
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 15)
        .attr("x", -(height / 2))
        .text("Price");

}



function updateLegendPlot(companies, colors) {
    var svg = d3.select("#legend-plot");
    svg.selectAll('*').remove();  // Clear existing legends

    const itemWidth = 138;  // Allocate width for each legend item
    const itemHeight = 20;  // Height of the rectangle in the legend
    const textOffset = 25;  // Offset for the text relative to the rectangle

    var legends = svg.selectAll(".legend")
                     .data(companies)
                     .enter()
                     .append("g")
                     .attr("class", "legend")
                     // Set horizontal position based on index
                     .attr("transform", (d, i) => `translate(${i * itemWidth}, 0)`);

    // Add color rectangles
    legends.append("rect")
           .attr("x", 0)
           .attr("y", 0)
           .attr("width", itemHeight) // square color block
           .attr("height", itemHeight)
           .style("fill", (d, i) => colors[i]);

    // Add text labels
    legends.append("text")
           .attr("x", textOffset) // Position text right next to the rectangle
           .attr("y", itemHeight / 2) // Vertically center text
           .attr("dy", ".35em") // Additional adjustment to center the text
           .style("text-anchor", "start")
           .text(d => d);

    // Adjust the width of the SVG dynamically based on the number of legends
    svg.attr("width", companies.length * itemWidth + 20); // +20 for some padding
}


function drawViz3(){
    industry = d3.select("#sectorDropdown").node().value;
    if (industry === "none") return;  // Do nothing if 'none' is selected
    data = loadData(industry);
    var color = d3.schemeTableau10;
    loadData(industry)
        .then(data => {
            // Assuming 'company' is the attribute in your dataset for company names
            var uniqueCompanies = Array.from(new Set(data.map(item => item.Company))).slice(0,5);
            uniqueCompanies.forEach((Company, index) => {
                const companyData = data.filter(d => d.Company === Company);
                const svgId = `dual-plot-${index + 1}`;
                drawOneViz(svgId, companyData,color[index]);
            });
            updateLegendPlot(uniqueCompanies, color);
        })
        .catch(error => {
            console.error("Failed to load data:", error);
        });
}

window.onload = drawViz3();


