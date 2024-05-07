const widthChart6 = 650;
const heightChart6 = 500;
const outerRadius = Math.min(widthChart6, heightChart6) * 0.5 - 40;
const innerRadius = outerRadius - 30;
const histogramOuterRadius = outerRadius + 40
// Dummy data for the sidebars, replace with the actual data from the datasets
const marketCapData = {
    'FMCG': [72.72, 22.84, 12.55],
    'Financial Services': [76.35, 66.19, 48.11],
    'Healthcare': [29.03, 10.95, 10.49],
    'Oil&Gas': [208.29, 49.10, 22.35],
    'Tech': [144.02, 75.87, 25.85]
};
const peRatioData = {
    'FMCG': [118.0, 115.0, 93.0],
    'Financial Services': [79.0, 76.2, 41.2],
    'Healthcare': [84.2, 63.7, 57.2],
    'Oil&Gas': [766.0, 27.1, 20.9],
    'Tech': [54.9, 33.3, 30.1]
};

const mcMatrix = [
    [0, 5.29, 15.63, 7.42, 116.07],
    [6.08, 0, 15.63, 7.42, 116.07],
    [6.08, 5.29, 0, 7.42, 116.07],
    [6.08, 5.29, 15.63, 0, 116.07],
    [6.08, 5.29, 15.63, 7.42, 0]
];

const peMatrix = [
    [0, 13.22222222, 0.02, 38.873, 19.75],
    [1.82, 0, 0.02, 38.873, 19.75],
    [1.82, 13.22222222, 0, 38.873, 19.75],
    [1.82, 13.22222222, 0.02, 0, 19.75],
    [1.82, 13.22222222, 0.02, 38.873, 0]
];

let currentMatrix = mcMatrix;

const chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

const histogramArc = d3.arc() // Arc generator for histograms
    .innerRadius(outerRadius + 1)
    .outerRadius(histogramOuterRadius);

const ribbon = d3.ribbon()
    .radius(innerRadius);

// const color = d3.scaleOrdinal(d3.schemeCategory10);
const industryNames = ['FMCG', 'Financial Services', 'Healthcare', 'Oil&Gas', 'Tech']; // Industry names
const industryColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']; // Matching colors for each industry

// Define the color scale using the industry names as the domain and the corresponding colors
const sectorColorScale = d3.scaleOrdinal()
    .domain(industryNames)
    .range(industryColors);
// .domain(industryNames)
// .range(industryColors);

//d3.select("#chart6svg").selectAll("*").remove();
const chart6 = d3.select("#chart6svg")
    .attr("width", widthChart6)
    .attr("height", heightChart6)
    .attr("viewBox", [-widthChart6 / 2, -heightChart6 / 2, widthChart6, heightChart6])
    .attr("font-size", 22)
    .attr("font-family", "sans-serif");

// Define a scaling function to map market cap values to radial distances
function marketCapScale(value, maxMarketCap) {
    const scaleFactor = 50; // Adjust this scale factor to control the height of the histograms
    return outerRadius + 10 + (value / maxMarketCap * scaleFactor);
}

function drawHistograms(chordGroups, industryData, colorScale) {
    // Find the maximum value for the width scaling
    const maxMarketCap = Math.max(...Object.values(industryData).flat());
    const barHeight = 20; // Set a fixed height for each bar
    const gap = 5; // Gap between the chord diagram and the first bar
    const maxBarWidth = 100; // Maximum width of the bars

    // Define the width scale
    const widthScale = d3.scaleLinear()
        .domain([0, maxMarketCap])
        .range([0, maxBarWidth]);

    // Remove any existing bars first
    chart6.selectAll(".bar").remove();

    chordGroups.forEach((d, i) => {
        const groupName = Object.keys(industryData)[i];
        const values = industryData[groupName];
        let currentInnerRadius = outerRadius + gap; // Start just outside the main arc

        values.forEach((value, index) => {
            const barWidth = widthScale(value); // Compute the width of the bar based on market cap

            // Create the arc path for the bar
            const barArc = d3.arc()
                .innerRadius(currentInnerRadius)
                .outerRadius(currentInnerRadius + barHeight)
                .startAngle(d.startAngle)
                .endAngle(d.startAngle + (d.endAngle - d.startAngle) * (value / maxMarketCap)); // Proportional to value

            // Draw the bar
            chart6.append("path")
                .classed("bar", true) // Add a class for styling or later manipulation
                .attr("d", barArc) // Draw the arc shape for the bar
                .attr("fill", sectorColorScale(i)) // Fill color
                .attr("stroke", "white") // Add a white border for clarity
                .attr("stroke-width", "1px");

            // Update the inner radius for the next bar to be stacked above
            currentInnerRadius += barHeight + 1; // Increment by bar height plus a small gap
        });
    });
}

