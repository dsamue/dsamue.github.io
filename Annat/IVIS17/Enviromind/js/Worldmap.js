d3.select(window).on("resize", throttle);

//Declaring initial variables
var country; 

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

var legendFullWidth = 60;
var legendMargin = { top: 10, bottom: 10, left: 40, right: 5 };
var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;

// var width = document.getElementById('container').offsetWidth-legendFullWidth-30;
var width = d3.select("#container").node().getBoundingClientRect().width-legendFullWidth-60;
var height = width / 1.9;
var topo,projection,worldPath,worldSvg,worldG;
var graticule = d3.geo.graticule();

var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
var tooltipSide = d3.select("#maincontent").append("div").attr("class", "tooltip hidden");

var landETT;
var landTwo;
var clickState = 0;
var mapDone = false;
var selectedCountries = [];
var colorScale = ["#FF5252", "#EEEEEE", "#0091EA"]; 




function createLegend(width,height){
// add the legend now
var legendFullHeight = height;
// use same margins as main plot
var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;


var legendSvg = d3.select('#container')
	.append('svg')
	.attr('id', 'map-legend')
	.attr('width', legendFullWidth+50)
	.attr('height', legendFullHeight)
	.attr("x", 200)
	.append('g')
	.attr('transform', 'translate(' + legendMargin.left*2 + ',' +
	legendMargin.top + ')');
	updateColourScale(colorScale, legendSvg, legendHeight);
}
// update the colour scale, restyle the plot points and legend
function updateColourScale(scale, legendSvg, legendHeight) {
	// create colour scale
	var colorScale = d3.scale.linear()
		.domain(linspace(-3, 3, scale.length))
		.range(scale);

	// style points
	d3.selectAll('circle')
		.attr('fill', function(d) {
			return colorScale(d.z);
		});

	// clear current legend
	legendSvg.selectAll('*').remove();


	// append gradient bar
	var gradient = legendSvg.append('defs')
		.append('linearGradient')
		.attr('id', 'gradient')
		.attr('x1', '0%') // bottom
		.attr('y1', '100%')
		.attr('x2', '0%') // to top
		.attr('y2', '0%')
		.attr('spreadMethod', 'pad');

	// programatically generate the gradient for the legend
	// this creates an array of [pct, colour] pairs as stop
	// values for legend
	var pct = linspace(0, 100, scale.length).map(function(d) {
		return Math.round(d) + '%';
	});

	var colourPct = d3.zip(pct, scale);

	colourPct.forEach(function(d) {
		gradient.append('stop')
			.attr('offset', d[0])
			.attr('stop-color', d[1])
			.attr('stop-opacity', 1);
	});

	legendSvg.append('rect')
		.attr('x1', 0)
		.attr('y1', 0)
		.attr('width', legendWidth)
		.attr('height', legendHeight)
		.style('fill', 'url(#gradient)');

	// create a scale and axis for the legend
	var legendScale = d3.scale.linear()
		.domain([-30, 30])
		.range([legendHeight, 0]);

	var legendAxis = d3.svg.axis()
		.scale(legendScale)
		.orient("left")
		.tickFormat(function(d) { return d; }).ticks(0);

	legendSvg.append("g")
		.attr("class", "legend axis")
		.attr("transform", "translate(0, 0)")
		.call(legendAxis);

	legendSvg.append("text")
    .attr("class","anchor")
    .attr("y", 12)
    .attr("x", -40)
    .style("text-anchor", "middle")
    .text("Export heavy")
    .style("font-size", "12px");

    legendSvg.append("text")
    .attr("class","anchor")
    .attr("y", legendHeight-2)
    .attr("x", -40)
    .style("text-anchor", "middle")
    .text("Import heavy")
    .style("font-size", "12px");
  

}



function linspace(start, end, n) {
	var out = [];
	var delta = (end - start) / (n - 1);

	var i = 0;
	while(i < (n - 1)) {
		out.push(start + (i * delta));
		i++;
	}

	out.push(end);
	return out;
}

