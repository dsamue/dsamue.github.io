
function drawLine(selectedCountries, id, type){

var legendRectSize = 18;
var legendSpacing = 4;
// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 450 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);


// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(4).tickFormat(d3.format("d"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5).tickFormat(function(d) { if(type == "trading"){return d + "%"; }else{return d;}});

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); })
	  .defined(function(d) {if(type == "trading"){return d.value != "..";}else{return d.value!=""}});
 
 //Setting color scale
    var colorList = ["#2D6994", "#805B6B", "#869EB0", "#753C2E", "#557036", "#2293B5", "#96210C", "#9C6421"];
    var lineColor = d3.scale.ordinal().range(colorList)

// Adds the svg canvas
var mySVG = d3.select(id)
    .append("svg")
        .attr('class', 'lineChart')
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

//Adding legend
var legend = mySVG.selectAll('.legend')
      .data(selectedCountries)
      .enter()
      .append('g')
      .attr('class', 'line-legend')
      .attr('transform', function(d, i) {
    var height = -legendRectSize - legendSpacing;
    var offset =  height * selectedCountries.length;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

//Appending circle to legend
legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', function(d,i){ return lineColor(i);})
  .style('stroke', function(d,i){ return lineColor(i);})
  .attr('rx', 10)
  .attr('ry', 10)
  .attr("x", 450)


  //Adding text in legend
  legend.append('text')
    .attr('x', 470)
    .attr("y", legendRectSize - legendSpacing)
    .attr("class", function(d,i){return "textis-"+name2code(selectedCountries[i].properties.name)})
    .text(function(d){ return d.properties.name;})
    .attr('text-transform', 'capitalize')
    .attr('font-size', '12px')
    .attr('opacity', 0.7)
	.on("mouseover", function (d) {    
          d3.select(this).style("opacity", 1);
		  d3.selectAll(".line" + this.className.animVal.substr(4,7)).style("stroke-width",'4px');
	})
	.on("mouseout", function(d) {
          d3.select(this).style("opacity", 0.7);
		  d3.selectAll(".line" + this.className.animVal.substr(4,7)).style("stroke-width",'2px')
	})


  //Loop through data
  for(i in selectedCountries){
    var code = name2code(selectedCountries[i].properties.name);
    if(type == "co2"){
      var data = d3.entries(countries[code].co2);
    }
    else{
      var data = d3.entries(countries[code].tradingBalance);
    }
   
    //SETTING X AND Y DOMAIN 

    // Scale the range of the data (same years for both sets)
    x.domain(d3.extent(data, function(d) {return d.key; }));
    
    //Co2 from 0-30 and trading balance from -30 to 30
    if(type == "co2"){
      y.domain([0, 50]);
    }
    else{
      y.domain([-100,100])
    }

 
    // Add the valueline path.
    mySVG.append("path")
        .attr("class", "line")
        .attr("class", "lineis-"+code)
		.attr('id', code)
        .attr("d", valueline(data))
        .attr("stroke", lineColor(i))
        .on("mouseover", function (d) {
          d3.selectAll(".lineis-"+this.id)    //on mouseover of each line, give it a nice thick stroke
          .style("stroke-width",'4px');
          d3.selectAll(".textis-"+this.id).style("opacity", 1)

        })
        .on("mouseout", function(d) {        //undo everything on the mouseout
            d3.selectAll(".lineis-"+this.id)
              .style("stroke-width",'2px'); 
              d3.selectAll(".textis-"+this.id).style("opacity", 0.7)     
        })
 
  } 

    // Add the X Axis
    mySVG.append("g")
        .attr("class", "multiline Xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    // Add the Y Axis
    mySVG.append("g")
        .attr("class", "multiline Yaxis")
        .call(yAxis);


// text label for the y-axis
if(type == "co2"){
  mySVG.append("text")
    .attr("class","anchor")
    .attr("y", -30)
    .attr("x",0 )
    .attr("dy", "1em")
        .style("padding-left", "100px")

    .style("text-anchor", "middle")
    .text("CO2/capita [ton]");  
} 
else{

mySVG.append("svg:line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", height/2)
      .attr("y2", height/2)
      .style("stroke", "#FF5252");

 mySVG.append("text")
    .attr("class","anchor")
    .attr("y", -30)
    .attr("x",0 )
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("padding-left", "100px")
    .text("Trade balance [%]");  
  }  
  //Text label for x-axis
  mySVG.append("text")
    .attr("class","anchor")
    .attr("y", height-10)
    .attr("x",width+35)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Year"); 

}

//Clear linechart
function clearLineChart(id){
    var mySVG = d3.select(id).html("");
}


