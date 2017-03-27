d3.select('#slider').call(d3.slider()
	.on("slide", function(evt, value) {
	      d3.select('#slider4text').text(value);
	      
	      year = value;
	      
	      drawBarChart();
        updateMapColors();
  	      
  	      //Only update detailview if avaliable   
        if (multipleCountriesCheckbox.val() != "true"){
	          drawPieChart();
	          updateSideBar();
          }
		})
  	.axis(true)
	.min(1960)
	.max(2010)
	.step(1));


//Ny slider med playfunktion
var dateFormat = d3.time.format("%Y");

d3.select("#slider2").call(chroniton()
      .domain([dateFormat.parse("1960"),dateFormat.parse("2015")])
      .labelFormat(d3.time.format('%Y'))
      .width(960)
      .height(50)
      .playButton(true) // can also be set to loop
      .on("change", function(d) {
          year = dateFormat(d3.time.year(d));

          drawBarChart();
          updateMapColors();
  	      
  	      //Only update detailview if avaliable   
          if(landETT != undefined){        //tidigare var det en enkel if-sats med if(multipleCountriesCheckbox.val() == "false" men då hänger det sig när details-viewn inte är igång /David
	          if(landETT != ""){
		          drawPieChart();
		          updateSideBar();
	         }
          }
      })
    );
