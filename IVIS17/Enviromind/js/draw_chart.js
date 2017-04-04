//Create svg-area for bar chart
var svg = d3.select( "#chart")
            .append( "svg" )
            .attr('id', 'barChart')
            .attr( "display", "block")
            .attr( "margin", "auto")
            .attr('viewBox', "0 0 960 200")
            .attr("preserveAspectRatio","xMidYMid meet");


var chart = $("#barChart"),   //barChart behöver konfigureras om man ska återanvända detta
    aspect = chart.width() / chart.height(),
    container = chart.parent();

$(window).on("resize", function() {
    var targetWidth = container.width();
    var targetHeight = container.height()
    chart.attr("width", targetWidth);     //Här finns det säkert nån smidigare lösning men jag delat targetwidth för att få lämplig bredd!
    chart.attr("height", targetHeight);
}).trigger("resize");


var sqrt = d3.scale.pow().exponent(.5)

var labels = ["The Americas", "Europe", "Africa", "Asia", "Oceania"];
  
  var x = d3.scale.ordinal()
    .domain(labels)
    .rangePoints([0, 960]);


  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");


  svg.append("g")
    .attr("class", "myaxis")
    .attr("transform","translate(0,20)")
    .call(xAxis);


//Kolla om musknappen är nedtryckt (för att dra i slidern)
var mouseDown = 0;
document.body.onmousedown = function() { 
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
}


function drawBarChart(){
  //Create tooltip
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-20, 0])
  .html(function(d) {
    if($('input[name="co2value"]:checked').val() == "capita"){
      return "<h4>"+d.value.name+ "</h4><p>" + Math.round(d.value.co2[year] * 10) / 10 + " tons<br/> CO<sub>2</sub> per capita</p>";
    }

    else{
      return "<h4>" + d.value.name +"</h4><p>" + Math.round(d.value.co2total[year]/1000 * 10) / 10 + " million tons <br/> CO<sub>2</sub> in total</p>";
    }
  })

//Setting label for CO2
setLabel();

//Creating data
var data = d3.entries(countries).sort(
                                        function(a,b){
                                          //sorting from 1-8 of continentID to get 
                                          //order of data for the bars to match the map
                                          return d3.ascending(a.value.continentID, b.value.continentID);
                                        })

  //Make selection and connect to data              
  var selection = svg.selectAll( "rect" )
                     .data(data);

  svg.call(tip);


    //Create new bars
    
	selection.enter()
      .append( "rect" )
      .attr('class', 'bar')
      .attr('id', function(d){
        return d.value.code
      })
      .attr( "x", function(d,i){
        return i*5;
      })
      .attr( "width", 4 )
      .attr( "fill", function(d) {
		  if (d.value.continentID%2 == 0) {
			  return "#607B8D";
		  } else {
			  return "#424242";
		  }
	  })

    //Set bar heights based on data
    selection
      .attr( "height", function(d){
        if (isNaN(d.value.co2[year])){
          return 0;
        }
        else if ($('input[name="co2value"]:checked').val() == "capita"){
          return sqrt(d.value.co2[year])*14;
        }

        else if($('input[name="co2value"]:checked').val() == "total"){
          return sqrt(d.value.co2total[year])/25;
        }

      })

      //Set y position to get bars in right orientation
      .attr( "y", 22)

      //Show tooltip on hover if neither mousekey is pressed nor play-funtion active
      .on('mouseover', function(d){
        if(play == false && mouseDown == false){tip.show(d)} 
      })
      .on('mouseout', tip.hide);

      // remove any unused bars
      selection.exit()
        .remove();
}


function setLabel(){
  //Setting label for CO2

if($('input[name="co2value"]:checked').val() == "capita"){
  //write c02 label
  d3.select("#barchartLabel").html("<h4>ton CO2/capita</h4>")
}
else{
  //write total label
  d3.select("#barchartLabel").html("<h4>million ton CO2</h4>")

}
}