// Call this function to draw the stacked bars
//drawStackedBars(chord(chordData).groups, industryData, color);


// Ensure drawHistograms is called within the updateChord function after the chord diagram has been drawn
function updateChord(matrix) {
    const data = chord(matrix);
    const group = chart6.append("g")
        .selectAll("g")
        .data(data.groups)
        .join("g");

    group.append("path")
        .attr("fill", d => sectorColorScale(d.index))
        .attr("stroke", d => sectorColorScale(d.index))
        .attr("d", arc);

    group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", d => `
            rotate(${(d.angle * 180 / Math.PI - 90)})
            translate(${outerRadius + 30})
            ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text((d, i) => industryNames[i]);

    chart6.append("g")
        .attr("fill-opacity", 0.67)
        .selectAll("path")
        .data(data)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("fill", d => sectorColorScale(d.target.index))
        .attr("d", ribbon);

    // drawHistograms(data.groups, marketCapData, color);
}


function drawLegend() {
    // Remove any existing legends
    chart6.selectAll('.legend').remove();

    // Define the size of the legend items and the spacing
    const legendRectSize = 22;
    const legendSpacing = 6;

    // Calculate legend position
    const legendX = -outerRadius - 280; // Move legend to the left of the chord diagram
    const legendY = -outerRadius; // Align legend vertically with the top of the chord diagram

    // Create the legend
    const legend = chart6.selectAll('.legend')
        .data(industryNames) // Bind the color domain (which now has industry names)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => {
            const height = legendRectSize + legendSpacing;
            const vert = i * height + legendY; // Stacking the legend items vertically
            return `translate(${legendX},${vert})`;
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', sectorColorScale) // Use the color scale to set the fill
        .style('stroke', sectorColorScale); // Use the color scale to set the stroke

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(d => d); // Use the industry names as labels
}


const maxMarketCapValue = Math.max(...Object.values(marketCapData).flat());
const maxBarWidth = d3.scaleLinear()
    .domain([0, maxMarketCapValue])
    .range([0, 100])(maxMarketCapValue);

// Define additional padding if needed
const padding = 20;

// Adjust the viewBox to account for the width of the histogram bars
chart6.attr("viewBox", [
    -widthChart6 / 2 - padding - maxBarWidth -70, // Shift viewBox to the left to make space for the legend
    -heightChart6 / 2 - padding - 70,
    widthChart6 + padding * 2 + maxBarWidth * 2, // Increase width of viewBox
    heightChart6 + padding * 2 + maxBarWidth // Adjust the viewBox height here
]);


// Initial call to set up the diagram
updateChord(mcMatrix);
drawHistograms(chord(mcMatrix).groups, marketCapData, sectorColorScale);
drawLegend();

// Event listener for type change
document.getElementById('chart6-dropdown').addEventListener('change', function () {
    chart6.selectAll("*").remove(); // Clear the existing diagram and histograms
    currentMatrix = this.value === 'pe' ? peMatrix : mcMatrix;
    const selectedData = this.value === 'pe' ? peRatioData : marketCapData;
    updateChord(currentMatrix); // Redraw the chord diagram
    drawHistograms(chord(currentMatrix).groups, selectedData, sectorColorScale); // Redraw the histograms
    drawLegend();
});