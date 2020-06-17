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
