var map, origin, midway, destination, currPos, latitude, longitude, directionsService, directionsRenderer;
var lat1;
var lng1;
var add1;
var startmarkers=[];
var wpmarkers=[];
var currposmarker=[];
var startcoord;
var wpcoordarray=[];
var wpOnClick = [];
var finalwps=[];
var dist;


const DEBUG = true;
var mode;


var difference = 0;
var difficulty = '';

var elevationArray = [];
var pointNum = 0;
var elevationNum;
var slope;
var slopeArray = [];
var slopeSum = 0;
var slopeAverage;

var generated=false;
var addmorewpts=false;
var contentString;
var infoWindow;


function setupAutoComplete(map) {
    hideMapDisplay();

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
    //var mode = 'WALKING';

    function setupClickListenerTransMode(id, transMode) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            // for now, store transport mode as variable
            mode = transMode;
            console.log(mode);
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
    // Load the Visualization API and the columnchart package.
    google.load('visualization', '1', {packages: ['columnchart']});
    var marker;
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    //directionsRenderer.setOptions({suppressMarkers: true})


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

        //currPos = new google.maps.LatLng(latitude,longitude);
        //place marker
        setOrigin(event.latLng);
        var lat1=event.latLng.lat();
        var lng1=event.latLng.lng();

        if (wpOnClick > 0){
            wpOnClick.pop()
        }
        wpOnClick.push({lat: lat1, lng: lng1})

        getReverseGeocodingData(lat1, lng1);
        setTimeout(() => {  document.getElementById("pac-input").value=add1; }, 500);


    });
    //testTools();
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

function genRouteListener() {
    dist=document.getElementById("dist_input").value
    if (dist<=0 || dist==""){
        document.getElementById("dist_error").innerHTML= 'Please enter a valid input for distance';
        document.getElementById("dist_input").value=0
    } else{
        document.getElementById("dist_error").innerHTML= '';
        //get all coordinates of waypoints that are active at time of generation
        var ul = document.getElementById("wp-boxes");
        var items = ul.getElementsByTagName("li");
        var closebtns = document.getElementsByClassName("close");
        var i;
        for (i = 0; i < closebtns.length; i++){
            if (closebtns[i].parentElement.style.display !='none'){
                finalwps.push(wpcoordarray[i]);
            }
        }
        genRoute(dist);



        generated=true;
        //call pointCalculator here

    }
}

