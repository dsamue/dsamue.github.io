//Create svg-area for bar chart
var svg = d3.select( "#chart")
            .append( "svg" )
            .attr('id', 'barChart')
            .attr( "width", 1200 )
            .attr( "height", 220 )
            .attr( "display", "block")
            .attr( "margin", "auto");



//Kolla om musknappen är nedtryckt (för att dra i slidern)
var mouseDown = 0;
document.body.onmousedown = function() { 
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
}


function drawBarChart(){

  console.log("in chart");
  //Year to display is now set in fetch_data.js

  //Create tooltip
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    if(co2val == 'capita'){
      return d.value.name + "</br>" + Math.round(d.value.co2[year] * 10) / 10 + " tons CO<sub>2</sub> per caipta";
    }

    else{
      return d.value.name + "</br>" + Math.round(d.value.co2total[year]/1000 * 10) / 10 + " million tons CO<sub>2</sub>";
    }
  })


  //Make selection and connect to data              
  var selection = svg.selectAll( "rect" )
                    //Fetching countries data and sorts it before creating bars
                     .data(d3.entries(countries).sort(
                                        function(a,b){
                                          //sorting from 1-8 of continentID to get 
                                          //order of data for the bars to match the map
                                          return d3.ascending(a.value.continentID, b.value.continentID);
                                        })
                     );

  svg.call(tip);

        selection.exit()
        .remove();

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
      .attr( "fill", "black" )

    //Set bar heights based on data
    selection
      .attr( "height", function(d){
        if (co2val =="capita"){
          return d.value.co2[year]*2;
        }

        else if(co2val = "total"){
          return d.value.co2total[year]/50000;
          // return 40;
        }

      })

      //Set y position to get bars in right orientation
      .attr( "y", function(d){
        if (co2val =="capita"){
          return 220 - d.value.co2[year]*2;
        }

        else if(co2val == "total"){
          return 220 - d.value.co2total[year]/50000;
          // return 220-40;
        }
      })

      //Show tooltip on hover if neither mousekey is pressed nor play-funtion active
      .on('mouseover', function(d){
        if(play == false && mouseDown == false){tip.show(d)} 
      })
      .on('mouseout', tip.hide);

      // remove any unused bars
      selection.exit()
        .remove();


}
