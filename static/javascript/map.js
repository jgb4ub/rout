var map, origin, midway, destination, currPos, latitude, longitude, directionsService, directionsRenderer;
var lat1;
var lng1;
var add1;
var startmarkers=[];
var wpmarkers=[];
var currposmarker=[];

function setupAutoComplete(map) {
    var input = document.getElementById('pac-input');
    var card = document.getElementById('pac-card');
    var types = document.getElementById('type-selector');
    var strictBounds = document.getElementById('strict-bounds-selector');
    var card2 = document.getElementById('pac-card2');
    var card3 = document.getElementById('pac-card3');

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(card2);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card3);

    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();

        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        setOrigin(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
        add1=address;
    });

    function setupClickListener(id, types) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            autocomplete.setTypes(types);
        });
    }

    //declare variable for mode of transport
    var mode;

    function setupClickListenerTransMode(id, transMode) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            // for now, store transport mode as variable
            mode = transMode;
        });
    }

    setupClickListenerTransMode('changemode-walking', 'WALKING');
    setupClickListenerTransMode('changemode-bicycling', 'BICYCLING');
    setupClickListenerTransMode('changemode-driving', 'DRIVING');


    // // Converting address to coordinates
    // google.maps.event.addListener( autocomplete , 'place_changed' , function(){
    //     var place = autocomplete.getPlace();
    //     var location = "<b>Address:</b>" + place.formatted_address + "<br/>";
    //     location += "<b>Latitude:</b>" + place.geometry.location.A + "<br/>";
    //     location += "<b>Longtitude:</b>" + place.geometry.location.F;
    //     document.getElementById('lblresult').innerHTML = location;
    // });
    // //This would get used on the existing input box that has the autocomplete feature. The address that gets typed in that box would be converted to coordinates
    // //<span>Location:</span><input type="text" id="pac-input" placeholder="Enter the address" /><br /><br />
    // <label id="lblresult"></label>
}

function initMap() {
    var marker;
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();


    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.034004119, lng: -78.50953967324405},
        zoom: 16,
        // TODO: Disable only extraneous UI features
        disableDefaultUI: true
    });

    setupAutoComplete(map);
    //setUserCurrentPosition();

    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById('right-panel'));

    //Add a listener. This function runs when the 'click' event occurs on the map object.
    map.addListener("click", function (event) {
        latitude = event.latLng.lat();
        longitude = event.latLng.lng();
        //currPos = new google.maps.LatLng(latitude,longitude);
        //place marker
        setOrigin(event.latLng);
        var lat1=event.latLng.lat();
        var lng1=event.latLng.lng();
        getReverseGeocodingData(lat1, lng1);
    });
}

function setUserCurrentPosition() {
    /**Handle getting current position and sending as starting point
    **/

    //currPos is the current Location of the user
    //var currPos;
    //currPosFail ouputs in the HTML if there was a problem getting the user's current location.
    var currPosFail = document.getElementById("currPositionGrab");

    //Upon clicking current position button, request user location access, printing if an error occurred below the map

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCurrPos, currPosErr);
    }
    else {
        curPosFail.innerHTML = "This feature is not supported by your browser";
    }

    function getCurrPos(pos){
        var latitude = pos.coords.latitude;
        var longitude = pos.coords.longitude;


        //create google LatLng object
        var currCoords = new google.maps.LatLng(latitude,longitude);
        /** set Timeout on map view update
        setTimeout(function(){map.setCenter(currCoords)},300);**/
        map.setCenter(currCoords);
        //map.setCenter(currCoords);
        //Put on map as marker (for now)
        if (currPos){
            currPos.setPosition(currCoords);
        } else {
            currPos = new google.maps.Marker({
                position: currCoords,
                map: map
            });
        }


    }

    function currPosErr(){
        currPosFail.innerHTML = "There was a problem getting your location";
    }
}

function description(){
    alert("This website uses the Google Maps API to enable users to create a round trip route, with the ability to specify certain parameters and customize their route.")
}

function genRouteListener() {
    dist=document.getElementById("dist_input").value
    if (dist<0 || dist==""){
        document.getElementById("dist_error").innerHTML= 'Please enter a valid input for distance';
        document.getElementById("dist_input").value=0
    } else{
        document.getElementById("dist_error").innerHTML= '';
        genRoute(dist);
        //call pointCalculator here?
    }
}


