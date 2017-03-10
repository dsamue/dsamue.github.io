//d3.select(window).on("resize", throttle);

//Declaring initial variables
var country; 

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

var legendFullWidth = 50;
var legendMargin = { top: 20, bottom: 20, left: 5, right: 35 };
var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;

var width = document.getElementById('container').offsetWidth-legendFullWidth-10;
var height = width / 1.9;
var topo,projection,worldPath,worldSvg,worldG;
var graticule = d3.geo.graticule();
var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
var landETT;
var landTwo; 
var clickState = 0;
var mapDone = false;
var selectedCountries = [];
var colorScale = ["#FF5252", "#EEEEEE", "#0091EA"]; 

// add the legend now
var legendFullHeight = height;

// use same margins as main plot
var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;


var legendSvg = d3.select('#container')
	.append('svg')
	.attr('id', 'map-legend')
	.attr('width', legendFullWidth)
	.attr('height', legendFullHeight)
	.append('g')
	.attr('transform', 'translate(' + legendMargin.left + ',' +
	legendMargin.top + ')');

updateColourScale(colorScale);

// update the colour scale, restyle the plot points and legend
function updateColourScale(scale) {
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
		.orient("right")
		//.tickValues(d3.range(-30, 31))
		.tickFormat(function(d) { return d + "%"; });

	legendSvg.append("g")
		.attr("class", "legend axis")
		.attr("transform", "translate(" + legendWidth + ", 0)")
		.call(legendAxis);
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
      .attr("width", width)
      .attr("height", height)
      .append("g");;

      if(container == "#container"){
      	worldSvg
      		.call(zoom)
      		.on("click", click);
  		}
  		else{
  			worldSvg.attr("class", "countrySizePos");
  		}

  worldG = worldSvg.append("g");
}

//Drawing large map
//d3.json("world-topo-min.json", function(error, world) {
//  var countries = topojson.feature(world, world.objects.countries).features;
//  topo = countries;
//});


