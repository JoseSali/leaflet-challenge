// Initialize the map
var map = L.map('map').setView([20.0, 5.0], 2); // Centered globally

// Base maps
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Add street map by default
streetMap.addTo(map);

// URL for earthquake data (last 7 days)
var earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// URL for tectonic plates data
var tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to determine marker color based on depth
function markerColor(depth) {
  return depth > 90 ? '#FF3333' :
         depth > 70 ? '#FF6633' :
         depth > 50 ? '#FF9933' :
         depth > 30 ? '#FFCC33' :
         depth > 10 ? '#FFFF33' : '#99FF33';
}

// Fetch the earthquake data
d3.json(earthquakeDataUrl).then(function(data) {
  // Create earthquake layer
  var earthquakes = L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  });

  // Add the earthquake layer to the map
  earthquakes.addTo(map);

  // Fetch the tectonic plates data
  d3.json(tectonicPlatesUrl).then(function(plateData) {
    // Create tectonic plates layer
    var tectonicPlates = L.geoJSON(plateData, {
      style: function() {
        return {
          color: "#FF6600",
          weight: 2
        };
      }
    });

    // Define base maps
    var baseMaps = {
      "Street Map": streetMap,
      "Topographic Map": topoMap
    };

    // Define overlay maps
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Add tectonic plates layer to the map by default
    tectonicPlates.addTo(map);
  });
});

// Add legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [-10, 10, 30, 50, 70, 90],
      labels = [];

  div.innerHTML = '<strong>Depth (km)</strong><br>';

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map);
