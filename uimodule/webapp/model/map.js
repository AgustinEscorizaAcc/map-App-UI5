sap.ui.define([], function () {
    "use strict";
    return {};
});

window.addEventListener('load', function() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src =
		'https://maps.googleapis.com/maps/api/js?key=AIzaSyDmzJ3FvRUBuG6T-uc32IHOrxotozyca4s&avoid=TOLLS&libraries=places&callback=initMap';
	document.body.appendChild(script);
});

function initMap() {
	var directionsRenderer = new google.maps.DirectionsRenderer({
		map: map
	});
	var directionsService = new google.maps.DirectionsService;
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 6,
		center: {
			lat: 23.0225,
			lng: 72.5714
		} //Initial Location on Map
	});
        directionsRenderer.setMap(map);
	directionsRenderer.setPanel(document.getElementById('left-div'));
	var control = document.getElementById('front-div');
	control.style.display = 'inline';
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
        document.getElementById('origin').addEventListener('change', function() {
		distanceCalculator(directionsService, directionsRenderer);
	}, false);

	document.getElementById('destination').addEventListener('click', function() {
		distanceCalculator(directionsService, directionsRenderer);
	}, false);
}

/***************To Calculate and Display the Route*************/
function distanceCalculator(directionsService, directionsRenderer) {
	var origin = document.getElementById('origin').value;
	var destination = document.getElementById('destination').value;
	var req = {
		origin: origin,
		destination: destination,
		travelMode: 'DRIVING'
	};
	directionsService.route(req, function(response, status) {
		if (status === 'OK') {
			directionsRenderer.setDirections(response);
	}
	});
}