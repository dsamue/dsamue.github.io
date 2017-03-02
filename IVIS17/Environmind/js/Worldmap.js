d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

var width = document.getElementById('container').offsetWidth;
var height = width / 1.9;

var colors = {
	"Albania": "#8dd3c7",
	"Azerbaijan": "#ffffb3",
	"Argentina": "#bebada",
	"Australia": "#fb8072",
	"Bangladesh": "#80b1d3",
	"Armenia": "#fdb462",
	"Bulgaria": "#b3de69",
	"Belarus": "#fccde5",
	"Chile": "#d9d9d9",
	"China": "#bc80bd",
	"Colombia": "#ccebc5",
	"Croatia": "#ffed6f",
	"Czech Rep.": "#66c2a5",
	"Dominican Rep.": "#fc8d62",
	"El Salvador": "#8da0cb",
	"Estonia": "#e78ac3",
	"Finland": "#a6d854",
	"Georgia": "#ffd92f",
	"Hungary": "#e5c494",
	"India": "#b3b3b3",
	"Japan": "#e41a1c",
	"Latvia": "#377eb8",
	"Lithuania":"#4daf4a",
	"Mexico":"#984ea3",
	"Moldova":"#ff7f00",
	"Macedonia":"#ffff33",
	"United Kingdom":"#a65628",
	"Bosnia":"#f781bf",
	"Algeria":"#999999",
	"Bosnia Herzegovina": "#b3e2cd",
	"Canada":"#fdcdac",
	"Indonesia":"#cbd5e8",
	"Iran":"#f4cae4",
	"Iraq":"#e6f5c9",
	"Jordan":"#fff2ae",
	"South Korea":"#f1e2cc",
	"Kyrgyzstan":"#cccccc",
	"Morocco":"#fbb4ae",
	"Nigeria":"#b3cde3",
	"Pakistan":"#ccebc5",
	"Peru":"#decbe4",
	"Philippines":"#fed9a6",
	"Puerto Rico":"#ffffcc",
	"Saudi Arabia":"#e5d8bd",
	"Singapore":"#fddaec",
	"South Africa":"#f2f2f2",
	"Egypt":"#ccc",
	"Serbia":"#ece2f0",
	"Montenegro":"#d0d1e6",
	"Andorra":"#a6bddb",
	"Brazil":"#67a9cf",
	"Cyprus":"#3690c0",
	"Ethiopia":"#02818a",
	"France":"#016c59",
	"Ghana":"#014636",
	"Guatemala":"#f7fcfd",
	"Hong Kong":"#e0ecf4",
	"Italy":"#bfd3e6",
	"Malaysia":"#9ebcda",
	"Mali":"#8c96c6",
	"Bahrain":"#8c6bb1",
	"Ecuador":"#88419d",
	"Kazakhstan":"#810f7c",
	"Kuwait":"#4d004b",
	"Lebanon":"#f7fcf5",
	"Libya":"#e5f5e0",
	"Netherlands":"#c7e9c0",
};

var topo,projection,worldPath,worldSvg,worldG;
var graticule = d3.geo.graticule();
var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
setup(width,height);

function setup(width,height){
  projection = d3.geo.mercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI)
    .center( [ 0 , 20] );

  worldPath = d3.geo.path().projection(projection);

  worldSvg = d3.select("#container").append("svg")
      .attr("class", "world")
      .attr("width", width)
      .attr("height", height)
      .call(zoom)
      .on("click", click)
      .append("g");

  worldG = worldSvg.append("g");

}

d3.json("world-topo-min.json", function(error, world) {
  var countries = topojson.feature(world, world.objects.countries).features;
  topo = countries;
  draw(topo);
  
});