function getDist(lat1,lon1,lat2,lon2) {
  let R = 6371; // Radius of the earth in km
  let conv = 0.621371 //conversion factor km to mi
  let dLat = deg2rad(lat2-lat1);  // deg2rad below
  let dLon = deg2rad(lon2-lon1);
  let a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c * conv; // Distance in miles
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


function generateRandomWaypoint(rad, start_lat, start_lng){
    let degToMi = (1/69);
    let leftBound = start_lat - (degToMi * rad);
    let rightBound = start_lat + (degToMi * rad);
    let upperBound = start_lng + (degToMi * rad);
    let lowerBound = start_lng - (degToMi * rad);

    let randWyptLat = (Math.random() * (rightBound - leftBound) + leftBound);
    let randWyptLng = (Math.random() * (upperBound - lowerBound) + lowerBound);

    let randLatLng = {lat: randWyptLat, lng: randWyptLng};
    let randWypt = {location: randLatLng, stopover: true};
    return randWypt;
}


function genRoute(distance) {
    // startcoord
    let lat_origin = startcoord.lat();
    let long_origin = startcoord.lng();
    let radius = parseFloat((0.621371 * distance)/2);
    let routeDist = 0;
    let start = {lat: lat_origin, lng: long_origin};
    let ptA = start;
    let ptB = start;

    if (!mode){
        mode = 'WALKING';
}
    let usrWypts = [];

    if (finalwps.length > 0) {
        while ((finalwps.length > 0) && (routeDist < radius)){
            ptB = finalwps.pop();
            let dist = getDist(ptA.lat, ptA.lng, ptB.lat, ptB.lng);
            if ((routeDist + dist) < radius) {
                routeDist += dist;
                let position = "" + ptB.lat + "," + ptB.lng + "";
                usrWypts.push({location: position, stopover: true});
                ptA = ptB;
            } else {
                document.getElementById("dist_error").innerHTML= 'Cannot integrate waypoints into route. Please either increase distance or remove waypoints';
                break;
            }
        }

    }

    // wypts.forEach((wypt) => {
    //   let wyptMarker = new google.maps.MarkerLabel({
    //    position: wypt,
    //    draggable: true,
    //    raiseOnDrag: true,
    //    labelContent: "",
    //    labelInBackground: false,
    //  });
    // if(addmorewpts==true){
    //     newRandWpts(distance);
    //     console.log("adding");
    // }


    let usrRequest = {
      origin: start,
      destination: start,
      waypoints: usrWypts,
      optimizeWaypoints: true,
      travelMode: mode
    };


    //Check if there are random waypoints, else generate user waypoints

    directionsService.route(usrRequest, function(result, status){
        if(status === "OK"){
            // directionsRenderer.setDirections(result);
            let length = computeTotalDistance(result);
            console.log(length);
            if (length < distance) {
                let requestData = {
                    request: usrRequest,
                    randomWaypoints: [],
                    userWaypoints: usrWypts
                };
                startUpGeneration(requestData);
            } else {
                document.getElementById("dist_error").innerHTML= 'Error message, cant reach all user waypoints in requested distance';
            }
              //console.log("Started iteration");
              //iterativeRouting(requestData, result, 10);
        }
    });
}



function hideMapDisplay() {
    var directionsPanel = document.getElementById("right-panel");
    directionsPanel.style.display = "none";
}

function collapsableDirections() {
    if (generated==true){
        var directionsPanel = document.getElementById("right-panel");
        if (directionsPanel.style.display === "none") {
            directionsPanel.style.display = "block";
        } else {
            directionsPanel.style.display = "none";
        }
    }
}


function printDiv() {
    var printContents = document.getElementById("right-panel").innerHTML;
    w=window.open();
    w.document.write(printContents);
    w.print();
    w.close();
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
    //infoWindow.close()
    contentString = '<button type="button"  class="button" id="addstartbtn" onclick="addbtnListener()">Startpoint</button>' + '<button type="button"  class="button" id="addwpbtn" onclick="wpbtnListener()">Waypoint</button>';
    infoWindow = new google.maps.InfoWindow({
        content: contentString
          });

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


    infoWindow.open(map, currPos);

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
        addStartMarker();
    }
}

