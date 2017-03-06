d3.select(window).on("resize", throttle);

//Declaring initial variables
var country; 

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

var width = document.getElementById('container').offsetWidth;
var height = width / 1.9;
var topo,projection,worldPath,worldSvg,worldG;
var graticule = d3.geo.graticule();
var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
var landETT;
var landTwo; 

//Calling setup-function to start setting up map
setup(width,height, "#container", "world");

//Setting up countries
//variables 'container' and 'theclass' changes depending on large or small map-view
function setup(width,height, container, theclass){
  projection = d3.geo.mercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI)
    .center( [ 0 , 20] );

  worldPath = d3.geo.path().projection(projection);

  worldSvg = d3.select(container).append("svg")
      .attr("class", theclass)
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
d3.json("world-topo-min.json", function(error, world) {
  var countries = topojson.feature(world, world.objects.countries).features;
  topo = countries;
  draw(topo);
});


//Drawing map and/or small country depending on mapType
function draw(topo) {
	//if(mapType == "large"){
		// worldSvg.append("path")
	 //     .datum(graticule)
	 //     .attr("class", "graticule")
	 //     .attr("d", worldPath);

	 //  worldG.append("path")
	 //   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
	 //   .attr("class", "equator")
	 //   .attr("d", worldPath);
	//}
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
}

//Function that holds all interaction functionality with a country
function countryInteraction(){
 	//offsets for tooltips
  	var offsetL = document.getElementById('container').offsetLeft+20;
  	var offsetT = document.getElementById('container').offsetTop+10;
  	//tooltips
	var clickState = 0;
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
	  	//If first country to be clicked
		  if (clickState == 0) {
		  	d3.select("#sidebarNoCountry").classed("hidden", true);
		  	d3.select("#sidebarOneCountry").classed("hidden", false);
		  	d3.select("#sidebarMultipleCountries").classed("hidden", true);
		  	console.log("i IF " + clickState);
			landETT = d;

			//Clear multiple lineChart if we have one
			clearLineChart();

			// Update sidebar values and draw piechart
	        updateSideBar();
  			drawPieChart();

			clickState++;
        
		} 
		//If second country to be clicked
		else if (clickState == 1) {
			d3.selectAll(".compareWorld").remove();
			d3.select("#sidebarOneCountry").classed("hidden", true);
			d3.select("#sidebarMultipleCountries").classed("hidden", false);

			landTwo = d;

			//var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );

			var width = document.getElementById('compareContainer').offsetWidth/2;
			var height = width / 1.9;

			//Kan eventuell kolla hur man väljer fler länder här.
			setup(width,height, "#compareContainer", "compareWorld");
			draw([landETT]);
			setup(width,height, "#compareContainer", "compareWorld");
			draw([landTwo]);
			
			//Create code for each country
			var kod1 = name2code(landETT.properties.name);
			var kod2 = name2code(landTwo.properties.name);

			//Call multiple line chart 
			drawLine(countries[kod1].co2, countries[kod2].co2);
			clickState = 0;
		  }


	  //Nollställ eventuell  highlightad stapel
	  d3.selectAll(".bar")
	  	.attr('fill', 'black');


	  //Hämtar landskod så kan fylla i rätt land 
	  var code = name2code(d.properties.name);

	  //Highlighta ny stapel i bar chart
	  d3.select(".bar#" + code)
	  	.attr('fill', 'orange');


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

      		//Om nåt är knas
      		if(kod==''){
	      		return "#000"
	      	}

	      	//Hämta co2 för rätt år och land
      		var tradingBalance = countries[kod].tradingBalance[year];

      		//Generera färg beroende på co2-utsläpp	
      		var color = d3.scale.linear().domain([-20,0,20]).range(["#7860B9", "#EAE8E6", "#5AA9EC"]); 
          	return color(tradingBalance); 

        });

}
