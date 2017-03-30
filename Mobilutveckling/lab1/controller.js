var map;
var marker;
var chicago = {lat: 41.85, lng: -87.65};
var kth = {lat: 59.347540, lng: 18.0738};
var pos2 = {lat: 59.347340, lng: 18.073044};
var humle = {lat:59.339282, lng: 18.072832};
var erlands = {lat:59.340487 , lng:18.040420};
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';


//Basic navigation
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


//Move center of map
function moveCenter(position) {
    map.setCenter(position);
  };

//Show current position
function showLocation(){
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(function (position) {
         initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
         map.setCenter(initialLocation);

        newMarker = new google.maps.Marker({
        position: initialLocation,
        map: map,
        animation: google.maps.Animation.DROP,
        title: "You're here!"
      });
    });
  }
}


//Toggle tilt between 0 and 45 degrees
function setTilt(){

  if (map.tilt==0){
    //Shorthand if statement - Zoom in for tilt if neccesary
    map.zoom < 19? map.setZoom(19) : '' ;
    map.setMapTypeId('satellite');
    map.setTilt(45);
  }

  else{
    map.setTilt(0);
    map.setMapTypeId('roadmap');
  }
}


//Make marker bounce
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}


//Google API-buttons
/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */

// function CenterControl(controlDiv, map) {

//   // Set CSS for the control border.
//   var controlUI = document.createElement('div');
//   controlUI.style.backgroundColor = '#fff';
//   controlUI.style.border = '2px solid #fff';
//   controlUI.style.borderRadius = '3px';
//   controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
//   controlUI.style.cursor = 'pointer';
//   controlUI.style.marginBottom = '22px';
//   controlUI.style.textAlign = 'center';
//   controlUI.title = 'Click to recenter the map';
//   controlDiv.appendChild(controlUI);

//   // Set CSS for the control interior.
//   var controlText = document.createElement('div');
//   controlText.style.color = 'rgb(25,25,25)';
//   controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
//   controlText.style.fontSize = '16px';
//   controlText.style.lineHeight = '38px';
//   controlText.style.paddingLeft = '5px';
//   controlText.style.paddingRight = '5px';
//   controlText.innerHTML = 'Center Map';
//   controlUI.appendChild(controlText);

//   // Setup the click event listeners: simply set the map to Chicago.
//   controlUI.addEventListener('click', function() {
//     map.setCenter(chicago);
//   });
// }



function displayContent(){ 
  document.getElementById("loading").remove()

    if (window.navigator.standalone) {
    // document.getElementById("prompt").addClass("hide")
  } else {
    setTimeout(function(){confirm('Consider adding this web app to your homescreen!')}, 2000);
    // document.getElementById("prompt").addClass("alert")
  } 

  document.getElementById("mainContent").style.visibility = 'visible';
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
    title: "Drag or Bounce me!"
  });

  marker2 = new google.maps.Marker({
    position: pos2,
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    title: 'Move me!',
    icon: iconBase + 'info-i_maps.png'
  });

  marker3 = new google.maps.Marker({
    position: humle,
    map: map,
    title: "Humlegården"
  });

  marker4 = new google.maps.Marker({
    position: erlands,
    map: map,
    title: "Erlands Bar"
  });

  //info for Erlands
  var contentString1 = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<div id="bodyContent">'+
    '<p><b>Erlands Bar</b>, just a really nice place</p>'+
    '</div>'+
    '</div>';

  var infowindow1 = new google.maps.InfoWindow({
    content: contentString1
  });

  //Info for Humlegården
  var contentString2 = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<div id="bodyContent">'+
    '<p><b>Humlegården</b>, A central park</p>'+
    '</div>'+
    '</div>';

  var infowindow2 = new google.maps.InfoWindow({
    content: contentString2
  });

  //Marker interactions
  marker.addListener('click', toggleBounce);
  marker4.addListener('click', function() {
    infowindow1.open(map, marker4);
  });

  marker3.addListener('click', function() {
    infowindow2.open(map, marker3);
  });

  //Google API BUTTONS
  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  // var centerControlDiv = document.createElement('div');
  // var centerControl = new CenterControl(centerControlDiv, map);

  // centerControlDiv.index = 1;
  // map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);


  //For flashscreen-ish
  setTimeout(displayContent,2000);

}