//Calling setup-function to start setting up map
setup(width, height, "#container");

//Setting up countries
//variables 'container' and 'theclass' changes depending on large or small map-view
function setup(width, height, container){
  projection = d3.geo.robinson()
  //OBS!! Note to self. fullösning. Försök ta bort hårdkodningen på 50 px här sedan //Spansk
    .translate([(width/2), (height/2)-50])
    .scale( width / 2 / Math.PI)
    .center( [ 0 , 20] );

  worldPath = d3.geo.path().projection(projection);

  worldSvg = d3.select(container).append("svg")
      .attr("class", "world")
	  .attr('id', 'world-map')
      .attr("width", width)
      .attr("height", height)
      .append("g");;

      if(container == "#container"){
      	worldSvg
      		.call(zoom)
      		.on("dblclick.zoom", null);
  		}
  		else{
  			worldSvg.attr("class", "countrySizePos");
  		}

  worldG = worldSvg.append("g");

  //Create legend (so it will append after the map)
   // clear current legend
	d3.selectAll('#map-legend').remove();
 	createLegend(width, height);
}

//Drawing large map
//d3.json("world-topo-min.json", function(error, world) {
//  var countries = topojson.feature(world, world.objects.countries).features;
//  topo = countries;
//});


//Drawing map and/or small country depending on mapType
function draw(topo) {

	worldG.append("path")
	   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
	   .attr("class", "equator")
	   .attr("d", worldPath);
	   country = worldG.selectAll(".country").data(topo);

	//check id attrubite here (d.properties.name for large, d.id for small???)
	//With d.properties.name for both the info-box shows up on hover for both
	country.enter().insert("path")
      .attr("class", "country")
      .attr("d", worldPath)
      .attr("id", function(d,i) { return name2code(d.properties.name); })
      .attr("title", function(d,i) { return d.properties.name; });
  		

  //Setting colors for the map
  updateMapColors();
  countryInteraction();

  mapDone = true;
}

