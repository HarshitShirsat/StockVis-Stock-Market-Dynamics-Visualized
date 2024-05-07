const sectors = {
  techSector: [
    "TCS",
    "Infosys",
    "Wipro",
    "HCLTech",
    "TechMahindra",
    "LTIinfotech",
    "PersistentSystems",
    "TanlaPlatforms",
    "TataElxsi",
    "Coforge",
  ],
  finSector: [
    "HDFCBank",
    "ICICIBank",
    "AxisBank",
    "KotakMahindraBank",
    "StateBankofIndia",
    "BajajFinance",
    "IndusIndBank",
    "BajajFinserv",
    "HDFCLife",
    "SBILife",
  ],
  healthSector: [
    "SunPharma",
    "DrReddy",
    "Cipla",
    "ApolloHospitals",
    "DivisLaboratories",
    "ZydusLifesciences",
    "TorrentPharmaceuticals",
    "Lupin",
    "MaxHealthcare",
    "AurobindoPharma",
  ],
  fmcgSector: [
    "HindustanUnilever",
    "NestleIndia",
    "BritanniaIndustries",
    "Godrej",
    "Dabur",
    "VarunBeverages",
    "ColgatePalmoliveIndia",
    "ProcterGambleIndia",
    "HatsunAgroProducts",
    "Emami",
  ],
  oilSector: [
    "IOC",
    "ONGC",
    "BPCL",
    "GAIL",
    "AdaniGas",
    "Reliance",
    "HindustanPetroleum",
    "OilIndia",
    "PetronetLNG",
    "GujaratGas",
  ],
};

var globalVariables = new Map();
globalVariables["sector"] = "techSector";
globalVariables["startDate"] = "2016-01-01";
globalVariables["enddate"] = "2022-12-01";
var chart1;
var chart2;
var chart3;
var chart4;
var chart5;
var chart7;

// Set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1400 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var colorScaleCompanies = d3
  .scaleOrdinal()
  .domain(sectors["techSector"])
  .range(d3.schemeTableau10);

