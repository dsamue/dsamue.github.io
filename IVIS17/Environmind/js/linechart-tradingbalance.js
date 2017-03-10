
function drawLineTradeBalance(data){

console.log("in linechar for trading balance");

var data = d3.entries(data);

//Get the dimensions of the div
var divDims = d3.select("#line-chart-container").node().getBoundingClientRect();
//console.log(divDims);

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = divDims.width - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
	.ticks(6)
	.tickFormat(d3.format('.0f'));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(7);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); })
	.defined(function(d) {return d.value != "..";});


// Adds the svg canvas
var mySVG = d3.select("#line-chart-container")
    .append("svg")
        .attr('id', 'lineChart-tradeBalance')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


// Get the data

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {return parseInt(d.key); }));
    
    y.domain([-d3.max(data, function(d) { return Math.abs(parseFloat(d.value)); }),
	  d3.max(data, function(d) { return Math.abs(parseFloat(d.value)); })
	]);
	
    // Add the valueline path.
    mySVG.append("path")
        .attr("class", "line")
        .attr("d", valueline(data))
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

//Removes old chart
function clearTradeLineChart(){
    var mySVG = d3.select("#line-chart-container").html("");
}


