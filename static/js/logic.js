// Store our API endpoint
var listingUrl = "resources/Transformed_JSON_to_GeoJSON.json";
var schoolUrl = "resources/school/csvjson.json";

// Perform a GET request to above House Listing and Fraxen url queries
d3.json(listingUrl, function(data) {
  console.log(data);
  d3.json(schoolUrl, function(data2) {
    // Send the data.features object to the createFeatures function
    createFeatures(data.features, data2.features);
  })
});

// d3.json(schoolurl, function(data2) {
//   console.log(data2);
//   // Create a new marker cluster group
//   var markers = new L.markerClusterGroup();

//   // Loop through data
//   for (var i = 1; i < data2.length; i++) {

//     // Set the data location property to a variable
//     var lat = data2[i].lat;

//     // Check for location property
//     if (lat) {

//       // Add a new marker to the cluster group and bind a pop-up
//       markers.addLayer(L.marker([lat.coordinates[1], location.coordinates[0]])
//         .bindPopup(response[i].descriptor));
//     }

//   }

//   // Add our marker cluster layer to the map
//   myMap.addLayer(markers);
// });


// Function to set color of the house based on their pricing
function getColor(d) {
  return d > 10 ? "purple" :
         d > 2 ? "red" :
         d > 1 ? "orange" :
         d > 0.5 ? "yellow" :
                  "green" ;
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
function createFeatures(listingData) {

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
  function onEachSchoolLayer(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.name + 
    "<br> Rating: " + feature.properties.rating +"</h4>"
    );
  }

  // Create a GeoJSON layer containing the features array on the ListingData & plateData object
  // Run the onEachFeature function once to loop through data in the array
  var housings = L.geoJSON(listingData, {
    onEachFeature: onEachListing,
    pointToLayer: onEachHouseLayer
  });

  var schools = L.geoJSON(schoolData, {
    onEachFeature: onEachSchoolLayer,
    color: "blue"
    });

  // Send our housing & schools layer to the createMap function
  createMap(housings, schools);
}

// Function to create map
function createMap(housings, schools) {

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

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
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
    "Schools": schools
  };

  // Create our map, giving it the satellitemap, housings & plates layers to display on load
  var myMap = L.map("map", {
    center: [43.6529, -79.3849],
    zoom: 10,
    layers: [darkmap, housings, schools]
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
        grades = [0,0.5,1,2,10],
        labels = [0, "0.5", "1M", "2M", "10M"];

      // loop through pricing intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i]+0.1) + '"></i> ' +
              labels[i] + (labels[i + 1] ? '&ndash;' + labels[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);


// Adding second legend
var legend2 = L.control({position: 'bottomleft'});

legend2.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0,1,2,3,4],
      labels = ["D = Detached House", "S = Semi-Detached House", "T = Townhouse", "C = Condo", "Null = Unknown"];

    // loop through pricing intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            ('<i style="background:' + "gold" + '"></i> ' +
            labels[i] + '<br>')}

    return div;
};

legend2.addTo(myMap);

}