function wpbtnListener(){
    if(add1==null){
        alert("Address not specified. Please enter valid address or click on map to place marker before adding.")
    } else{
        addWpMarker();
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
/*
    var starticon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#00ff32',
        fillOpacity: 0.6,
        strokeColor: '#00A',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        scale: 7
    }
  */

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
    startcoord=latlng;
    google.maps.event.addListener(newstartmarker, 'drag', function(event) {
        lat1=event.latLng.lat()
        lng1=event.latLng.lng()
    });
    google.maps.event.addListener(newstartmarker, 'dragend', function(event) {
        var latlng = new google.maps.LatLng(lat1, lng1);
        startcoord=latlng;
        getReverseGeocodingData(lat1, lng1)
        setTimeout(() => {  document.getElementById("startaddressval").innerHTML=String(add1); }, 500);
    });
    document.getElementById("startaddressval").innerHTML=add1
}

function addWpMarker(){

  if (wpOnClick.length > 0) {
      wpOnClick.forEach((wp) => {
        finalwps.push(wp)
        wpOnClick.pop()
      });
  }

    //remove placeholder currPos marker and clear array
    for (var i = 0; i < currposmarker.length; i++){
        currposmarker[i].setMap(null);
        }
    currposmarker = [];
/*
    var wpicon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#0000FF',
        fillOpacity: 0.6,
        strokeColor: '#00A',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        scale: 7
    }
*/

    var wpicon = {
        url: '/images/waypointmarker.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(48, 48),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(24, 48)
    };


    //var wpicon= document.getElementById("wpimg")
    var latlng = new google.maps.LatLng(lat1, lng1);
    var waypointmarker = new google.maps.Marker({
        position:latlng,
        map: map,
        icon: wpicon,
        title: 'New Waypoint Marker',
        draggable:true
    });
    wpmarkers.push(waypointmarker);
    wpcoordarray.push({lat: latlng.lat(), lng: latlng.lng()});

    google.maps.event.addListener(waypointmarker, 'drag', function(event) {
        lat1=event.latLng.lat()
        lng1=event.latLng.lng()
    });
    google.maps.event.addListener(waypointmarker, 'dragend', function(event) {
        var latlng = new google.maps.LatLng(lat1, lng1);
        getReverseGeocodingData(lat1, lng1)
        setTimeout(() => {
            for (i = 0; i< wpmarkers.length; i++){
                if(wpmarkers[i]==waypointmarker){
                    var ul = document.getElementById("wp-boxes");
                    var items = ul.getElementsByTagName("li");
                    items[i].childNodes[0].innerHTML=add1;
                    wpcoordarray[i]=latlng;
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


//// TODO: ensure 'dist' variable is initialized before function can run ( run after dist is received)




function iterativeRouting(requestData, result, counter){
    if (DEBUG){
        directionsRenderer.setDirections(result);
    }
    //computeTotalDistance(result);
    let pathDifference = pathDifferenceCalc(result);

    // getDirectionsWithCurrentWaypoints();
    // modify request to change the route that gets plotted
    counter--;
    if(counter === 0) {
         callOutput(result);

    } else {

        backTrack(result, requestData);

        if (tooShort(result, pathDifference)) {
            if (requestData.randomWaypoints.length === 1 && requestData.userWaypoints.length === 0){
                requestData.randomWaypoints.push(generateRandomWaypoint(parseFloat((0.621371 * dist)/2), requestData.request.origin.lat,  requestData.request.origin.lng));
            }
            elongate(requestData, counter);  // adjustments
            // directMe(requestData, counter);

        } else if (tooLong(result, pathDifference)) {
            shorten(requestData, counter);    // other adjustments
            // directMe(requestData, counter);

        } else {
            addmorewpts=false;



            callOutput(result);
        }
    }
};

function backTrack(directResult, requestData){
    var steparr=[] //holds end location of all steps as Strings
    var locArr=[];//holds all steps
    var legs = directResult.routes[0].legs;
    for (i = 0; i < legs.length; i++) {
        var steps = legs[i].steps;
        for(j=0; j<steps.length; j++){
            var step=steps[j].end_location.toString();
            var endloc=steps[j];
            steparr.push(step);
            locArr.push(endloc);
        }
    }
    var a=0;
    for(i=1; i<steparr.length-1; i++){ //check if any endlocations are repeated
        var step1=steparr[i];
        if (steparr.indexOf(step1)!=steparr.lastIndexOf(step1)){
            a++;
            newRandWpts(requestData, locArr[i].end_location);
         }
    }
}

function newRandWpts(requestData, startloc){
    if(requestData.randomWaypoints.length<2){
        var starting= {lat: startloc.lat(), lng: startloc.lng()};
        let request = requestData.request;
        let randWypts = [];
        let randLatLng = getEndpoint(starting, Math.PI, 0.2);
        let randWypt1 = {location: randLatLng, stopover: true};
        randWypts.push(randWypt1);
        requestData.randomWaypoints= requestData.randomWaypoints.concat(randWypts);
        requestData.request.waypoints = requestData.request.waypoints.concat(randWypts);
        return requestData;
    }

    // if(requestData.randomWaypoints.length<2){
    //     let request = requestData.request;
    //     let lat_origin = startloc.lat;
    //     let long_origin = startloc.lng;
    //     //let radius = parseFloat((0.621371 * dist)/2);
    //
    //     let randWypts = [];
    //     randWypts.push(generateRandomWaypoint(0.5, lat_origin, long_origin));
    //     requestData.randomWaypoints= requestData.randomWaypoints.concat(randWypts);
    //     requestData.request.waypoints = requestData.request.waypoints.concat(randWypts);
    //     console.log(requestData.randomWaypoints.length);
    //     return requestData;
    // }

}

function startUpGeneration(requestData) {
    let request = requestData.request;
    let lat_origin = request.origin.lat;
    let long_origin = request.origin.lng;
    let radius = parseFloat((0.621371 * dist)/2);

    //Randomly generate waypoint
    console.log("Starting up generation");
    let randWypts = [];
    randWypts.push(generateRandomWaypoint(radius, lat_origin, long_origin));
    requestData.randomWaypoints = randWypts;
    requestData.request.waypoints = requestData.request.waypoints.concat(randWypts);

    // The passed request should not have any random waypoints, but we may need to add one
    directionsService.route(request, function(result, status){
        if(status === "OK"){
            console.log("Started iteration");
            iterativeRouting(requestData, result, 10);
        } else {
          console.log("Error")
        }
    });
}

function callOutput(directResult){
    console.log("length: "+sum);
    directionsRenderer.setDirections(directResult);
    elevationCreator(directResult);
}

function elevationCreator(directResult){


    var path = pathData(directResult);

    // var path = [
    //     {lat: 36.579, lng: -118.292},  // Mt. Whitney
    //     {lat: 36.606, lng: -118.0638},  // Lone Pine
    //     {lat: 36.433, lng: -117.951},  // Owens Lake
    //     {lat: 36.588, lng: -116.943},  // Beatty Junction
    //     {lat: 36.34, lng: -117.468},  // Panama Mint Springs
    //     {lat: 36.24, lng: -116.832}];  // Badwater, Death Valley


    // Create an ElevationService.
    var elevator = new google.maps.ElevationService;

    // Draw the path, using the Visualization API and the Elevation service.
    displayPathElevation(path, elevator, map);
}


function pathData(directResult){
    var route = directResult.routes[0]; //route is a directionRoute object
    return route.overview_path;
    // for (x in route.legs[]) {
    //     path.push();
    // }
}


function displayPathElevation(path, elevator, map) {
  // Display a polyline of the elevation path.
    // new google.maps.Polyline({
    //     path: path,
    //     strokeColor: '#0000CC',
    //     strokeOpacity: 0.8,
    //     map: map
    // });

    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.
    elevator.getElevationAlongPath({
        'path': path,
        'samples': 250 // these are the dots (the display)
    }, plotElevation);
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
    var chartDiv = document.getElementById('elevation_chart');
    if (status !== 'OK') {
    // Show the error code inside the chartDiv.
        chartDiv.innerHTML = 'Cannot show elevation: request failed because ' + status;
        return;
    }
    // Create a new chart in the elevation_chart DIV.
    var chart = new google.visualization.LineChart(chartDiv);

    // Extract the data from which to populate the chart.
    // Because the samples are equidistant, the 'Sample'
    // column here does double duty as distance along the
    // X axis.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    for (var i = 0; i < elevations.length; i++) {  // Corresponds with the number of 'samples'
        data.addRow(['', elevations[i].elevation]); //this is adding a column for each elevation sample
        // console.log(elevations[i].location.lat() );
        // console.log(elevations[i].location.lng() );
        //console.log( elevations[i].elevation);
        elevationArray.push(elevations[i].elevation); // grabbing the elevation at each of the points plotted as part of the 250 'samples'
    }
    // console.log( elevationArray );
    var high = elevationArray[ 0 ];
    var low = elevationArray[ 0 ];

    for (var i = 0; i < elevationArray.length - 1; i++ ){
        if (Math.abs( elevationArray[i + 1 ] - elevationArray[ i ] > difference )){
            difference = elevationArray[i + 1 ] - elevationArray[ i ];
            pointNum = i;
            elevationNum = elevationArray[i]; // elevation at pointNum
        }
        if (elevationArray[i] < low ){
            low = elevationArray[i];
        }
        if (elevationArray[i] > high ){
            high = elevationArray[i];
        }
        slope = Math.abs( elevationArray[i + 1 ] - elevationArray[ i ]);
        slopeArray.push(slope);
        slopeSum = slopeSum + slope;
    }

    slopeAverage = slopeSum/125;
    console.log( "AVerage slope: " + slopeAverage );
    //console.log( "Slopes: " + slopeArray );
    console.log( "Elevation at sample point: " + elevationNum );
    console.log( "Sample point: " + pointNum );
    console.log( "high: " + high );
    console.log( "low: " + low );
    console.log( "difference: " + difference );

    if (difference <= 20 )
        difficulty = "A";
    else if (difference > 20 || difference <= 60)
        difficulty = "B";
    else if (difference > 60 || difference <= 100)
        difficulty = "C";
    else if (difference > 100 || difference <= 200 )
        difficulty = "D";
    else if(difference > 200 )
        difficulty = "F";

    console.log( "difficulty: " + difficulty );

    document.getElementById("rating").innerHTML = "Rating: " + difficulty;
    document.getElementById("slopeDiv").innerHTML = "Average slope: " + slopeAverage.toFixed(2);
    if (difficulty == "A"){
        document.getElementById("diffBar").value = "20";
    }
    if (difficulty == "C"){
        document.getElementById("diffBar").value = "60";
    }
    if (difficulty == "F"){
        document.getElementById("diffBar").value = "100";
    }
    if (difficulty == "D"){
        document.getElementById("diffBar").value = "80";
    }
    if (difficulty == "B"){
        document.getElementById("diffBar").value = "40";
    }


    // Displaying route difficulty info
    if (rating.style.display == 'none') {
      rating.style.display = 'inline';
    }
    if (slopeDiv.style.display == 'none') {
      slopeDiv.style.display = 'inline';
    }
    if (diffBar.style.display == 'none') {
      diffBar.style.display = 'inline';
      diffBar.style.color = 'red';
    }
    if (easy.style.display == 'none') {
      easy.style.display = 'inline';
    }
    if (difficult.style.display == 'none') {
      difficult.style.display = 'inline';
    }

    if (space.style.display == 'none'){
        space.style.display = 'inline';
    }

    //var rating = document.getElementById( "rating" );

    // Draw the chart using the data within its DIV.
    chart.draw(data, {
        height: 150,
        legend: 'none',
        titleY: 'Elevation (m)',
    });
}

function tooShort(dirResult, pathDifference){
    if (pathDifference < (-.05*dist)) {

        return true;
    }
    return false;
}

function tooLong(dirResult, pathDifference){
    if (pathDifference > (.05*dist)) {
        return true;
    }
    return false;
}

function pathDifferenceCalc(dirResult){
    //console.log("length: "+sum/1609);
    return (computeTotalDistance(dirResult)-dist);
}

var sum;
var myroute;
function computeTotalDistance(result){
    sum = 0;
    myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        sum += myroute.legs[i].distance.value;
    }
    sum = sum/1609.34;
    return sum;
}

function directMe(requestData, counter){
    directionsService.route(requestData.request, function(result, status){
        if(status === "OK"){
            iterativeRouting(requestData, result, counter);
        }
    });
}

function elongate(pathRequest, counter){
    let adjustPoints = pathRequest.randomWaypoints;
    let numRands = adjustPoints.length;
    let newRandPoints = [];
    for (let point in adjustPoints){       //adjust each random waypoint
        //console.log("point: "+JSON.stringify(adjustPoints[point]));
        //console.log("point: "+JSON.stringify(point));
        let pt_lat = adjustPoints[point].location.lat;   //store point's latitude and longitude
        let pt_lng = adjustPoints[point].location.lng;

        let start_lat = pathRequest.request.origin.lat; //get origin latitude and longitude
        let start_lng = pathRequest.request.origin.lng;

        let lat_change = (start_lat+((pt_lat-start_lat)*(dist/sum)));   //calc coord differences, move pt latitude and longitude toward origin's lat/lng by factor of 1/2
        let lng_change = (start_lng+((pt_lng-start_lng)*(dist/sum)));

        let newLatLng = {lat:lat_change, lng:lng_change};
        newRandPoints.push({location:newLatLng, stopover:true})   //add new adjusted waypoint to array
    }
    let newPoints;
    if (pathRequest.userWaypoints){
        newPoints = pathRequest.userWaypoints.concat(newRandPoints);
    } else {
        newPoints = newRandPoints;
    }

    pathRequest.request.waypoints = newPoints;
    pathRequest.randomWaypoints = newRandPoints;
    console.log("---");
    console.log(pathRequest.request);
    console.log(pathRequest.request.waypoints);
    directMe(pathRequest, counter);
}

function shorten(pathRequest, counter){
    let adjustPoints = pathRequest.randomWaypoints;
    let numRands = adjustPoints.length;
    let newRandPoints = [];
    for (let point in adjustPoints){       //adjust each random waypoint
        let pt_lat = adjustPoints[point].location.lat;   //store point's latitude and longitude
        let pt_lng = adjustPoints[point].location.lng;

        let start_lat = pathRequest.request.origin.lat; //get origin latitude and longitude
        let start_lng = pathRequest.request.origin.lng;

        let ptDiff = ((Math.abs(pt_lat-start_lat))**2)+((Math.abs(pt_lng-start_lng))**2); //get square of hypotenuse between pts

        if (pathRequest.userWaypoints){
            for (let userPoint in pathRequest.userWaypoints){

                let temp = pathRequest.userWaypoints[userPoint];
                let currPtDiff = (((Math.abs(pt_lat-temp.location.lat))**2)+((Math.abs(pt_lng-temp.location.lng))**2));

                if (currPtDiff < ptDiff){
                    ptDiff = currPtDiff;
                    start_lat = temp.location.lat;
                    start_lng = temp.locatin.lng;
                }
            }
        }

        let lat_change = start_lat+((pt_lat-start_lat)*(dist/sum));       //start_lat+(numRands/(pt_lat-start_lat))     //start_lat+((pt_lat-start_lat)/2)   //calc coord differences, move pt latitude and longitude toward origin's lat/lng by factor of 1/2
        let lng_change = start_lng+((pt_lng-start_lng)*(dist/sum));       //start_lng+(numRands/(pt_lat-start_lat));     //star_lng+((pt_lng-start_lng)/2);   //numRands/(req_distance/difference);   numRands*difference/(req_distance)

        let newLatLng = {lat:lat_change, lng:lng_change};
        newRandPoints.push({location:newLatLng, stopover:true})   //add new adjusted waypoint to array
    }

    let newPoints;
    if (pathRequest.userWaypoints){
        newPoints = pathRequest.userWaypoints.concat(newRandPoints);
    } else {
        newPoints = newRandPoints;
    }

    pathRequest.request.waypoints = newPoints;
    pathRequest.randomWaypoints = newRandPoints;
    console.log(pathRequest.randomWaypoints);
    directMe(pathRequest, counter);

}

function firstRandPoint() {
    return {location: {lat: 38.034382001417875 , lng: -78.5081523875455}, stopover:true};
}

function DegreesToRadians(start) {
    return start*0.0174533;
}

function RadiansToDegrees(rads) {
    return rads*57.2958;
}

function getEndpoint(startPoint, bearingRadians, distanceMiles) {
    const radiusEarthMiles = 3958.8;
    var distRatio = distanceMiles / radiusEarthMiles;
    var distRatioSine = Math.sin(distRatio);
    var distRatioCosine = Math.cos(distRatio);
    var startLatRad = DegreesToRadians(startPoint.lat);
    var startLonRad = DegreesToRadians(startPoint.lng);
    var startLatCos = Math.cos(startLatRad);
    var startLatSin = Math.sin(startLatRad);
    var endLatRads = Math.asin((startLatSin * distRatioCosine) + (startLatCos * distRatioSine * Math.cos(bearingRadians)));
    var endLonRads = startLonRad
        + Math.atan2(
            Math.sin(bearingRadians) * distRatioSine * startLatCos,
            distRatioCosine - startLatSin * Math.sin(endLatRads));

    return {lat: RadiansToDegrees(endLatRads), lng: RadiansToDegrees(endLonRads)};
}


function testTools() {
    console.log("Testing");
    var start = {lat: 90, lng: 0};
    for (var i = 0; i < Math.PI * 2; i += 0.1) {
        var point = getEndpoint(start, i, 1);

        var marker = new google.maps.Marker({
            position: point,
            map: map,
            title: 'Hello World!'
        });
    }
}

function getDistance (startPoint, endPoint) {
  var radiusEarthMiles = 3958.8;
  var dLat = DegreesToRadians(endPoint.lat - startPoint.lat);
  var dLon = DegreesToRadians(endPoint.lng - startPoint.lat);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var distance = radiusEarthMiles * c;
  console.log("Calculated Distance")
  return distance;
}

function getBearing (startPoint, endPoint) {
    startLat = DegreesToRadians(startPoint.lat);
    startLng = DegreesToRadians(startPoint.lng);
    destLat = DegreesToRadians(endPoint.lat);
    destLng = DegreesToRadians(endPoint.lng);
    y = Math.sin(destLng - startLng) * Math.cos(destLat);
    x = Math.cos(startLat) * Math.sin(destLat) -
          Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    console.log("Calculated Bearing")
    return (brng + 360) % 360;
}


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

/*function initialPointSet(){
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
 -------------------------------------------------------------------------------------------------------------------------- (end here?)
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
