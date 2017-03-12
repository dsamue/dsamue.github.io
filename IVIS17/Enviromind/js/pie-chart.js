var width = 160;
var height =  width;
var radius = Math.min(width, height) / 2;
var legendRectSize = 12;
var legendSpacing = 4;

var color = d3.scale.ordinal()
  .domain(["Renewable", "Fossil fuel", "no data"])
  .range(["#448AFF", "#424242", "#f1f1f1"]);

var svg2 = d3.select("#pie-chart-container")
	.append('svg')
	.attr('id', 'pie-chart')
  	.attr('width', width)
  	.attr('height', height*1.5)
  	.append('g')
  	.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

var arc = d3.svg.arc()
  	.innerRadius(0)
  	.outerRadius(radius);

var pie = d3.layout.pie()
  .value(function(d) { return d[1]; })
  .sort(null);

var nodataset = [['no data', 99],['no data', 0]]

var path = svg2.selectAll('path')
	.data(pie(nodataset))
  	.enter()
	.append('path')
	.attr('d', arc)
	.style('stroke-width', '0px')
	.style('fill', function(d){
    return color(d.data[0]);
	})
	
var legend = svg2.selectAll('.legend')
  .data(color.domain())
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {
    	var height = legendRectSize + legendSpacing;
    	var offset =  height * color.domain().length / 2;
    	var horz = i*-radius*0.95;
    	var vert = height - offset+(10/7)*radius;
    	return 'translate(' + horz + ',' + vert + ')'
    })
  .attr('display', function(d, i){
  		if(d == 'no data'){
  			return 'none'
  		}
  	});
	
legend.append('rect')
	.attr('width', legendRectSize)
	.attr('height', legendRectSize)
	.style('fill', color)
	.style('stroke', color)
	.attr('rx', 2)
	.attr('ry', 2)
	.attr('y', -2)

legend.append('text')
	.attr('x', legendRectSize + legendSpacing)
	.attr('y', legendRectSize - legendSpacing)
	.text(function(d) { return d; })
   	.attr('text-transform', 'capitalize')
   	.attr('font-size', '12px')
   	.attr('opacity', 0.5)

drawPieChart = function(){
	console.log(year)
	code = name2code(landETT.properties.name);
	
	svg2.select("#piechart-nodatainfo")
	  .remove();
			
	if(year < 1990 || year > 2012){
		path.data(pie(nodataset))
			.attr('d', arc)
			.style('fill', function(d){
    		return color(d.data[0]);
		})	

		pie.value(function(d) { return d[1]; })
		
		svg2.append("text")
		  .attr('id', 'piechart-nodatainfo')
		  .attr("text-anchor", "middle")
		  .text("Data available 1990-2012");
	}
	else{
		path.data(pie(countries[code].renewables[year]))
			.attr('d', arc)
			.style('fill', function(d){
    		return color(d.data[0]);
		})		
		pie.value(function(d) { return d[1]; })

	}
}
