document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.getElementById("sectorDropdown");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  var companyDropdown = d3.select("#companyDropdownv4");
  var priceTypeDropdown = d3.select("#priceTypeDropdownv4");

  let csvData;
  var entireStockData;
  var v5Data;

  // Load CSV file
  d3.csv("data/industryWiseData.csv").then((data) => {
    const keys = data.columns.slice(1);
    csvData = data.map((row) => {
      keys.forEach((col) => {
        row[col] = +row[col];
      });
      row.Date = d3.timeParse("%m/%d/%Y %H:%M:%S")(row.Date);
      return row;
    });
    updateChart();
  });
  fetch("data/stock_data.json")
    .then((response) => response.json())
    .then((data) => {
      entireStockData = data;
      // Initial chart update
      updateChartv4();

      // Add event listeners for dropdown changes
      companyDropdown.on("change", updateChartv4);
      priceTypeDropdown.on("change", updateChartv4);
    });

  // Event listeners for the dropdown and date inputs
  dropdown.addEventListener("change", updateChart);
  startDateInput.addEventListener("change", updateChart);
  endDateInput.addEventListener("change", updateChart);

  function updateChart2(filteredData, timeAxisDomain) {
    colorScaleCompanies = d3
      .scaleOrdinal()
      .domain(globalVariables["sectorCompanies"])
      .range(d3.schemeTableau10);

    const legend_chart2 = chart2
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 170}, 10)`);

    // Create legend items
    const legendItems_chart2 = legend_chart2
      .selectAll(".legend-item")
      .data(globalVariables["sectorCompanies"])
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    // Add colored rectangles (legend keys)
    legendItems_chart2
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => colorScaleCompanies(d));

    // Add legend labels
    legendItems_chart2
      .append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text((d) => d)
      //.style("font-size", "12px")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        // Highlight corresponding area in the chart on legend hover
        chart2.selectAll(".area_chart2").attr("opacity", 0.3); // Dim all areas
        chart2.select(`.area_chart2-${d}`).attr("opacity", 1); // Highlight selected area
      })
      .on("mouseout", () => {
        // Restore opacity on legend mouseout
        chart2.selectAll(".area_chart2").attr("opacity", 1);
      });

    var streamData = filteredData.map((row) => {
      var newRow = {};
      globalVariables["sectorCompanies"].forEach((col) => {
        newRow[col] = row[col];
      });
      newRow["Date"] = row["Date"];
      return newRow;
    });

    const stackedData = d3
      .stack()
      .offset(d3.stackOffsetSilhouette)
      .keys(globalVariables["sectorCompanies"])(streamData);

    const xChart2 = d3
      .scaleTime()
      .domain(timeAxisDomain)
      .range([0, width - 200]);
    chart2
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xChart2));

    const flattenedList = streamData.reduce((acc, curr) => {
      // Extract values from the current map, excluding "Date"
      const values = Object.keys(curr)
        .filter((key) => key !== "Date") // Exclude "Date" key
        .map((key) => curr[key]); // Get values for remaining keys

      // Concatenate values to accumulator
      return acc.concat(values);
    }, []);
    const chart2Max = Math.max(...flattenedList) * 2;
    const yChart2 = d3
      .scaleLinear()
      .domain([-chart2Max, chart2Max])
      .range([height, 0]);
    chart2.append("g").call(d3.axisLeft(yChart2));

    // Adding X axis label for chart2
    chart2
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 700) // Adjusted x position for chart2 specifics
      .attr("y", height + margin.top + 20)
      .text("Year");

    // Adding Y axis label for chart2
    chart2
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - 130)
      .text("Market Capitalization");

    // Stacked area chart
    const areaGenerator_chart2 = d3
      .area()
      .x((d) => xChart2(d.data.Date))
      .y0((d) => yChart2(d[0]))
      .y1((d) => yChart2(d[1]));

    const tooltip_chart2 = d3.select("#tooltip-chart2");
    // Append stacked areas
    chart2
      .selectAll(".area_chart2")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", (d) => `area_chart2 area_chart2-${d.key}`)
      .attr("fill", (d) => colorScaleCompanies(d.key))
      .attr("d", areaGenerator_chart2)
      .on("mouseover", (event, d) => {
        // Show tooltip on mouseover
        tooltip_chart2
          .style("opacity", 1)
          .html(`<strong>Company:</strong> ${d.key}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        // Hide tooltip on mouseout
        tooltip_chart2.style("opacity", 0);
      });
  }

  function updateChart() {
    const selectedSector = dropdown.value;
    globalVariables["sector"] = selectedSector;
    const startDate = startDateInput.value
      ? new Date(startDateInput.value)
      : new Date("2016-01-02");
    globalVariables["startDate"] = startDate;
    const endDate = endDateInput.value
      ? new Date(endDateInput.value)
      : new Date("2022-12-01");
    const sectorCompanies = sectors[selectedSector];
    globalVariables["endDate"] = endDate;
    globalVariables["sectorCompanies"] = sectorCompanies;

    // Filter data based on the selected dates
    const filteredData = csvData.filter(
      (d) => d.Date >= startDate && d.Date <= endDate
    );

    let aggregatedData = d3
      .rollups(
        filteredData,
        (v) =>
          d3.mean(v, (d) => {
            let sum = 0;
            let count = 0;
            sectorCompanies.forEach((company) => {
              if (d[company] !== undefined && d[company] !== "") {
                if (isNaN(d[company])) sum += 0;
                else sum += +d[company];
                count++;
              }
            });
            return count > 0 ? sum / count : undefined;
          }),
        (d) => d.Date
      )
      .map(([date, averagePrice]) => ({ date, averagePrice }))
      .filter((d) => !isNaN(d.averagePrice));

    const timeAxisDomain = d3.extent(aggregatedData, (d) => d.date);

    // Clear any existing SVG to avoid overlap
    d3.select("#chart1").selectAll("*").remove();
    d3.select("#chart2").selectAll("*").remove();

    // Append the SVG object to the body of the page
    chart1 = d3
      .select("#chart1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    chart2 = d3
      .select("#chart2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const xChart1 = d3.scaleTime().domain(timeAxisDomain).range([0, width]);

    chart1
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xChart1));

    // Add Y axis
    const yChart1 = d3
      .scaleLinear()
      .domain([0, d3.max(aggregatedData, (d) => d.averagePrice)])
      .range([height, 0]);
    chart1.append("g").call(d3.axisLeft(yChart1));

    // Adding X axis label
    chart1
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 600)
      .attr("y", height + margin.top + 20)
      .text("Year");

    // Adding Y axis label
    chart1
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - 150)
      .text("Average Stock Price");

    // Add the line
    const line = d3
      .line()
      .x((d) => xChart1(d.date))
      .y((d) => yChart1(d.averagePrice));
    chart1
      .append("path")
      .datum(aggregatedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Tooltip setup
    const tooltip = d3.select("#tooltip1");

    // Circle for the highlighted point
    const focus = chart1
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle").attr("r", 4.5);

    // Function to format date for the tooltip
    const formatDate = d3.timeFormat("%B %d, %Y");

    // Function to handle mouseover event
    function mouseover(event) {
      focus.style("display", null);
      tooltip.style("opacity", 1);
    }

    // Function to handle mousemoving over the chart
    function mousemove(event) {
      // Get this x-coordinate
      const mouseX = xChart1.invert(d3.pointer(event, this)[0]);

      // Find the nearest date index
      const bisectDate = d3.bisector((d) => d.date).left;
      const i = bisectDate(aggregatedData, mouseX, 1);
      const d0 = aggregatedData[i - 1];
      const d1 = aggregatedData[i];
      const currentData = mouseX - d0.date > d1.date - mouseX ? d1 : d0;

      focus.attr(
        "transform",
        `translate(${xChart1(currentData.date)},${yChart1(
          currentData.averagePrice
        )})`
      );

      tooltip
        .html(
          `Date: ${formatDate(
            currentData.date
          )}<br>Price: ${currentData.averagePrice.toFixed(2)}`
        )
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 100}px`);
    }

    // Function to handle mouseout event
    function mouseout(event) {
      focus.style("display", "none");
      tooltip.style("opacity", 0);
    }

    // Invisible hit area to capture hover events over the line
    chart1
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    updateChart2(filteredData, timeAxisDomain);
    companyDropdown.selectAll("option").remove();
    updateChartv4();
    updatev5(globalVariables["sector"]);
  }

  // Get the reset button by its class name
  const btnReset = document.querySelector(".btn-reset");

  // Event listener for the reset button
  btnReset.addEventListener("click", function () {
    // Reset date inputs to default values
    startDateInput.value = "";
    endDateInput.value = "";

    // Call updateChart to reset the chart
    updateChart();
  });

  // ********************************************************************
  // Code for v5

  // Load the CSV data
  d3.csv("data/v5.csv").then((data) => {
    data.forEach((d) => {
      d["P/E ratio"] = +d["P/E ratio"];
      d.Year = +d.Year;
    });
    v5Data = data;
    // Add event listener for the range slider
    const rangeSlider = d3.select("#companyRangev5");
    const rangeDisplay = d3.select("#rangeValuev5");
    rangeSlider.on("input", function () {
      // Update the range value display
      rangeDisplay.text(this.value);
      // Update the visualization with the selected number of companies
      updatev5(globalVariables["sector"], +this.value);
    });
    // Call update initially with the full number of companies
    updatev5(globalVariables["sector"]);
  });

  // Function to update the plot and legend based on the selected industry
  function updatev5(selectedIndustry, numCompanies = 10) {
    // Get the unique industry values for the dropdown
    const industries = Array.from(new Set(v5Data.map((d) => d.industry)));
    d3.select("#chart5svg").selectAll("*").remove();
    chart5 = d3
      .select("#chart5svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const uniqueCompanies = Array.from(
      new Set(
        v5Data
          .filter((d) => d.industry === selectedIndustry)
          .map((d) => d.Company)
      )
    ).slice(0, numCompanies);

    // Filter data points to include only those that belong to the selected companies
    const filteredData = v5Data.filter((d) =>
      uniqueCompanies.includes(d.Company)
    );
    // Create scales for x position and circle radius
    const startYear = getYearFromDate(globalVariables["startDate"]);
    const endYear = getYearFromDate(globalVariables["enddate"]);
    const x = d3
      .scaleLinear()
      .domain([startYear, endYear])
      .range([0, width - 220]);

    const r = d3
      .scaleSqrt()
      .domain(d3.extent(filteredData, (d) => d["P/E ratio"]))
      .range([2, 16]); // Adjust the range of radius here

    // X axis
    chart5
      .append("g")
      .attr("transform", `translate(0,${height - 20})`) // Lower the X axis for visibility
      .call(d3.axisBottom(x).tickValues(d3.range(startYear, endYear + 1)).tickFormat(d3.format("d")));

    // Now append the X axis label 'Year'
    chart5
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2) // adjust to place in the middle of the axis
      .attr("y", height + margin.bottom - 10) // adjust to position below the X axis
      .text("Year");

    // Force simulation to spread out the circles and avoid overlap
    const simulation = d3
      .forceSimulation(filteredData)
      .force("x", d3.forceX((d) => x(d.Year)).strength(1))
      .force("y", d3.forceY(height / 2 + 50).strength(0.1)) // Move circles away from the X axis
      .force(
        "collide",
        d3.forceCollide((d) => r(d["P/E ratio"]) + 1)
      )
      .stop();

    // Run the simulation to position circles
    for (let i = 0; i < 120; i++) simulation.tick();

    // Tooltip setup
    const tooltip = d3.select("#tooltipv5");

    // Draw the circles with positions determined by the simulation
    chart5
      .selectAll("circle")
      .data(filteredData)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => r(d["P/E ratio"]))
      .style("fill", (d) => colorScaleCompanies(d.Company))
      // Mouseover event to show the tooltip
      .on("mouseover", (event, d) => {
        tooltip
          .html("Company: " + d.Company + "<br/>P/E Ratio: " + d["P/E ratio"])
          .style("visibility", "visible")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      // Mouseout event to hide the tooltip
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Legend for companies in selected industry
    const legend = chart5
      .selectAll(".legend")
      .data(
        filteredData
          .map((d) => d.Company)
          .filter((v, i, a) => a.indexOf(v) === i)
      )
      .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width - 170}, ${i * 30})`);

    legend
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d) => colorScaleCompanies(d));

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text((d) => d);
  }

  // ********************************************************************
  // Code for v4

  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltipv4")
    .style("opacity", 0);

  var stockData = {};

  // Update chart function
  function updateChartv4() {
    d3.select("#chart4").selectAll("svg").remove();
    const currentSectorCompanies = sectors[globalVariables["sector"]];
    stockData = {};
    entireStockData.forEach((item) => {
      // Check if the current item's Symbol is in the currently selected sector's company list
      if (currentSectorCompanies.includes(item.Symbol)) {
        if (!stockData[item.Symbol]) {
          stockData[item.Symbol] = [];
        }
        stockData[item.Symbol].push({
          year: +item.Year, // Ensure the year is a number
          opening: +item.Open, // Convert string to number
          closing: +item.Close, // Convert string to number
        });
      }
    });
    companyDropdown
      .selectAll("option")
      .data(Object.keys(stockData))
      .enter()
      .append("option")
      .text((d) => d);

    var selectedSymbol = companyDropdown.node().value;
    var priceType = priceTypeDropdown.node().value;
    const startYear = getYearFromDate(globalVariables["startDate"]);
    const endYear = getYearFromDate(globalVariables["enddate"]);
    var symbolData = stockData[selectedSymbol].filter(item => item.year >= startYear && item.year <= endYear);
  
    // Create the SVG and margins
    var svg = d3
      .select("#chart4")
      .append("svg")
      .attr("width", 600)
      .attr("height", 400);

    var margin = { top: 20, right: -20, bottom: 40, left: 60 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the X axis label 'Year'
    g.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left - 50)
      .attr("y", height + margin.top + margin.bottom - 30)
      .text("Year");

    // Add the Y axis label 'Price'
    g.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 2 - 70)
      .attr("x", -(height / 2 + margin.top - 50))
      .text("Price");

    // Scales
    var x = d3.scaleLinear().domain([startYear, endYear]).range([0, width]);
    var y = d3.scaleLinear().domain([0, d3.max(symbolData, (d) => d[priceType])]).range([height, 0]);

    // Area generator
    var area = d3
      .area()
      .x((d) => x(d.year))
      .y0(height) // Base line of the area (bottom of the chart)
      .y1((d) => y(d.price)); // Top line of the area (data point)

    // Line generator
    var line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.price));

    // Create and append axes
    var xAxis = g.append("g").attr("transform", `translate(0,${height})`);
    var yAxis = g.append("g");

    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")).tickValues(d3.range(startYear, endYear + 1)));
    yAxis.call(d3.axisLeft(y));

    // Remove old areas, lines, and dots before redrawing
    g.selectAll(".area").remove();
    g.selectAll(".line").remove();
    g.selectAll(".dot").remove();

    // Determine the fill color based on the selected price type
    var fillColor = priceType === "opening" ? "steelblue" : "orange";

    // Add the area for the selected price type
    g.append("path")
      .datum(symbolData)
      .attr("class", "area")
      .attr("fill", fillColor) // Use the dynamic fill color
      .attr("opacity", 0.3) // Adjust the opacity as needed
      .attr(
        "d",
        area.y1((d) => {
          y(d[priceType]);
        })
      ); // Use area generator

    // Add the line for the selected price type
    g.append("path")
      .datum(symbolData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", fillColor) // Use the same dynamic color for the line
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        line.y((d) => y(d[priceType]))
      );

    // Add circles for each data point
    g.selectAll(".dot")
      .data(symbolData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d[priceType]))
      .attr("r", 5)
      .on("mouseover", function (event, d) {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(`Year: ${d.year}<br>${priceType}: ${d[priceType]}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        div.transition().duration(500).style("opacity", 0);
      });
  }
});

function getYearFromDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  return year;
}

