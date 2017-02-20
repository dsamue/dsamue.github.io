//Skapar globala variabeler för div. data
var myData;
var wave = 0
var variable = "happiness";
var countryName;

var width = 1000;
var height = 800;

var svg = d3.select( "#chart")
              .append( "svg" )
              .attr( "width", 300 )
              .attr( "height", 280 );


var svgMap = d3.select( "#map")
                  .append( "svg" )
                  .attr( "width", width )
                  .attr( "height", height );




///Läs in data
function readData(){

  //read default wave and make map
  if(wave === 0){

    d3.csv("data/waveAll.csv", function(data){
      wave = 10;
      myData = data;
      makeMap();
      makeList(myData);
      drawChart("World");
    });
  }

  //read wave 3 and update map
  if(wave === 3){

    d3.csv("data/wave3.csv", function(data){
      myData = data;
      makeMap();
      makeList(myData);
      drawChart(countryName);
    });
  }

  //read wave 4 and update map
  else if(wave === 4){

    d3.csv("data/wave4.csv", function(data){
      myData = data;
      makeMap();
      makeList(myData);
      drawChart(countryName);
    });
  }

    //read wave 5 and update map
  else if(wave === 5){

    d3.csv("data/wave5.csv", function(data){
      myData = data;
      makeMap();
      makeList(myData);
      drawChart(countryName);
    });
  }

  //read wave 6 and update map
  else if(wave === 6){

    d3.csv("data/wave6.csv", function(data){
    myData = data;
    makeMap();
    makeList(myData);
    drawChart(countryName);
    });
  }

  //read all waves and update map
  else if(wave === 10){

    d3.csv("data/waveAll.csv", function(data){
    myData = data;
    makeMap();
    makeList(myData);
    drawChart(countryName);
    });
  }
}





//Rita diagram
function drawChart( dataArray ){

  if (typeof dataArray === "string"){
    for (i = 0; i < myData.length; i++) { 
      if(dataArray === myData[i].country){
        countryName = myData[i].country;

        //Om landet saknar data vid klick eller byte av våg:
        if(myData[i].happiness == undefined){dataArray = [0,0,0,0,0,0,0,0];}

        else{
          dataArray = [ myData[i].happiness, myData[i].family, myData[i].friends, myData[i].parents, myData[i].politics, myData[i].religion, myData[i].work, myData[i].health ];
        }
      }
    }

    //Om man klickar på ett land som inte finns
    if (typeof dataArray === "string"){
      alert("Sorry, no data for this country.");
      return;
    }
  }

  //Remove old text
  var textSelection = svg.selectAll("text")
                        .data( dataArray )
                        .exit()
                        .remove();


  // create a selection for the bars
  var selection = svg.selectAll( "rect" )
                       .data( dataArray );



    // create new elements wherever needed                   
    selection.enter()
      .append( "rect" )
      .attr( "y", function(d,i){
        return i*25;
      })
      .attr( "height", 15 )
      .attr( "fill", "white" )

    // set bar heights based on data
    selection
      .attr( "width", function(d){
        return d/10 * 15;
      })
      .attr( "x", function(d){
        return 100;
      });
    
    //Skriv ut etiketter
    svg.selectAll("text")
      .data(dataArray)
      .enter()
        .append("text")
        .attr("fill", "black")
        .attr("x", function(d, i) { return 5; })
        .attr("y", function(d, i) { return (i * 25) + 15; })
        .text(function (d,i) { if(i==0){ return "Happniess";}
                               if(i==1){ return "Family";}
                               if(i==2){ return "Friends";}
                               if(i==3){ return "Parents";}
                               if(i==4){ return "Politics";}
                               if(i==5){ return "Religion";}
                               if(i==6){ return "Work";}
                               if(i==7){ return "Health";}


         })
        

    // remove any unused bars
    selection.exit()
      .remove();

  // Skriv ut Land
  svg.append("text")
        .attr("fill", "black")
        .attr("x", 100)             
        .attr("y", 220) 
        .style("font-size", "24px")   
        .text(countryName)
        .append('svg:tspan')  //fixar radbryt-ish ..eller bara ett extra element?
        .attr("fill", "black")
        .attr("x", 100)             
        .attr("y", 240) 
        .style("font-size", "16px")   
        .text(function(){if(wave == 10){return "All Waves"} else{ return "Wave: " +  wave}} );

        //Om data saknas
        if(dataArray[0]==0){
         svg.append("text")
        .attr("fill", "back") 
        .attr("x", 100)             
        .attr("y", 260) 
        .style("font-size", "16px")   
        .text("No data")
        }
}






//Skapa karta
function makeMap(){

  var g = svgMap.append( "g" );

  var albersProjection = d3.geo.mercator()
    .scale( 160 )
    .rotate( [71.057,0] )
    .center( [0, 42.313] )
    .translate( [width/2,height/2] );

  var geoPath = d3.geo.path()
      .projection( albersProjection );

  g.selectAll( "path" )
    .data( world_json.features )
    .enter()
    .append( "path" )
    .attr( "fill", function(d){
      for (i = 0; i < myData.length; i++) { 
        if(d.properties.name === myData[i].country){

          //Om landet finns med i urvalet och har data, returnera färg från skala. Om data saknas verkar returnsats leverera svart
          var color = d3.scale.linear().domain([0,50,100]).range(["#EB382F","#FFFE5D","#A8FB54"]);
          return color(myData[i][variable]); 

        }
      }
      //Annars returneras grått för länder som inte är med i urvalet
      return "#c5c5c5";
    })
    .attr( "d", geoPath )
    .on("click", function(d){
      drawChart(d.properties.name);
    });
  }



  //Skapa lista 
  function makeList( dataArray ){

  // create a selection
//   var list = d3.select( "#list" );

//   // rensa bort dom utan data //Av någon anledning så bråkar denna med att klicka på ett land utan data.. rensar även orginaldata?
//   // for(i=0; i<dataArray.length; i++){
//   //   //console.log(dataArray[i]);
//   //   if (dataArray[i].happiness == undefined){
//   //     //console.log("hej");
//   //     var dataArray = dataArray.splice(i,1);   //Den här ska egentligen ta bort landet från lista men jag tror inte det händer
//   //     //console.log(dataArray.length)

//   //   }
//   // }

// // //Sortering, funkar inte helt med att köra in variable  
// //   dataArray.sort(function(x,y){
// //     //console.log(variable);
// //    return d3.descending(x.happiness, y.happiness);
// // })

//   var selection = list.selectAll( "p" )
//                        .data( dataArray );
  
//   selection.enter()
//     .append("p")
//     .text(function(d){
//       return d.country;
//     })
//     .on( "click", function(d){
//       countryName = d.country;
//       drawChart(d.country);    //Ok, denna är inte uppdaterad efter ny data. 
//     });   

    // selection.exit()
    //            .remove();         
  }


//Ger index i egen lista beroende på land
  function getIndex(name){
    for (i = 0; i < myData.length; i++) { 
      if(name === myData[i].country){
        return i;
      }
    }
  }


//Kör igång programmet
readData("0");