var map, origin, midway, destination, currPos, latitude, longitude, directionsService, directionsRenderer, route, elevator;

// Load the Visualization API and the columnchart package.
google.load("visualization", "1", { packages: ["columnchart"] });

function setupAutoComplete(map) {
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var types = document.getElementById('type-selector');
    var strictBounds = document.getElementById('strict-bounds-selector');


    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

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
        marker.setPosition(place.geometry.location);
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
    });

    function setupClickListener(id, types) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            autocomplete.setTypes(types);
        });
    }

    setupClickListener('changetype-all', []);
    setupClickListener('changetype-address', ['address']);
    setupClickListener('changetype-establishment', ['establishment']);
    setupClickListener('changetype-geocode', ['geocode']);

    document.getElementById('use-strict-bounds').addEventListener('click', function() {
        console.log('Checkbox clicked! New state=' + this.checked);
        autocomplete.setOptions({strictBounds: this.checked});
    });



    // document.getElementById('addstart').addEventListener('click', function() {
    //     console.log('Checkbox clicked! New state=' + this.checked);
    //     autocomplete.setOptions({strictBounds: this.checked});
    // });
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
    elevator = new google.maps.ElevationService;
    var infowindow = new google.maps.InfoWindow({map: map});

    // Add a listener for the click event. Display the elevation for the LatLng of
    // the click inside the infowindow. This function runs when the 'click' event occurs on the map object.
    map.addListener('click', function(event) {
        // When you click somewhere on the map, it will put a marker at that place and display the elevation at that place
        displayLocationElevation(event.latLng, elevator, infowindow);
        latitude = event.latLng.lat();
        longitude = event.latLng.lng();
        //currPos = new google.maps.LatLng(latitude,longitude);
        //place marker
        setOrigin(event.latLng);
    });

    setupAutoComplete(map);
    setUserCurrentPosition();

    directionsRenderer.setMap(map);

    function setOrigin(marker) {
        if (currPos) {
            currPos.setPosition(marker);
        } else {
            currPos = new google.maps.Marker({
                position:marker,
                map:map,
            });
        }
    }
}

function setUserCurrentPosition() {
    /**Handle getting current position and sending as starting point
    **/

    //currPos is the current Location of the user
    var currPos;
    //currPosFail ouputs in the HTML if there was a problem getting the user's current location.
    var currPosFail = document.getElementById("currPositionGrab");

    //Upon loading, request user location access, printing if an error occurred below the map

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCurrPos, currPosErr);
    }
    else {
        curPosFail.innerHTML = "This feature is not supported by your browser";
    }

    function getCurrPos(pos){
        var latitude = pos.coords.latitude;
        var longitude = pos.coords.longitude;

        /**
        unsure about this part (below)
        **/
        //create google LatLng object
        var currPos = new google.maps.LatLng(latitude,longitude);
        map.setCenter(currPos);
        //Put on map as marker (for now)
        var currPosMarker = new google.maps.Marker({
            position: currPos,
            map: map
        });

        /**end uncertainty**/
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
          route = result;
          directionsRenderer.setDirections(route);
          // Draw the path, using the Visualization API and the Elevation service.
          displayPathElevation(route, elevator, map);
        }
    });
}



function displayLocationElevation(location, elevator, infowindow) {
  // Initiate the location request
  elevator.getElevationForLocations({
    'locations': [location]
  }, function(results, status) {
    infowindow.setPosition(location);
    if (status === 'OK') {
      // Retrieve the first result
      if (results[0]) {
        // Open the infowindow indicating the elevation at the clicked position.
        infowindow.setContent('The elevation at this point <br>is ' +
            results[0].elevation + ' meters.');
      } else {
        infowindow.setContent('No results found');
      }
    } else {
      infowindow.setContent('Elevation service failed due to: ' + status);
    }
  });
}


function displayPathElevation(route, elevator, map) {
  // Display a polyline of the elevation path.
  new google.maps.Polyline({
    route: route,
    strokeColor: "#0000CC",
    strokeOpacity: 0.4,
    map: map
  });

  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator.getElevationAlongPath(
    {
      route: route,
      samples: 256
    },
    plotElevation
  );
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
  var chartDiv = document.getElementById("elevation_chart");
  if (status !== "OK") {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML =
      "Cannot show elevation: request failed because " + status;
    return;
  }
  // Create a new chart in the elevation_chart DIV.
  var chart = new google.visualization.ColumnChart(chartDiv);

  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  var data = new google.visualization.DataTable();
  data.addColumn("string", "Sample");
  data.addColumn("number", "Elevation");
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(["", elevations[i].elevation]);
  }

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    height: 150,
    legend: "none",
    titleY: "Elevation (m)"
  });
}


function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
