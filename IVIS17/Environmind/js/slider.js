    d3.select('#slider').call(d3.slider()
    	.on("slide", function(evt, value) {
		      d3.select('#slider4text').text(value);
		      console.log(value);
		      year = value;
		      drawBarChart();

   		 })

      	.axis(true)
    	.min(1960)
    	.max(2010)
    	.step(1));

    // d3.select('#slider7')
    // 	.call(d3.slider()
    // 	.axis(true)
    // 	.min(1950)
    // 	.max(2010)
    // 	.step(1))
    // 	.on("slide", function(evt, value) {
    //   d3.select('#slider4text').text(value);
    //   console.log(value);
    // });