function genRoute(distance) {
    let randomWayPt;
    let waypts = [];
    let lat_origin = latitude;
    let long_origin = longitude;
    let distanceTo = parseFloat(distance/2);

    directions = [
       { direction : "north", latitude: '', longitude: ''}, { direction : "south", latitude: '', longitude: ''},
       { direction : "east", latitude: '', longitude: ''}, { direction : "west", latitude: '', longitude: ''},
       { direction : "northeast", latitude: '', longitude: ''}, { direction : "northwest", latitude: '', longitude: ''},
       { direction : "southeast", latitude: '', longitude: ''}, { direction : "southwest", latitude: '', longitude: ''},
    ];

    let randomDirection = directions[Math.floor(Math.random() * directions.length)];


    if (randomDirection.direction === 'north') {
      randomDirection.latitude = lat_origin;
      randomDirection.longitude = long_origin + distanceTo;
    }
    else if (randomDirection.direction === 'south'){
      randomDirection.latitude = lat_origin;
      randomDirection.longitude = long_origin - distanceTo;
    }
    else if (randomDirection.direction === 'east'){
      randomDirection.latitude = lat_origin + distanceTo;
      randomDirection.longitude = long_origin;
    }
    else if (randomDirection.direction === 'west'){
      randomDirection.latitude = lat_origin - distanceTo;
      randomDirection.longitude = long_origin;
    }
    else if (randomDirection.direction === 'northeast'){
      randomDirection.latitude = lat_origin + distanceTo;
      randomDirection.longitude = long_origin + distanceTo;
    }
    else if (randomDirection.direction === 'northwest'){
      randomDirection.latitude = lat_origin - distanceTo;
      randomDirection.longitude = long_origin + distanceTo;
    }
    else if (randomDirection.direction === 'southeast'){
      randomDirection.latitude = lat_origin + distanceTo;
      randomDirection.longitude = long_origin - distanceTo;
    }
    else if (randomDirection.direction === 'southwest'){
      randomDirection.latitude = lat_origin - distanceTo;
      randomDirection.longitude = long_origin - distanceTo;
    }


    let lat_mid = randomDirection.latitude;
    let long_mid = randomDirection.longitude;

    origin = "" + lat_origin + "," + long_origin;
    midway = "" + lat_mid + "," + long_mid;
    let randomWayPtLat = (Math.random() * (lat_mid - lat_origin) + lat_origin);
    let randomWayPtLong = (Math.random() * (long_mid - long_origin) + long_origin);
    randomWayPt = "" + randomWayPtLat + "," + randomWayPtLong;
    console.log(randomWayPtLat);

    waypts.push({location: midway, stopover: true})
    //waypts.push({location: randomWayPt, stopover: true})


    let request = {
      origin: origin,
      destination: origin,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    };

    console.log(request.origin);
    console.log(request.destination);
    directionsService.route(request, function(result, status){
        if(status === "OK"){
          directionsRenderer.setDirections(result);
        }
    });

}

function collapsableDirections() {
    var directionsPanel = document.getElementById("right-panel");
    if (directionsPanel.style.display === "none") {
        directionsPanel.style.display = "block";
    } else {
        directionsPanel.style.display = "none";
    }
}

var coll = document.getElementsByClassName("button2");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}


function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

//Takes coordinates and returns address
function getReverseGeocodingData(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    // This is making the Geocode request
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
            alert(status);
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
            add1 = (results[0].formatted_address);
        }
    });
}

function setOrigin(marker) {
    for (var i = 0; i < currposmarker.length; i++){
        currposmarker[i].setMap(null);
    }
    currposmarker = [];
    currPos = new google.maps.Marker({
        position:marker,
        map:map,
        title: 'Draggable Marker',
        draggable:false
    });
    currposmarker.push(currPos);
    lat1=marker.lat();
    lng1=marker.lng();
    getReverseGeocodingData(lat1, lng1);
    setTimeout(function(){map.setCenter(currPos.position)},200);
}

//"Add/Edit Start" button listener for non-autocomplete input
function addbtnListener(){
    //var x= addStart()
    if(add1==null){
        alert("Address not specified. Please enter valid address or click on map to place marker before adding.")
    } else{
        if(document.getElementById("changemode-startpoint").checked==true){
            addStartMarker();
        } else{
            addWpMarker();
        }
    }
}

function addStartMarker(){
    //remove placeholder currPos marker and clear array
    for (var i = 0; i < startmarkers.length; i++){
        startmarkers[i].setMap(null);
        }
    startmarkers = [];
    //remove previous start marker and clear array
    for (var i = 0; i < currposmarker.length; i++){
        currposmarker[i].setMap(null);
        }
    currposmarker = [];
    //create new startpoint marker and add to array
    var starticon = {
        url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
    };
    var latlng = new google.maps.LatLng(lat1, lng1);
    var newstartmarker = new google.maps.Marker({
        position:latlng,
        map: map,
        icon:starticon,
        title: 'New Start Marker',
        draggable:true
    });
    startmarkers.push(newstartmarker);
    google.maps.event.addListener(newstartmarker, 'drag', function(event) {
        lat1=event.latLng.lat()
        lng1=event.latLng.lng()
    });
    google.maps.event.addListener(newstartmarker, 'dragend', function(event) {
        getReverseGeocodingData(lat1, lng1)
        setTimeout(() => {  document.getElementById("startaddressval").innerHTML=String(add1); }, 500);
    });
    document.getElementById("startaddressval").innerHTML=add1
}

