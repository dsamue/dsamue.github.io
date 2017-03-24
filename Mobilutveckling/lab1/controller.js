var map;
var marker;
var chicago = {lat: 41.85, lng: -87.65};
var kth = {lat: 59.347540, lng: 18.0738};
var pos2 = {lat: 59.347340, lng: 18.073044};



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


function moveUp(){
  map.setCenter({lat:map.getCenter().lat()+0.003, lng:map.getCenter().lng()});
  //console.log((1/(*map.getZoom())*0.05));
}

function moveDown(){
  map.setCenter({lat:map.getCenter().lat()-0.003, lng:map.getCenter().lng()});
}

function moveLeft(){
  map.setCenter({lat:map.getCenter().lat(), lng:map.getCenter().lng()-0.003});
}

function moveRight(){
  map.setCenter({lat:map.getCenter().lat(), lng:map.getCenter().lng()+0.003});
}



function zoomIn(){
  map.setZoom(map.getZoom() + 1);
}

function zoomOut(){
  map.setZoom(map.getZoom() - 1);
}



function toggleBounce() {
  // console.log("bounce function running");
  // console.log(marker);
  // marker.setAnimation(google.maps.Animation.BOUNCE);

  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
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
    zoom: 16,
    mapTypeId: 'roadmap',
    heading: 90,
    tilt: 45,
    disableDefaultUI: true
  });


  marker = new google.maps.Marker({
    position: kth,
    map: map,
    animation: google.maps.Animation.DROP,
    title: "I'm stuck here"
  });

  marker2 = new google.maps.Marker({
    position: pos2,
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    title: 'Drag or Bounce me!'
  });
  marker.addListener('click', toggleBounce);


  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

}