//Function that holds all interaction functionality with a country
function countryInteraction(){
 	//offsets for tooltips
  	var offsetL = document.getElementById('container').offsetLeft+20;
  	var offsetT = document.getElementById('container').offsetTop+10;
  	//tooltips
	//var clickState = 0;  //clickstate needs to be a gobal variable to fix the handle bug. //David
	var sidebarDiv = document.getElementById('sidebar');
	var mapScreen = document.getElementById('mapScreen');
	d3.select("#compareLineChart").classed("hidden", true);

	country
	//Hover a country
    .on("mousemove", function(d,i) {
		f = 0;
      	var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );

      	tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name);
      })

	//Stop hovering a country
  	.on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      })

      //Clicking a country
	.on("click", function(d, i) {
    	// Plockar ut koden för klickat land 
		var code = name2code(d.properties.name);
		//Only the countries that exist will be selectable
    	if(countries[code] != undefined){
	    	// Om vi får välja flera länder på samma gång 
			if(multipleCountriesCheckbox.val() == "true"){
				// Testa om det är en deselect eller select
				// OM det inte är en deselect så lägger vi till landet, highlightar dens bar och landet i kartan
				if(!(deselectCountry(this) == true)){
					if (selectedCountries.length >= 8) {
						alert("Please select a maximum of 8 countries");
					} else {
						selectedCountries.push(d);
						highlightBar();
						selectInMap(this);
					}
				}
				// Update sidebar med selected country
				updateSideBarSelected();
				
			// Om vi bara får välja ett land åt gången 				
			}else{
				if(deselectCountry(this) == true){
					landETT = "";
					// göm div för one country och visa för no country
			  		d3.select("#sidebarNoCountry").classed("hidden", false);
	 		  		d3.select("#sidebarOneCountry").classed("hidden", true);
				}else{
					selectedCountries[0] = d;	
					landETT = d;
					unselectAllInMap();
				 	selectInMap(this);

				 	lowlightBarAll();
			 	 	highlightBar();
					clearLineChart();
					clearTradeLineChart();
			        updateSideBar();
	  				drawPieChart();
					
					// Visa div för one country och göm för no country		 
				  	d3.select("#sidebarNoCountry").classed("hidden", true); 		
	 		  		d3.select("#sidebarOneCountry").classed("hidden", false);
					
					drawLineTradeBalance(countries[code].tradingBalance);	
				}
			}
		}
		else{
			console.log("country undefined")
		}

		function deselectCountry(){
			if(selectedCountries[0] != undefined || selectedCountries.length == 0){
				for(j in selectedCountries){
					if(selectedCountries[j].id == i){
						selectedCountries.splice(j, 1);
					  	lowlightBar();
					  	unselectInMap(this);
						return true;
					}		
				}			
			}
		}
		
		function selectInMap(selectedC){ 
			d3.select(selectedC.parentNode.appendChild(selectedC))
				.attr("class", "country selected")
		}

		function unselectInMap(selectedC){
			d3.select("#"+code)
			 	.classed("selected", false);
		}

		function unselectAllInMap(){
			d3.select(".selected")
				.classed("selected", false)			
		}

/*		function highlightInMap(){
			if(selectedCountries[0] != undefined){
				d3.selectAll(".country").classed("selected", false);
				for(i in selectedCountries){
					var clicked = 
					d3.select(("#"+code).parentNode.appendChild("#"+code))
					.attr("class", "country selected")
			
				}
			}else{
				d3.selectAll(".country").classed("selected", false);
			}
		} */ 

/*		d3.select(this.parentNode.appendChild(this))
	    	.attr("id", this.id)
        	.attr("class", function(){
			if(selectedCountries[0] != undefined || selectedCountries.length != 0){
        		for(j in selectedCountries){
					if(selectedCountries[j].id == i){
						return("country hover selected")
		        	}else{
		        		return ("country hover")
			        }
			    }
			}else{
		        return ("country hover")				
			}
		})*/ 

				
		function highlightBar(){
			d3.select(".bar#" + code)
	  			.attr('fill', "#7C4DFF");			
		}

		function lowlightBar(){
			d3.select(".bar#" + code)
	  			.attr('fill', function(d) {
				  if (d.value.continentID%2 == 0) {
					return "#607B8D";
				  } else {
					return "#424242";
				  }
				});	
	  	}

		function lowlightBarAll(){
			d3.selectAll(".bar")
	  			.attr('fill', function(d) {
				  if (d.value.continentID%2 == 0) {
					return "#607B8D";
				  } else {
					return "#424242";
				  }
				});				
		}

		var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );
			
	    tooltip.classed("hidden", false)
            .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
            .html(d.properties.name);
	  });
}


function redraw() {

  width = d3.select("#container").node().getBoundingClientRect().width-legendFullWidth-60;
  height = width / 2;
  d3.select('#world-map').remove();
  setup(width,height, "#container");
  draw(topo);
}


function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;
  zscale = s;
  var h = height/4;


  t[0] = Math.min(
    (width/height)  * (s - 1),
    Math.max( width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s,
    Math.max(height  * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  worldG.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".country").style("stroke-width", 1.5 / s);

}

var throttleTimer;

function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}

//geo translation on mouse click in map
function click() {
  var latlon = projection.invert(d3.mouse(this));
}

//Updating map-values
function updateMapColors(){
	    d3.selectAll("path.country")
        .style("fill", function(){
      		
      		//Hämta landskod	
      		var kod = this.id;

      		//Om landet från kartan inte inte finns i iso-listan
      		if(kod==''){
            return "url(#lightstripe)"
	      	}

	      	//Hämta trading balance för rätt år och land
      		var tradingBalance = countries[kod].tradingBalance[year];

      		//Fixa färgskala 
      		var color = d3.scale.linear().domain([-30,0,30]).range(colorScale); 

          //Returnera svart om data saknas
            if (tradingBalance == ".." || tradingBalance == undefined){
              return "url(#lightstripe)";
            }

            //Generera annars färg beroende på trading balance 
            else{
              return color(tradingBalance); 
            }
        });
}

