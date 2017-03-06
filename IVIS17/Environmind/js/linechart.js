
function drawLine(data1, data2){

console.log("in linechar");

var data = d3.entries(data1);
var data2 = d3.entries(data2);

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 500 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;


// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(4);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); });


// Define the line
var valueline2 = d3.svg.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); });


// Adds the svg canvas
var mySVG = d3.select("#compare-line-chart")
    .append("svg")
        .attr('id', 'lineChart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


// Get the data

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {return d.key; }));
    
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // Scale the range of the data
    x.domain(d3.extent(data2, function(d) { return d.key; }));
    
    y.domain([0, d3.max(data2, function(d) { return d.value; })]);


    // Add the valueline path.
    mySVG.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

     mySVG.append("path")
            .attr("class", "line")
            .attr("d", valueline2(data2))
            .style("stroke", "red");

    // Add the X Axis
    mySVG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    mySVG.append("g")
        .attr("class", "y axis")
        .call(yAxis);

}

function clearLineChart(){
    var mySVG = d3.select("#compare-line-chart").html("");
}