function addWpMarker(){
    //remove placeholder currPos marker and clear array
    for (var i = 0; i < currposmarker.length; i++){
        currposmarker[i].setMap(null);
        }
    currposmarker = [];
    var wpicon = {
        url: 'http://files.softicons.com/download/web-icons/vista-map-markers-icons-by-icons-land/png/48x48/MapMarker_Ball__Pink.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(48, 48),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(24, 48)
    };
    var latlng = new google.maps.LatLng(lat1, lng1);
    var waypointmarker = new google.maps.Marker({
        position:latlng,
        map: map,
        icon: wpicon,
        title: 'New Waypoint Marker',
        draggable:true
    });
    wpmarkers.push(waypointmarker);
    google.maps.event.addListener(waypointmarker, 'drag', function(event) {
        lat1=event.latLng.lat()
        lng1=event.latLng.lng()
    });
    google.maps.event.addListener(waypointmarker, 'dragend', function(event) {
        getReverseGeocodingData(lat1, lng1)
        setTimeout(() => {
            for (i = 0; i< wpmarkers.length; i++){
                if(wpmarkers[i]==waypointmarker){
                    var ul = document.getElementById("wp-boxes");
                    var items = ul.getElementsByTagName("li");
                    items[i].childNodes[0].innerHTML=add1;
                }
            }
        }, 500);
    });
    //add to side list
    var x = document.createElement("LI");
    var t = document.createElement("SPAN");
    t.innerHTML=add1;
    x.appendChild(t);
    var s= document.createElement("SPAN");
    s.className="close";
    s.innerHTML+="&times;"
    x.appendChild(s);
    document.getElementById("wp-boxes").appendChild(x);
    deleteWaypoints();
}

function deleteWaypoints(){
    /* Get all elements with class="close" */
    var closebtns = document.getElementsByClassName("close");
    var i;
    /* Loop through the elements, and hide the parent, when clicked on */
    for (i = 0; i < closebtns.length; i++){
        closebtns[i].addEventListener("click", function() {
            this.parentElement.style.display = 'none';
            var closebtns2 = document.getElementsByClassName("close");
            for (j = 0; j < closebtns2.length; j++){
                if(closebtns2[j]==this){
                    wpmarkers[j].setMap(null);
                }
            }
        });
    }
}



// var iterativeRouting = function(){
//     getDirectionsWithCurrentWaypoints();
//
//     if (hitIterationLimit()) {
//          callOutput();
//     } else {
// 
//         if (tooShort()) {
//             // adjustments
//             google.api(waypoints, iterativeRouting(counter) );
//         } else if (tooLong()) {
//             // other adjustments
//             google.api(waypoints, iterativeRouting(counter) );
//         } else {
//             callOutput();
//         }
//     }
// };
//
// function startUpGeneration() {
//     generateRandomWaypoint();
//     google.api(waypoints, iterativeRouting);
// }



/*
Function to determine a route that approximates given distance

planning:
- request routes with waypoint preset distance from origin
- if first route is more than 10% different from
- iterate through routes (up to 100?), to find one that approximates desired distance
-
-
-
*/

/*function pointCalculator(){
    let waypts = [];

    var distPreset = .5;     //basic change in lat/longitude to create starting waypoint (which will be adjusted)
    var margin = dist*.05;  //greatest acceptable difference between requested and actual distance
    var diff = 2*dist;      //initialize to dist to ensure greater than 5% difference margin

    var deg = 360*Math.random(); //random degree between 0 (inclusive) and 360 (exclusive)
    var rad= (deg*Math.PI)/180;  //get radian of angle (for trig functions)

    var ydiff = Math.sin(rad)*distPreset;  //find amount to change origin coords
    var xdiff = Math.cos(rad)*distPreset;

    var waypointY = origin.position.lat()+ydiff;  //find latitude to put new point
    var waypointX = origin.position.lng()+xdiff;  //find longitude to put new point

    var randomWaypointCoords = new google.maps.LatLng(waypointY,waypointX);
    waypts.push({location: randomWaypointCoords, stopover: true});


    let request = {
      origin: origin,
      destination: origin,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: mode
    };

    var routed = false;   //tells if successfully generated a route
    var dirResult;       //stores directionResult object


    directionsService.route(request, function(result, status){
        if(status === "OK"){
            dirResult = result;
            routed = true;                                        //directionsRenderer.setDirections(result);
        }
    });

    /*while (diff > margin){
        var legSum = 0;       //sum of distance of all legs of route (in meters)
        for (i in dirResult.routes[0]){
            sum += i.distance.value;
        }
        var miles = sum/1609.34;     //convert meter distance to miles

        diff = Math.abs(miles-dist);
    }


}*/