var multipleCountriesCheckbox = $('#multipleCountriesCheckbox');
var sidebar = $("#sidebar");

multipleCountriesCheckbox.change(function(){
	cb = $(this);
	cb.val(cb.prop('checked'));

	if (multipleCountriesCheckbox.val() == "true") {
	// Om multiple countries är valt.
	// Rensa sidebar ifall selected countries är tom eller ifall den är undefined
	// Här hamnar man också om man kommer hit efter att ha klickat i och klickat av multiple countries utan att ha valt något imellan
		if(selectedCountries[0] == "" || selectedCountries[0] == undefined){
			clearSideBarSelected();
		}else{
	// Annars uppdatera selectedCountries-listan så att landEtt verkligen ligger där och uppdatera sidebar så att det visas
			selectedCountries = [landETT]	
			updateSideBarSelected();
		}

	// Visa divar relaterade till multiple countries och göm övriga
		d3.select("#sidebarOneCountry").classed("hidden", true);
		d3.select("#sidebarNoCountry").classed("hidden", true);

		d3.select("#multipleCountries").classed("hidden", false);
	} else {
		// Om multiple countries är av-valt
		// Rensa valda länder och ta bort fokus från länder och bars
		selectedCountries = [];

		d3.selectAll(".country").classed("selected", false);
		d3.selectAll(".bar")
	  		.attr('fill', 'black');

	  	// Visa att inget land är valt och göm alla divar relaterade till flera länder
		d3.select("#sidebarNoCountry").classed("hidden", false);

		d3.select("#sidebarMultipleCountries").classed("hidden", true);
		d3.select("#multipleCountries").classed("hidden", true);
	}
});


// From http://stackoverflow.com/questions/15191058/css-rotation-cross-browser-with-jquery-animate 
$.fn.animateRotate = function(angle, duration, easing, complete) {
  var args = $.speed(duration, easing, complete);
  var step = args.step;
  return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
      $.style(e, 'transform', 'rotate(' + now + 'deg)');
      if (step) return step.apply(e, arguments);
    };

    $({deg: 0}).animate({deg: angle}, args);
  });
};

$('.leftTriangle').click(function() {
	if (sidebar.attr("out") == "false") {

		drawLine(selectedCountries,"#compare-line-chart", "co2");
		drawLine(selectedCountries, "#sideLineChartContainer", "trading");

		d3.select("#sidebarMultipleCountries").classed("hidden", false);

		sidebar.attr("out", "true");

		$("#openclose").animateRotate(0, {
  			duration: 600,
  			easing: 'linear',
  			complete: function () {},
  			step: function () {}
		});

		sidebar
			.animate({
				right: "50%"
			}, 600 );
	} else {

		$("#openclose").animateRotate(45, {
  			duration: 600,
  			easing: 'linear',
  			complete: function () {},
  			step: function () {}
		});
		sidebar.attr("out", "false");
		sidebar
			.animate(
			{right: 0}, 
			600, function(){
				d3.select("#sidebarMultipleCountries").classed("hidden", true);
				clearLineChart("#compare-line-chart");
		  		clearLineChart("#sideLineChartContainer");
				
			})
		}
});


$('#deselectCountries').click(function() {
	selectedCountries = [];
	clearSideBarSelected();
	
	d3.selectAll(".country").classed("selected", false);	
	d3.selectAll(".bar")
	  	.attr('fill', function(d) {
		  if (d.value.continentID%2 == 0) {
			return "#607B8D";
		  } else {
			return "#424242";
		  }
	    });

	if (sidebar.attr("out") == "true"){
		$("#openclose").animateRotate(45, {
  			duration: 600,
  			easing: 'linear',
  			complete: function () {},
  			step: function () {}
		});
		sidebar.attr("out", "false");
		sidebar
			.animate(
			{right: 0}, 
			600, function(){
				d3.select("#sidebarMultipleCountries").classed("hidden", true);
				clearLineChart("#compare-line-chart");
		  		clearLineChart("#sideLineChartContainer");
				
			})
	}


});

