// Initialize the map, set center and zoom level (here using London as an example)
var map = L.map('map').setView([51.5074, -0.1278], 10);
var mapboxAccessToken = 'pk.eyJ1IjoibHV4dXJ5ODE3IiwiYSI6ImNtNmY4cDJndjAya2kybHMwaHA1MDhhN3oifQ.XGrJFKv4bd2ntX_3U1f2mA';

// 3. Add the Mapbox Dark-v10 base layer
L.tileLayer(
  'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken,
  {
    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 18
  }
).addTo(map);



// Initialize the layer control
var overlays = {};
var layerControl = L.control.layers(null, overlays, { collapsed: false }).addTo(map);

// Define a color map at the top, assigning a bright color for each category
var colorMap = {
  'Artist_workspaces': '#e74c3c',         // Vibrant red
  'Cinemas': '#9b59b6',                   // Purple
  'Fashion and Design': '#f39c12',        // Orange
  'LGBT Venues': '#e67e22',               // Dark orange
  'Theatre': '#2ecc71',                   // Bright green
  'Music_Nightclubs': '#8e44ad',          // Dark purple
  'Music_Venues': '#3498db',              // Light blue
  'Museum and Gallery': '#e84393',        // Hot pink
  'Dance_performance_venues': '#16a085',   // Teal
  'Jewellery design': '#d35400',           // Vermilion
  'Libraries': '#d35000'                   
};


// Modify the pointToLayer logic in loadGeoJSON function
function loadGeoJSON(url, category, layerName, defaultDisplay) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      var markersCluster = L.markerClusterGroup();

      var geojsonLayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
          // Get color from colorMap based on category; default to gray if not found
          var chosenColor = colorMap[category] || 'gray';
          
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: chosenColor,
            color: chosenColor,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7   // Slightly high fill opacity to make the color stand out
          });
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            var popupContent = "";
            if (feature.properties.name) {
              popupContent += "<strong>" + feature.properties.name + "</strong><br>";
            }
            if (feature.properties.location) {
              popupContent += "location: " + feature.properties.location + "<br>";
            }
            if (feature.properties.website) {
              popupContent += "website: <a href='" + feature.properties.website + "' target='_blank'>" + feature.properties.website + "</a>";
            }
            layer.bindPopup(popupContent);
          }
        }
      });

      markersCluster.addLayer(geojsonLayer);

      if (defaultDisplay) {
        map.addLayer(markersCluster);
      }

      overlays[layerName] = markersCluster;
      layerControl.addOverlay(markersCluster, layerName);
    })
    .catch(error => console.error('loda GeoJSON failed:', error));
}

loadGeoJSON('data/Artists_workspaces.geojson', 'Artist_workspaces', 'Artist_workspaces');
loadGeoJSON('data/Cinemas.geojson', 'Cinemas', 'Cinemas');
loadGeoJSON('data/CIM 2023 Fashion and design.geojson', 'Fashion and Design', 'Fashion and Design');
loadGeoJSON('data/CIM 2023 Lgbt venues.geojson', 'LGBT Venues', 'LGBT Venues');
loadGeoJSON('data/CIM 2023 Theatre.geojson','Theatre','Theatre');
loadGeoJSON('data/CIM 2024 Music_Nightclubs.geojson','Music_Nightclubs','Music_Nightclubs')
loadGeoJSON('data/CIM 2024 Music_Venues_All.geojson','Music_Venues','Music_Venues')
loadGeoJSON('data/Museum and Gallery.geojson','Museum and Gallery','Museum and Gallery')
loadGeoJSON('data/Dance_performance_venues.geojson','Dance_performance_venues','Dance_performance_venues')
loadGeoJSON('data/Jewellery design.geojson','Jewellery design','Jewellery design')
loadGeoJSON('data/CIM 2023 Libraries (Nov 2023).geojson','Libraries','Libraries');


// Load London Borough boundary data, displayed in a grey-blue style
fetch('data/London.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    L.geoJSON(geojsonData, {
      style: function (feature) {
        return {
          color: '#34495e',              // Boundary line color: dark blue-gray
          weight: 2,
          fillColor: 'rgba(255,255,255,0.5)', // Transparent white fill
          fillOpacity: 0.6
        };
      }
    }).addTo(map);
    console.log("London boundary data loaded successfully");
  })
  .catch(error => console.error("Failed to load London GeoJSON:", error));

// Initialize cover and data panels after DOM has loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize bar chart (for the panel on the bottom-right)
  createBarChart();

  // "Enter Map" button logic
  var enterMapBtn = document.getElementById('enterMapBtn');
  if (enterMapBtn) {
    enterMapBtn.addEventListener('click', function () {
      var mapCover = document.getElementById('mapCover');
      // Add fade-out animation effect (ensure .fade-out is defined in CSS)
      mapCover.classList.add('fade-out');
      // After animation, hide cover, refresh map, and display the data panels
      setTimeout(function () {
        mapCover.style.display = 'none';
        map.invalidateSize();
        
        var venuePanel = document.getElementById('venuePanel');
        var chartPanel = document.getElementById('chartPanel');
        if (venuePanel) {
          venuePanel.style.display = 'block';
        } else {
          console.error('venuePanel not found');
        }
        if (chartPanel) {
          chartPanel.style.display = 'block';
        } else {
          console.error('chartPanel not found');
        }
      }, 1000);
    });
  }
  var toggleBtn = document.getElementById('togglePanelBtn');
  var venuePanel = document.getElementById('venuePanel');
  if (toggleBtn && venuePanel) {
    toggleBtn.addEventListener('click', function () {
      // Toggle the "collapsed" class (affecting only the panel content; header remains visible)
      venuePanel.classList.toggle('collapsed');
      // Update button icon based on panel state
      if (venuePanel.classList.contains('collapsed')) {
        toggleBtn.innerHTML = '►';  // Show right arrow when collapsed
      } else {
        toggleBtn.innerHTML = '☰';  // Show hamburger menu when expanded
      }
    });
  }
 
});

// Create bar chart function with hover color effects
function createBarChart() {
  const data = [
    { type: "Artist workspaces", number: 270 },
    { type: "Cinemas", number: 123 },
    { type: "Dance Performance venues", number: 196 },
    { type: "Fashion Design and manufacturing", number: 80 },
    { type: "Jewellery design", number: 117 },
    { type: "LGBT + night times venues", number: 50 },
    { type: "Libraries", number: 347 },
    { type: "Museum and public galleries", number: 253 },
    { type: "Music night clubs", number: 133 },
    { type: "Theatres", number: 266 },
    { type: "Music Venues", number: 371 }
  ];

  // Extract labels and data
  const labels = data.map(item => item.type);
  const numbers = data.map(item => item.number);

  const ctx = document.getElementById('barChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'counts',
        data: numbers,
        backgroundColor: 'rgba(62, 149, 205, 0.7)',       // Normal fill color
        borderColor: 'rgba(62, 149, 205, 1)',             // Normal border color
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.7)',  // Hover fill color
        hoverBorderColor: 'rgba(255, 99, 132, 1)'         // Hover border color
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


