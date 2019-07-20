// Store our API endpoint
var listingUrl = "resources/Transformed_JSON_to_GeoJSON.json";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to above House Listing and Fraxen url queries
d3.json(listingUrl, function(data) {
  console.log(data);
  d3.json(platesUrl, function(data2) {
    // Send the data.features object to the createFeatures function
    createFeatures(data.features, data2.features);
  })
});

// Function to set color of the house based on their pricing
function getColor(d) {
  return d > 10 ? "red" :
         d > 2 ? "orange" :
         d > 1 ? "yellow" :
         d > 0.5  ? "green" :
                  "greenyellow" ;
                }


// Function to set opacity of the house based on their pricing
function getOpacity(p) {
  return p > 10 ? 0.2 :
         p > 2 ?  0.4  :
         p > 1.5 ? 0.6 :
         p > 1  ? 0.7 :
         p > 0.5  ? 0.8 :
                 0.9 ;
                }


// // Function to set circle size by housing prices
function getRadius(price) {
  return price * 50;
}

// Function to create and utilize features
function createFeatures(listingData, plateData) {

  // Function to run once to render each feature in listing data
  // Give each house a popup describing the type and price
  function onEachListing(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.house_type +
      "<br>Price in M$: " + feature.properties.price + "</h4>");
  }

  // Assign marker to each house
  function onEachHouseLayer (feature, latlng) {
    return new L.circle(latlng, {
      radius: getRadius(feature.properties.price),
      fillColor: getColor(feature.properties.price),
      fillOpacity: getOpacity(feature.properties.price),
      stroke: false,
    });
  }

  // Function to run once to render each feature in tectonic plates data
  // Give each tectonic plates a popup describing the name of the plate
  function onEachPlateLayer(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.Name + "</h4>");
  }

  // Create a GeoJSON layer containing the features array on the ListingData & plateData object
  // Run the onEachFeature function once to loop through data in the array
  var housings = L.geoJSON(listingData, {
    onEachFeature: onEachListing,
    pointToLayer: onEachHouseLayer
  });

  var plates = L.geoJSON(plateData, {
    onEachFeature: onEachPlateLayer,
    color: "goldenrod"
    });

  // Send our housing & plates layer to the createMap function
  createMap(housings, plates);
}

// Function to create map
function createMap(housings, plates) {

  // Define satellite, grayscale & outdoor layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.gray",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var piratemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": graymap,
    "Darkscale": darkmap
  };

  // Create overlayMaps object to hold our overlay map layer
  var overlayMaps = {
    "Housing": housings,
    "Fault Lines": plates
  };

  // Create our map, giving it the satellitemap, housings & plates layers to display on load
  var myMap = L.map("map", {
    center: [43.6529, -79.3849],
    zoom: 10,
    layers: [darkmap, housings, plates]
  });

  // Create a layer control to enable toggle among our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Adding legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4],
        labels = [];

      // loop through pricing intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);
}


