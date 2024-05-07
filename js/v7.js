// Market_Cap_Checked, MC_Change_Checked, PE_Ratio_Checked, PE_Change_Checked
// Year,Company,industry,Market cap,MC_Change,P/E ratio,PE_Change

// Set layout variables

let svg_v7 = d3.select('#scatter_plot_svg_v7');
const v7width = +svg_v7.style('width').replace('px', '');
const v7height = +svg_v7.style('height').replace('px', '');
const v7margin = { top: 70, bottom: 50, right: 30, left: 50 };
const innerWidth = v7width - v7margin.left - v7margin.right;
const innerHeight = v7height - v7margin.top - v7margin.bottom;
let plotData;
var xAttrib, yAttrib, cAttrib, v7color;
var colorKey1, colorKey2;
// Data is preloaded in pokemon_data and penguins_data
let g = svg_v7.append('g').attr('transform', `translate(${v7margin.left},${v7margin.top})`);
document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // Function to handle checkbox change events
    function handleCheckboxChange(event) {
        const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedCheckboxes.length < 2) {
            if (!event.target.checked) {
                event.preventDefault();
            }
        }
        displayUpdated();
    }

    // Add change event listener to each checkbox
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', handleCheckboxChange);
    });

    // Trigger initial check to enforce initial state
    handleCheckboxChange();
    displayUpdated();
})

// d3.selectAll('input[type="checkbox"]').on('click', displayUpdated);

// d3.selectAll('#clusters-input').on('change', displayUpdated);
/*
    Function:  displayUpdated
    Event Handling:  on load, on click, or on cluster number changes
    HTTP Request:  Sends request to Flask server
        endpoint:  local-host:flask server port/build-tsne-model-data
        header:  content-type : application/json
        body:  JSON format of parameters for each checkbox checked
    Expected Response:  200
        Response Body:  JSON data for tSNE plot
        Response Handler:  call drawtSNE() to plot
*/
async function displayUpdated() {
    // request body data for Market_Cap_Checkbox, MC_Change_Checkbox, PE_Ratio_Checkbox, PE_Change_Checkbox
    params = {
        Market_Cap_Checked: d3.select('#Market_Cap_Checkbox').property('checked'),
        MC_Change_Checked: d3.select('#MC_Change_Checkbox').property('checked'),
        PE_Ratio_Checked: d3.select('#PE_Ratio_Checkbox').property('checked'),
        PE_Change_Checked: d3.select('#PE_Change_Checkbox').property('checked')
    }

    // Define fetch POST request for Flask server
    // http://127.0.0.1:5000/build-tsne-model-data
    const url = `http://127.0.0.1:8001/build-tsne-model-data`
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: new Headers({
            "content-type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET"
        })
    })
        .then(response => {
            if (response.status != 200) {
                return;
            }
            response.json().then(data => {
                drawtSNE(data)
            })
        })
}

function drawtSNE(data) {

    let xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([0, innerWidth])
    let yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([innerHeight, 0]);
    // Exctract the distinct company name for the color scale
    let companyNames = [... new Set(data.map(d => d.Company))];
    let industries = [... new Set(data.map(d => d.industry))];

    if (colorKey1 != undefined) {
        colorKey1.remove();
        colorKey2.remove();
    }

    // Add the color key
    colorKey1 = g.append('g')
    colorKey1.selectAll('.color-key-square')
        .data(industries.slice(0, 3))
        .join('rect')
        .classed('color-key-square', true)
        .attr('x', (d, i) => i * 120)
        .attr('y', -60)
        .attr('width', 15)
        .attr('height', 15)
        .style('stroke', 'black')
        .style('fill', d => sectorColorScale(d));
    colorKey1.selectAll('.color-key-label')
        .data(industries.slice(0, 3))
        .join('text')
        .classed('color-key-square', true)
        .attr('x', (d, i) => 30 + i * 120)
        .attr('y', -52)
        .style('alignment-baseline', 'central')
        .style('font-size', '18px')
        .text(d => d)
    colorKey2 = g.append('g')
    colorKey2.selectAll('.color-key-square')
        .data(industries.slice(3, 5))
        .join('rect')
        .classed('color-key-square', true)
        .attr('x', (d, i) => i * 120)
        .attr('y', -30)
        .attr('width', 15)
        .attr('height', 15)
        .style('stroke', 'black')
        .style('fill', d => sectorColorScale(d));
    colorKey2.selectAll('.color-key-label')
        .data(industries.slice(3, 5))
        .join('text')
        .classed('color-key-square', true)
        .attr('x', (d, i) => 30 + i * 120)
        .attr('y', -22)
        .style('alignment-baseline', 'central')
        .text(d => d)

    // clear and re-draw the axes every time this function is called
    g.select('#axis-g').remove();
    let axisG = g.append('g')
        .attr('id', 'axis-g')
        .lower();
    axisG.append('g').call(d3.axisLeft(yScale))
        .style('font-size', '18px');
    axisG.append('g').call(d3.axisBottom(xScale))
        .style('font-size', '18px')
        .attr('transform', `translate(0,${innerHeight})`);
    axisG.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .style('stroke', 'black')
        .style('stroke-width', 0.5)
        .style('fill', 'none');

    // Render the dots on the scatter plot
    g.selectAll('circle')
        .data(data, d => d.index)
        .join(
            enter => {
                enter.append('circle')
                    .attr('r', 5)
                    .style('stroke', 'black')
                    .attr('fill', d => sectorColorScale(d.industry))
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', d => yScale(d.y))
            },
            update => {
                update.call(update => update.transition()
                    .delay((d, i) => i * 2)
                    .duration(500)
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', d => yScale(d.y))
                );
            }
        )
}