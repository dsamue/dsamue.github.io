d3.select('#slider').call(d3.slider()
	.on("slide", function(evt, value) {
	      d3.select('#slider4text').text(value);
	      year = value;
	      drawBarChart();
          updateMapColors();

		 })

  	.axis(true)
	.min(1960)
	.max(2010)
	.step(1));