var articles, incidents, articleMarkers = [];
var listingDiv = document.getElementById("listing-div");

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
            0, 'rgba(238, 113, 104, 0)',
            0.2, 'rgba(238, 113, 104, 0.555)',
            0.8, 'rgba(238, 113, 104, 0.855)'
         ],
      },
      "layout":{
         "visibility":"none"
      }
    });

    map.addSource('eez-boundary', {
        "type":"vector",
        "url":"mapbox://bldgit13.eez-boundary"
    });

    map.addLayer({
        "id":'ee-zones',
        "source":'eez-boundary',
        "source-layer":"eez-boundary",
        "type":"line",
        "paint":{
            "line-color":"#d3e289",
            "line-width":1
        },
        "layout":{
            "visibility":"none"
        }
    });

    map.addSource('archipelagic-waters', {
        "type":"vector",
        "url":"mapbox://bldgit13.archipelagic-waters"
    });

    map.addLayer({
        "id":'archipelagic-waters',
        "source":'archipelagic-waters',
        "source-layer":"archipelagic-waters",
        "type":"fill",
        "paint":{
            "fill-color":"#d3e289",
        },
        "layout":{
            "visibility":"none"
        }
    });

    map.addSource('eez-24nm', {
        "type":"vector",
        "url":"mapbox://bldgit13.eez-24nm"
    });

    map.addLayer({
        "id":'eez-24nm',
        "source":'eez-24nm',
        "source-layer":"eez-24nm",
        "type":"fill",
        "paint":{
            "fill-color":"#ff7f00",
        },
        "layout":{
            "visibility":"none"
        }
    });

    map.addSource('eez-12nm', {
        "type":"vector",
        "url":"mapbox://bldgit13.eez-12nm"
    });

    map.addLayer({
        "id":'eez-12nm',
        "source":'eez-12nm',
        "source-layer":"eez-12nm",
        "type":"fill",
        "paint":{
            "fill-color":"#984ea3",
        },
        "layout":{
            "visibility":"none"
        }
    });

    // IHO Waters
    map.addSource('iho-seas', {
        "type":"vector",
        "url":"mapbox://bldgit13.iho-seas"
    });

    map.addLayer({
        "id":'iho-seas',
        "source":'iho-seas',
        "source-layer":"iho-seas",
        "type":"fill",
        "paint":{
            "fill-color":"#2facd6",
        },
        "layout":{
            "visibility":"none"
        }
    });

    // internal Waters
    map.addSource('internal-waters', {
        "type":"vector",
        "url":"mapbox://bldgit13.internal-waters"
    });

    map.addLayer({
        "id":'internal-waters',
        "source":'internal-waters',
        "source-layer":"internal-waters",
        "type":"fill",
        "paint":{
            "fill-color":"#5964d6",
        },
        "layout":{
            "visibility":"none"
        }
    });

      // load articles data
    let ARTICLE_URL = "https://staging-praesidiumintl.kinsta.cloud/wp-json/jet-cct/mare/?_orderby=_ID&_order=desc&_ordertype=integer";
    fetch(ARTICLE_URL)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        articles = data;
        createCategoryMarkers(data); 

        // sort the data by cc_created
        data = data.sort((a, b) => new Date(a.cct_created) < new Date(b.cct_created));
        createAlertListing(data.slice(0, 5));

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
    let popupContent = getPopupContent(item);

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

function getPopupContent(item) {
    return "<div class='popup-content'>"+
    "<img src='"+ item.photo +"' alt='" + item.title + "' class='popup-img' />" +
    "<div class='article-info'>" +
    "<h2 class='article-title'><a href=''>" + item.title + "</a></h2>" +
    "<p>" + item.event_description +"</p>"+
    "</div>" +
 "</div>";
}

function createAlertListing(alerts) {
    var docFrag = document.createDocumentFragment();

    // get listing Item
    alerts.forEach(alert => {
        let item = createAlertListItem(alert);
        docFrag.append(item);
    });

    // update the listing div
    listingDiv.innerHTML = "";
    listingDiv.append(docFrag);
}

function createAlertListItem(alert) {
    var listItem = document.createElement("div");
    listItem.classList.add("list-item");

    // add alert list id
    listItem.setAttribute("data-ID", alert._ID);

    // add text content
    listItem.innerHTML = alert.title;

    // add interactivity
    listItem.addEventListener("click", function(e) {
        // get id attribute
        let alertId = this.getAttribute("data-ID");
        zoomToAlert(alertId);
    });

    return listItem;
}


function zoomToAlert(alertId) {
    // find the alert with the given id
    let activeAlert = articles.find(article => article._ID == alertId);

    if(activeAlert) {
        let center = [activeAlert._lng, activeAlert._lat];

        // flyTo the alert
        map.flyTo({
            center:center,
            zoom:8
        });
        
        map.once("zoomend", function(e) {
            // load a popup
            new mapboxgl.Popup()
                .setHTML(getPopupContent(activeAlert))
                .setLngLat(center)
                .addTo(map);
        });
        
    }
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
      attributionTab.style.display = "none";
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
    attributionTab.style.display = "none";
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

// toggle attribution tab
var closeAttributionButton = document.getElementById("close-info-tab");
var openAttributionButton = document.getElementById("open-info-tab");
var attributionTab = document.getElementById("info-tab");

closeAttributionButton.addEventListener("click", function(e) {
    attributionTab.style.display = "none";
});

openAttributionButton.addEventListener("click", function(e) {
    layerTab.style.display = "none";
    filterTab.style.display = "none";
    attributionTab.style.display = "block";
});