//Drawing map and/or small country depending on mapType
function draw(topo) {
	//if(mapType == "large"){
		// worldSvg.append("path")
	 //     .datum(graticule)
	 //     .attr("class", "graticule")
	 //     .attr("d", worldPath);

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

		//Nollställfärgen på alla bars //Funkar inte riktigt eftersom alla förflyttningar verkar räknas som en ny mouse-over
		// d3.selectAll(".bar")
		//   	.attr('fill', 'blue');

		//Hämtar export-/importinfo från data
		var code = name2code(d.properties.name);
		var exportInfo = "";
		var importInfo = "";
//		var countryExports = countries[code].exports[2015]
//		var countryImports = countries[code].imports[2015]

//		for(var key in countryExports) {
//		    exportInfo += "</br>" + countryExports[key].partner;
//		}

//		for(var key in countryImports) {
//		    importInfo += "</br>" + countryImports[key].partner;
//		}

      var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );


      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name + "</br></br>  Top  exports: " + exportInfo + "</br></br>  Top  imports: " + importInfo);

      })

	//Stop hovering a country
  	.on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);

       //ta bort eventuell highlight på bar chart 
     //   var code = name2code(d.properties.name);

     //   d3.select(".bar#" + code)
		  	// .attr('fill', 'black');
      })

      //Clicking a country
	.on("click", function(d, i) {
    	// Plockar ut koden för klickat land 
		var code = name2code(d.properties.name);
    	
    	// Om vi får välja flera länder på samma gång 
		if(multipleCountriesCheckbox.val() == "true"){
			// Testa om det är en deselect eller select
			// OM det inte är en deselect så lägger vi till landet, highlightar dens bar och landet i kartan
			if(!(deselectCountry() == true)){
				selectedCountries.push(d);
				highlightBar();
				highlightInMap();
			}
			// Update sidebar med selected country
				updateSideBarSelected();
			
		// Om vi bara får välja ett land åt gången 				
		}else{
			if(deselectCountry() == true){
				landETT = "";
				// göm div för one country och visa för no country
		  		d3.select("#sidebarNoCountry").classed("hidden", false);
 		  		d3.select("#sidebarOneCountry").classed("hidden", true);
			}else{
				selectedCountries[0] = d;	
				landETT = d;
			 	
			 	lowlightBarAll();
		 	 	highlightBar();
				clearLineChart();
				clearTradeLineChart();
		        updateSideBar();
  				drawPieChart();
				drawLineTradeBalance(countries[code].tradingBalance);	
				
				// Visa div för one country och göm för no country		 
			  	d3.select("#sidebarNoCountry").classed("hidden", true); 		
 		  		d3.select("#sidebarOneCountry").classed("hidden", false);
			}
		}

		function deselectCountry(){
			if(selectedCountries[0] != undefined || selectedCountries.length == 0){
				for(j in selectedCountries){
					if(selectedCountries[j].id == i){
						selectedCountries.splice(j, 1);
					  	lowlightBar();
						return true;
					}		
				}			
			}
		}
		
		highlightInMap();

		function highlightInMap(){
			if(selectedCountries[0] != undefined){
				d3.selectAll(".country").classed("unfocus", true);
				for(i in selectedCountries){
					var clicked = d3.select("#" + name2code(selectedCountries[i].properties.name))
					clicked.classed("unfocus", false);
					clicked.classed("selected", true);				
				}
			}else{
				d3.selectAll(".country").classed("unfocus", false);
			}
		}
				
		function highlightBar(){
			d3.select(".bar#" + code)
	  			.attr('fill', 'orange');			
		}

		function lowlightBar(){
			d3.select(".bar#" + code)
	  			.attr('fill', 'black');	
	  	}

		function lowlightBarAll(){
			d3.selectAll(".bar")
	  			.attr('fill', 'black');			
		}

		console.log("selectedCountries:", selectedCountries);

		var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );
			
	    tooltip.classed("hidden", false)
            .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
            .html(d.properties.name);
	  });
}


function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height, "#container", "world");
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
            return "black"
	      	}

	      	//Hämta trading balance för rätt år och land
      		var tradingBalance = countries[kod].tradingBalance[year];

      		//Fixa färgskala 
      		var color = d3.scale.linear().domain([-30,0,30]).range(colorScale); 

          //Returnera svart om data saknas
            if (tradingBalance == ".." || tradingBalance == undefined){
              return "black";
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

	//Object for storing selected countries RESET on toggle
	if(landETT!= undefined){
		selectedCountries = [landETT]
	}else{
		selectedCountries = [];
		d3.selectAll(".country").classed("unfocus", false);
	}

	if (multipleCountriesCheckbox.val() == "true") {

		createSideBarSelected();
		d3.select("#sidebarOneCountry").classed("hidden", true);
		d3.select("#sidebarNoCountry").classed("hidden", true);

		d3.select("#multipleCountries").classed("hidden", false);
		d3.select("#sidebarCompareCountries").classed("hidden", false);
	} else {

		d3.selectAll(".bar")
	  		.attr('fill', 'black');

		d3.select("#sidebarNoCountry").classed("hidden", false);

		d3.select("#sidebarCompareCountries").classed("hidden", true);
		d3.select("#multipleCountries").classed("hidden", true);
	}
});


$('.leftTriangle').click(function() {
	if (sidebar.attr("out") == "false") {
		drawLine(selectedCountries)
		sidebar.attr("out", "true");
		$(".streck1").addClass("rotate rotate_transition");
		sidebar
			.animate({
				right: "50%"
			}, 600 );
	} else {
		clearLineChart();
		$(".streck1").removeClass("rotate rotate_transition");
		sidebar.attr("out", "false");
		sidebar
			.animate({
				right: 0
			}, 600 );
	}
});


$('#deselectCountries').click(function() {
	multipleCountries = [];
});