// Global to hold all film data.
var filmData = [];
var displayedFilmData = [];
var currentInfoWindow = null;
var map = null;

var renderFilms = function() {
  clearInfoWindow();
  filmData.forEach(function(film) {
    film.locations.forEach(function(location) {
      location.marker.setMap(null);
    });
  });
  displayedFilmData.forEach(function(film) {
    film.locations.forEach(function(location) {
      location.marker.setMap(map);
    });
  });
}

var renderMenu = function() {
  var template = Handlebars.compile($("#menu-entry-template")[0].innerHTML);

  $("#film-menu").html("")

  var films = filmData.sort(function(a, b){
    if(a.title < b.title) return -1;
    if(a.title > b.title) return 1;
    return 0;
  })

  films.forEach(function(film){
    var html = template(film);
    $("#film-menu").append(html)
  });

  $("#film-menu .selectable").click(function(e){
    var target = $(e.currentTarget);

    var title = target.data("title");
    var film = films.find(function(f) { return f.title == title });

    var targetWasSelected = target.hasClass("selected");

    // If anything is selected, we need to deselect it
    if ($("#film-menu .selectable").hasClass("selected")) {
      $("#film-menu .selectable").removeClass("selected");
    }

    if (targetWasSelected) {
      displayedFilmData = filmData;
      renderFilms();
    } else {
      target.addClass("selected");
      displayedFilmData = [film];
      renderFilms();
    }
  });
}

var renderMap = function() {
  // Roughly centered around San Francisco.
  var options = {
    zoom: 13,
    center: {lat: 37.7648, lng: -122.4394},
    mapTypeId: 'roadmap',
    disableDefaultUI: true
  };

  map = new google.maps.Map($("#map")[0], options);

  map.addListener('click', function() {
    clearInfoWindow();
  });
}

var clearInfoWindow = function() {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
}

var setMarkers = function() {
  var template = Handlebars.compile($("#film-template")[0].innerHTML);

  filmData.forEach(function(film) {
    film.locations.forEach(function(location) {
      var marker = new google.maps.Marker({
        position: location,
        map: null,
        title: film.title
      });

      location.marker = marker;

      google.maps.event.addListener(marker, 'click', function() {
        // If an info window is already open, close it
        clearInfoWindow();

        // Render film information
        currentInfoWindow = new google.maps.InfoWindow({
          content: template({film: film, location: location})
        });

        currentInfoWindow.open(map, marker);
      });
    });
  });
}

$( document ).ready(function(){
  renderMap();
  $.get("films.json", function(data) {
    filmData = data;
    setMarkers();
    displayedFilmData = filmData;
    renderMenu();
    renderFilms();
  });
});
