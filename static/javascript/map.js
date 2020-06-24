var map;

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
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.034004119, lng: -78.50953967324405},
        zoom: 16,
        // TODO: Disable only extraneous UI features
        // disableDefaultUI: true
    });

    setupAutoComplete(map);

    setupWaypoints(map);

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
        currPos = new google.maps.LatLng(latitude,longitude);

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

function numberHandler(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

document.getElementById('routeBtn').addEventListener('click', 'genRouteListener')

function genRouteListener() {
    var dist=document.getElementById("dist_input").value
    if (dist<0 || dist==""){
        document.getElementById("dist_error").innerHTML= 'Please enter a valid input for distance';
        document.getElementById("dist_input").value=0
    } else{
        document.getElementById("dist_error").innerHTML= '';
        /**additional code to implement button**/
    }
}
