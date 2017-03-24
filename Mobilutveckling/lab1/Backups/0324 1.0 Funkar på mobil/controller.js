var map;
var chicago = {lat: 41.85, lng: -87.65};
var kth = {lat: 59.347340, lng: 18.073044};



//Toggle tilt between 0 and 45 degrees
function setTilt(){
  // console.log('hej')

  if (map.tilt==0){
      //Shorthand if statement - Zoom in for tilt if neccesary
    map.zoom < 19? map.setZoom(19) : '' ;
    map.setTilt(45);
  }

  else{
    map.setTilt(0);
  }
}


/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */

function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Center Map';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    map.setCenter(chicago);
  });
}




function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: kth, 
    zoom: 18,
    mapTypeId: 'satellite',
    heading: 90,
    tilt: 45,
    disableDefaultUI: true
  });

  var marker = new google.maps.Marker({
    position: kth,
    map: map,
    title: 'KTH'
  });


  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}