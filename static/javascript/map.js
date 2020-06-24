var map, origin, destination, currPos, latitude, longitude, directionsService, directionsRenderer;


function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.034004119, lng: -78.50953967324405},
        zoom: 16,
        disableDefaultUI: true
    }
  );

  //  setupAutoComplete(map);

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


    //Add a listener. This function runs when the 'click' event occurs on the map object.
    map.addListener("click", function (event) {
        latitude = event.latLng.lat();
        longitude = event.latLng.lng();
        //currPos = new google.maps.LatLng(latitude,longitude);
        //place marker
        setOrigin(event.latLng);
    });

    // Autocomplete
    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    /**Handle getting current position and sending as starting point
    **/

    //currPos is the current Location of the user
    var currPos;
    //currPosFail ouputs in the HTML if there was a problem getting the user's current location.
    var currPosFail = document.getElementById("currPositionGrab");

    //Upon loading, request user location access, printing if an error occurred below the map

    window.onload = function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCurrPos, currPosErr);
        }
        else {
            curPosFail.innerHTML = "This feature is not supported by your browser";
        }
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
    var autocomplete = new google.maps.places.autocomplete(input, options);

}



    function genRoute(distance) {
        let origin, destination;
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


        let lat_dest = randomDirection.latitude;
        let long_dest = randomDirection.longitude;

        origin = "" + lat_origin + "," + long_origin;
        destination = "" + lat_dest + "," + long_dest;

        let request = {
          origin: origin,
          destination: destination,
          travelMode: 'WALKING'
        };

        directionsService.route(request, function(result, status){
            if(status === "OK"){
              directionsRenderer.setDirections(result);
            }
        });

    }


    function isNumberKey(evt){
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
