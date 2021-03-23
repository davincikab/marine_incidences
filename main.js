var articles, incidents, articleMarkers = [];

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxkZ2l0MTMiLCJhIjoiY2ttMzc4NmJ3MWV3YjJ1cW1lbWl3OG4wbiJ9.BxSkkd3BZnJXuxnYcwURog';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bldgit13/ckmg34nec0elb17mto0vxj6lj',
    center: [-7.594081153831553, 14.730749011074153], // master center
    zoom: 2, // master zoom
});

map.addControl(new mapboxgl.NavigationControl());
    
// map load event
map.on("load", function(e) {
      // load icons

      // heatmap
    map.addSource('incidents', {
      "type":"geojson",
      "data":{
         "type":"FeatureCollection",
         "features":[]
      }
    });

    map.addLayer({
      "id":"incidents",
      "source":"incidents",
      "type":"heatmap",
      "paint":{
         "heatmap-weight":{
         'property': 'dbh',
         'type': 'exponential',
         'stops': [
            [1, 0],
            [62, 1]
         ]
         },
         'heatmap-intensity': {
         stops: [
            [11, 1],
            [15, 3]
         ]
         },
         'heatmap-color': [
         'interpolate',
         ['linear'],
         ['heatmap-density'],
         0, 'transparent',
         0.2, '#e59b95',
         0.8, '#D7655A'
         ],
      },
      "layout":{
         "visibility":"none"
      }
    })

      // load incidents data

      // load articles data
    let ARTICLE_URL = "https://staging-praesidiumintl.kinsta.cloud/wp-json/jet-cct/mare/?_orderby=_ID&_order=desc&_ordertype=integer";
    fetch(ARTICLE_URL)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        articles = data;
        createCategoryMarkers(data); 

        // incidents
        var incidentGeojson = createGeojson(data);
        map.getSource('incidents').setData(incidentGeojson);
    })
    .catch(error => {
        console.error(error);
    });

});

   // markers
function createCategoryMarkers(data) {
      data.forEach(item => {
        createMarker(item);
      });
}

function createMarker(item) {
    // popup html content
    let popupContent = "<div class='popup-content'>"+
         "<img src='https://picsum.photos/200/300' alt='" + item.title + "' class='popup-img' />" +
         "<div class='article-info'>" +
         "<h2 class='article-title'><a href=''>" + item.title + "</a></h2>" +
         "<p>" + item.event_description +"</p>"+
         "</div>" +
      "</div>";

    // popup content
    var popup = new mapboxgl.Popup()
      .setMaxWidth('300px')
      .setHTML(popupContent);

    // get icon
    let icon = getCategorizeMarker(item.category);
    var markerIcon = document.createElement("div");
    markerIcon.style.backgroundColor = item.bg_color;

    markerIcon.classList.add("div-marker");
      // markerIcon.classList.add(icon);

    // custom markers
    var marker  = new mapboxgl.Marker({element:markerIcon})
      .setLngLat([parseFloat(item._lng), parseFloat(item._lat)])
      .setPopup(popup)
      .addTo(map);

      articleMarkers.push(marker);
   }

   // marker types
function getCategorizeMarker(category) {
    let markerType;
    switch(category) {
    case 'Piracy Attack':
        markerType = "icon-one"
        break;
    case 'Sea Robbery':
        markerType = "icon-two"
        break;
    case 'Suspicious':
        markerType = "icon-three"
        break;
    default:
        markerType = "icon-three"
        break;
    };

    return markerType;
}

function clearMarkers() {
    articleMarkers.forEach(marker => marker.remove());
}

function createGeojson(data) {
    let fc = {"type":"FeatureCollection", "features":[]};
      
    data.forEach(item => {
    let feature = {
         "type":"Feature",
         "geometry":{
         "type":"Point",
         "coordinates":[item._lng, item._lat]
         },
         "properties":{...item}
      };

      fc.features.push(feature);
      })

      return fc;
   }

   // layer control: Create a custom control
   class LayerControl {
      onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl';

      this._button = document.createElement("button");
      this._button.classList.add("btn");
      this._button.innerHTML = "<i class='fa fa-bars'></i>"
      this._container.textContent = 'Hello, world';

      return this._container; 
      }

      onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
      }
   }

   // date filter
   var fromDate = document.getElementById("from-date");
   var toDate = document.getElementById("to-date");

   var dateFilter = {from:"", to:""};

   fromDate.addEventListener("change", function(e) {
      console.log(e);
      dateFilter.from = e.target.value;
   });

   toDate.addEventListener("change", function(e) {
      console.log(e);
      dateFilter.to = e.target.value;
   });

   var applyFilter = document.getElementById("apply-filter");
   var clearFilter = document.getElementById("clear-filter");

   applyFilter.addEventListener("click", function(e) {
      // check if we have both from and to dates
      if(dateFilter.from && dateFilter.to) {
      // filter the data
      var filteredArticles = articles.filter(article => {
         let articleDate = new Date(article.date);
         let { from, to } = dateFilter;

         if(new Date(from) < articleDate && new Date(to) > articleDate) {
         return article;
         }
      });

      // update the markers
      clearMarkers();
      createCategoryMarkers(filteredArticles);


      console.log(filteredArticles);
      }
   });

   clearFilter.addEventListener("click", function(e) {
      // reset date input fields
      dateFilter.from = fromDate.value = "";
      dateFilter.to = toDate.value = "";

   });

   // open and close filter tab
   var openFilter = document.getElementById("open-filter");
   var closeFilter = document.getElementById("close-filter");
   var filterTab = document.getElementById("filter-tab");

   closeFilter.addEventListener("click", function(e) {
      filterTab.style.display = "none";
   });

   openFilter.addEventListener("click", function(e) {
      filterTab.style.display = "block";
      layerTab.style.display = "none";
   });

// open and close layer tab
var openLayerTab = document.getElementById("open-layer-tab");
var closeLayerTab = document.getElementById("close-layer-tab");
var layerTab = document.getElementById("layer-tab");

closeLayerTab.addEventListener("click", function(e) {
    layerTab.style.display = "none";
});

openLayerTab.addEventListener("click", function(e) {
    layerTab.style.display = "block";
    filterTab.style.display = "none";
});

// toggle layers
var layersCheckbox = document.querySelectorAll(".form-group input[type=checkbox]");
layersCheckbox.forEach(layer => {
      layer.addEventListener("input", function(e) {
      let name = e.target.name;
      let value = e.target.value;
      let checked = e.target.checked;

      // update the layout property
      if(name == 'articles') {
         !checked ? clearMarkers() : createCategoryMarkers(articles);
      } else {
         var visibility = checked ? 'visible' : 'none';
         map.setLayoutProperty(name, 'visibility', visibility);
      }
      });
});
