var map;
function initMap() {
    var marker;
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.034004119, lng: -78.50953967324405},
        zoom: 16,
        disableDefaultUI: true
    });

    directionsRenderer.setMap(map);

    function placeMarker(location) {
      if (marker) {
        marker.setPosition(location);
      } else {
        marker = new google.maps.Marker({
          position:location,
          map:map,
        });
      }
    }


    //Add a listener. This function runs when the 'click' event occurs on the map object.
    map.addListener("click", function (event) {
        var latitude = event.latLng.lat();
        var longitude = event.latLng.lng();
        console.log(latitude + ', ' + longitude);
        //place marker
        placeMarker(event.latLng);
    });
    }


    /**

    Handle getting current position and sending as starting point
    **/

    //currPos is the current Location of the user
    var currPos;
    //currPosFail ouputs in the HTML if there was a problem getting the user's current location.
    var currPosFail = document.getElementById("currPositionGrab");

    //Upon loading, request user location access, printing if an error occurred below the map
    window.onload = function(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(currPos, currPosErr);
      }
      else {
        curPosFail.innerHTML = "This feature is not supported by your browser";
      }
    }

    function currPos(pos){
      var latitude = pos.coords.latitude;
      var longitude = pos.coords.longitude;
    }

    function currPosErr(){
      currPosFail.innerHTML = "There was a problem getting your location";
    }