function draw(topo, brushSelected) {
 // Clear map if brush is selected
  //if (brushSelected) {
//	  worldG.html("");
  //}
  
  var country = worldG.selectAll(".country").data(topo); 
  
  worldSvg.append("path")
     .datum(graticule)
     .attr("class", "graticule")
     .attr("d", worldPath);

  worldG.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", worldPath);
  
  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", worldPath)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", function(d, i) {


      	var kod=name2code(d.properties.name);

      	//Om vi har problem med att matcha namn:
      	if(kod==undefined){
      		return "#000"
      	}

      	else{
      		//Hämta co2 för 2010
      		var co2 = countries[kod].co2['2010'];

      		//Generera färg beroende på co2 utsläpp	
      		var color = d3.scale.linear().domain([0,5,20]).range(["#A8FB54", "#FFFE5D", "#EB382F"]); 
          	return color(co2); 
      	}

      	//console.log(countries[kod]);   //
      
		  //return d.properties.color;


		  //var returncolor = "efefef";
		  //if (!brushSelected) {
	    	//  Object.keys(colors).forEach(function(colorName) {
	    	//    	if (colorName == d.properties.name) {
	    	//    		returncolor = colors[colorName];
	   	//    	}});
		  //}
          //
			//		if (brushSelected) {
			//			brushSelected.forEach(function(selectedItem) {
			//  				if (selectedItem.Country == d.properties.name) {
			//			    	  Object.keys(colors).forEach(function(colorName) {
			//			    	    	if (colorName == d.properties.name) {
			//			    	    		returncolor = colors[colorName];
			//			    	    	}
			//  				});
			//			};
			//		});
			//		}
		  //
		  //return returncolor;
       });

  //offsets for tooltips
  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;
  //tooltips
  //f = 0;
  country
    .on("mousemove", function(d,i) {
		f = 0;

		//Nollställfärgen på alla bars //Funkar inte riktigt eftersom alla förflyttningar verkar räknas som en ny mouse-over
		// d3.selectAll(".bar")
		//   	.attr('fill', 'blue');

		//Hämtar export-/importinfo från data
		var code = name2code(d.properties.name);
		var exportInfo = "";
		var importInfo = "";
		var countryExports = countries[code].topExport
		var countryImports = countries[code].topImport

		for(var key in countryExports) {
		    exportInfo += "</br>" + countryExports[key].Partner;
		}

		for(var key in countryImports) {
		    importInfo += "</br>" + countryImports[key].Partner;
		}

      var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );
	  
	  
	  //d3.csv("totalgdp.csv", function(data) {
		//  data.forEach(function(economyData) {
		//	  if (d.properties.name == economyData.Country) {
		//	  	  tooltip.html(d.properties.name + "<br>"
		//		  + economyData.info + "<br>"
		//		  + "1995-1999: "+ economyData.Year95to99 + "<br>"
		//		  + "2000-2004: "+ economyData.Year00to04 + "<br>"
		//		  + "2005-2009: "+ economyData.Year05to09);
		//	  }
		//  })
	 	//});// end csv

      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name + "</br></br>  Top  exports: " + exportInfo + "</br></br>  Top  imports: " + importInfo);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);

       //ta bort eventuell highlight på bar chart 
     //   var code = name2code(d.properties.name);

     //   d3.select(".bar#" + code)
		  	// .attr('fill', 'black');


      })

	  .on("click", function(d, i) {
		  //if (f < 6) {
		  //	f = f + 1;
		  //} else {
			//  f = 0;
		  //}

		  //Hämtar landskod
		  var code = name2code(d.properties.name);
		  console.log(code);

		  //Nollställ eventuell  highlightad stapel
		  d3.selectAll(".bar")
		  	.attr('fill', 'black');

		  //Highlighta ny stapel i bar chart
		  d3.select(".bar#" + code)
		  	.attr('fill', 'orange');

	   //  var tip = d3.tip()
		  // .attr('class', 'd3-tip')
		  // .offset([-10, 0])
		  // .html(function(d) {
		  //   return d.value.name + "</br>Co2: " + Math.round(d.value.co2[year] * 100) / 100;
		  // })


		  // d3.select(".bar#" + code)
		  // 	.on('mouseover', tip.show);

	      var mouse = d3.mouse(worldSvg.node()).map( function(d) { return parseInt(d); } );
	  
		  //var EconomyDataFiles = ["totalgdp.csv", "AvGdpInc.csv", "GroCapInv.csv", "inflationSum.csv", "industryAvg.csv", "taxrev.csv", "tradebal.csv"]
	  
		  //d3.csv(EconomyDataFiles[f], function(data) {
			//  data.forEach(function(economyData) {
			//	  if (d.properties.name == economyData.Country) {
			//	  	  tooltip.html(d.properties.name + "<br>"
			//		  + economyData.info + "<br>"
			//		  + "1995-1999: "+ economyData.Year95to99 + "<br>"
			//		  + "2000-2004: "+ economyData.Year00to04 + "<br>"
			//		  + "2005-2009: "+ economyData.Year05to09);
			//	  }
			//  })
		 	//});// end csv

	      tooltip.classed("hidden", false)
	             .attr("style", "left:"+(mouse[0]+ offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
	             .html(d.properties.name);
	  });

}


function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
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