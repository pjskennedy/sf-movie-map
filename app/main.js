// Global to hold all film data.
var filmData = [];

$( document ).ready(function(){
  var style = [
    {
      stylers: [
        { saturation: "0" },
        { lightness: "0" }
      ]
    }, {
      featureType: "poi",
      stylers: [
        { visibility: "off" }
      ]
    }, {
      featureType: "transit",
      stylers: [
        { visibility: "off" }
      ]
    }, {
      featureType: "landscape",
      stylers: [
        { saturation: "0"},
        { lightness: "0" }
      ]
    }
  ]

  // Roughly centered around San Francisco.
  var options = {
    zoom: 13,
    center: {lat: 37.7648, lng: -122.4394},
    mapTypeId: 'roadmap',
    disableDefaultUI: true
  };

  var map = new google.maps.Map($("#map")[0], options);
  map.setOptions({styles: style});
  // Global infowindow for when a user selects a "marker" to display more information
  var infoWindow = null;

  // // Use handlebars to precompile film information on click
  var template = Handlebars.compile($("#film-template")[0].innerHTML);

  $.get("films.json", function(data) {
    filmData = data.map(function(film) {
      film.locations = film.locations.map(function(location) {
        var marker = new google.maps.Marker({
          position: location,
          map: map,
          title: film.title
        });

        google.maps.event.addListener(marker, 'click', function() {

          // If an info window is already open, close it
          if (infoWindow) {
            infoWindow.close();
          }

          // Render film information
          infoWindow = new google.maps.InfoWindow({
            content: template(film)
          });
          infoWindow.open(map, marker);
        });

        location.marker = marker;

        return location;
      });

      return film;
    });
  });
});
