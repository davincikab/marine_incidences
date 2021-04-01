var articles, incidents, articleMarkers = [];
var listingDiv = document.getElementById("listing-div");
var mapWrapperContainer = document.getElementById("container");

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/bldgit13/ckmg34nec0elb17mto0vxj6lj',
    style:'mapbox://styles/mapbox/dark-v10',
    center: [-7.594081153831553, 14.730749011074153], // master center
    zoom: 2, // master zoom
    attribution:false,
    customAttribution:'M.A.R.E'
});

// navigation control
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

// full screen control
var fullScreenControl = new mapboxgl.FullscreenControl();
 
// era boundary
var eraBoundary = {
    "type": "FeatureCollection",
    "name": "era",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type":"Feature", "geometry": { "type":"LineString", "coordinates":[[-2.00, 4.75], [-2.00, 4.00], [6.4167, -0.1833], [8.7000, -0.6333]]}}
    ]
};

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
            0.2, 'rgba(238, 113, 104, 0.435)',
            0.8, 'rgba(238, 113, 104, 0.855)'
         ],
      },
      "layout":{
         "visibility":"visible"
      }
    });

    // map.addSource('eez-boundary', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.eez-boundary"
    // });

    // map.addLayer({
    //     "id":'ee-zones',
    //     "source":'eez-boundary',
    //     "source-layer":"eez-boundary",
    //     "type":"line",
    //     "paint":{
    //         "line-color":"#d3e289",
    //         "line-width":1
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

    // map.addSource('archipelagic-waters', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.archipelagic-waters"
    // });

    // map.addLayer({
    //     "id":'archipelagic-waters',
    //     "source":'archipelagic-waters',
    //     "source-layer":"archipelagic-waters",
    //     "type":"fill",
    //     "paint":{
    //         "fill-color":"#d3e289",
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

    // map.addSource('eez-24nm', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.eez-24nm"
    // });

    // map.addLayer({
    //     "id":'eez-24nm',
    //     "source":'eez-24nm',
    //     "source-layer":"eez-24nm",
    //     "type":"fill",
    //     "paint":{
    //         "fill-color":"#ff7f00",
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

    // map.addSource('eez-12nm', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.eez-12nm"
    // });

    // map.addLayer({
    //     "id":'eez-12nm',
    //     "source":'eez-12nm',
    //     "source-layer":"eez-12nm",
    //     "type":"fill",
    //     "paint":{
    //         "fill-color":"#984ea3",
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

    // // IHO Waters
    // map.addSource('iho-seas', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.iho-seas"
    // });

    // map.addLayer({
    //     "id":'iho-seas',
    //     "source":'iho-seas',
    //     "source-layer":"iho-seas",
    //     "type":"fill",
    //     "paint":{
    //         "fill-color":"#2facd6",
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

    // // internal Waters
    // map.addSource('internal-waters', {
    //     "type":"vector",
    //     "url":"mapbox://bldgit13.internal-waters"
    // });

    // map.addLayer({
    //     "id":'internal-waters',
    //     "source":'internal-waters',
    //     "source-layer":"internal-waters",
    //     "type":"fill",
    //     "paint":{
    //         "fill-color":"#5964d6",
    //     },
    //     "layout":{
    //         "visibility":"none"
    //     }
    // });

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

        // Incidents in the past week
        let oneWeekInMs = 1000 * 60 * 60 * 24 * value;
        let filterDate = new Date(new Date() - oneWeekInMs);

        incidents = data.filter(article => new Date(article.cct_created) > filterDate);
        let incidentCount = document.getElementById("incident-count");
        incidentCount.innerHTML = "Incidents: "  + incidents.length;

        createAlertListing(incidents);

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
    // "<p>" + item.event_description +"</p>"+
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
    listItem.innerHTML += "<span class='dot' style='background-color:"+ alert.bg_color+"'></span>";
    listItem.innerHTML += alert.country + " " + alert.title;

    // add interactivity
    listItem.addEventListener("click", function(e) {
        // stop event propagation to the map
        e.stopPropagation();

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
   var openVesselTab = document.getElementById("open-vessel-tab");
   var closeVesselTab = document.getElementById("close-vessel-tab");
   var vesselTab = document.getElementById("vessel-tab");

   closeVesselTab.addEventListener("click", function(e) {
      vesselTab.style.display = "none";
   });

   openVesselTab.addEventListener("click", function(e) {
       closeFilterTab();
      vesselTab.style.display = "block";
   });

// open and close layer tab
var openLayerTab = document.getElementById("open-layer-tab");
var closeLayerTab = document.getElementById("close-layer-tab");
var layerTab = document.getElementById("layer-tab");

closeLayerTab.addEventListener("click", function(e) {
    layerTab.style.display = "none";
    removeActiveClass();
});

openLayerTab.addEventListener("click", function(e) {
    console.log("Home coming");
    closeFilterTab();

    layerTab.style.display = "block";
    this.classList.add('active');
});

// incident tab
var incidentsType = [
    {name:'Sea Robbery', bg_color:"#ffff00"},
    {name: 'Piracy Attack', bg_color:"#7030a0"}, 
    {name:'Piracy Kidnap / Hijack', bg_color:"#ff0000"},
    {name: 'Criminality', bg_color:"#ffffff"}, 
    {name: 'Activism', bg_color:""},
    {name: 'Smuggling / Trafficking', bg_color:""},
    {name: 'IUU Fishing', bg_color:""}, 
    {name: 'Storewaways', bg_color:""},
    {name: 'Suspicious', bg_color:"#92d050"},
    {name: 'Militancy', bg_color:""}, 
    {name: 'Law Enforcement', bg_color:""}, 
    {name: 'Others', bg_color:""}
];

var incidencesElement = document.getElementById("incidences");
incidentsType.forEach(incident => {
    // create a form group
    let element = `<div class="form-group">
        <input type="checkbox" name="${incident.name}" id="" ${incident.name}>
        <span class="dot" style="background-color:${incident.bg_color}"></span>
        <label for="${incident.name}">${incident.name}</label>
    </div>`;

    incidencesElement.innerHTML += element;
});

var incidentTab = document.getElementById("incident-tab");
var openIncidentTab = document.getElementById("open-incident-tab");
var closeIncidentTab = document.getElementById("close-incident-tab")

openIncidentTab.addEventListener("click", function(e) {
    console.log("Home coming");

    closeFilterTab();
    incidentTab.style.display = "block";
    this.classList.add('active');
});

closeIncidentTab.addEventListener("click", function(e) {
    console.log("Home coming");
    incidentTab.style.display = "none";
    this.classList.add('active');
});


var incidentSelectDate = document.getElementById("alert-date");
var incidentCount = document.getElementById("incident-count");
var toggleIncidents = document.getElementById("show-incidents");

incidentSelectDate.addEventListener("change", function(e) {
    let value = e.target.value;
    value = parseInt(value, 10);

    let valueInMs = 1000 * 60 * 60 * 24 * value;
    var filterDate = new Date(new Date() - valueInMs);

    // call the filter function
    incidents = articles.filter(article => new Date(article.cct_created) > filterDate);
    listingDiv.innerHTML = "";
    incidentCount.innerHTML = "Incidents: " + incidents.length;

    createAlertListing(incidents);

});

toggleIncidents.addEventListener("change", function(e) {
    let { checked } = e.target;

    if(checked) {
        // display the incidents
        clearMarkers();
        createCategoryMarkers(incidents);
    } else {
        clearMarkers();
        createCategoryMarkers(articles);
    }
});

// date tab and incident tab
var dateTab = document.getElementById("date-tab");
var openDateTab = document.getElementById("open-date-filter");
var closeDateTab = document.getElementById("close-date-tab")

openDateTab.addEventListener("click", function(e) {
    console.log("Home coming");

    closeFilterTab();
    dateTab.style.display = "block";
    this.classList.add('active');
});

closeDateTab.addEventListener("click", function(e) {
    console.log("Home coming");

    dateTab.style.display = "none";
    this.classList.add('active');
});

// last alerts filter
var alertsTab = document.getElementById("alerts-tab");
var openAlertsTab = document.getElementById("open-alerts-tab");
var closeAlertsTab = document.getElementById("close-alerts-tab")

openAlertsTab.addEventListener("click", function(e) {
    console.log("Home coming");

    closeFilterTab();
    alertsTab.style.display = "block";
    this.classList.add('active');
});

closeAlertsTab.addEventListener("click", function(e) {
    console.log("Home coming");

    alertsTab.style.display = "none";
    this.classList.add('active');
});

// country filter
var countryTab = document.getElementById("country-tab");
var openCountryTab = document.getElementById("open-country-tab");
var closeCountryTab = document.getElementById("close-country-tab")

openCountryTab.addEventListener("click", function(e) {
    console.log("Home coming");

    closeFilterTab();
    countryTab.style.display = "block";
    this.classList.add('active');
});

closeCountryTab.addEventListener("click", function(e) {
    console.log("Home coming");

    countryTab.style.display = "none";
    this.classList.add('active');
});

// toggle layers
var layersCheckbox = document.querySelectorAll(".form-group input[type=checkbox]");
layersCheckbox.forEach(layer => {
      layer.addEventListener("input", function(e) {
      let name = e.target.name;
      let value = e.target.value;
      let checked = e.target.checked;

    // update the form group
    let parentElement = layer.parentElement;
    addActiveClass(parentElement);

    // if(checked) {
    //     parentElement.classList.add('active'); 
    // } else { 
    //     parentElement.classList.remove('active');
    // }

    // update the layout property
    if(name == 'articles') {
         !checked ? clearMarkers() : createCategoryMarkers(articles);
    } else {
         var visibility = checked ? 'visible' : 'none';
         map.getSource(name) ? map.setLayoutProperty(name, 'visibility', visibility) : false;
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
    closeFilterTab();
    attributionTab.style.display = "block";
});


// refresh the map
var refreshButton = document.getElementById("refresh-map");
refreshButton.addEventListener("click", function(e) {
    console.log("Reloading");
    window.location.reload();
});


// full screen view
var fullScreenButton = document.getElementById("full-screen-mode");
fullScreenButton.addEventListener("click", function(e) {
    if(document.fullscreenEnabled) {
        if(document.fullscreenElement) {
            document.exitFullscreen();
        }  else {
            mapWrapperContainer.requestFullscreen();
        }
    }
});

// toggle sidebar
var sideBar = document.getElementById("side-tab");
var openSideTab = document.getElementById("open-side-tab");
var closeSideTab = document.getElementById("close-side-tab");

openSideTab.addEventListener("click", function(e) {
    console.log("Opening");
    sideBar.style.display = "block";
});

closeSideTab.addEventListener("click", function(e) {
    sideBar.style.display = "none";
});


// Toggle filter item
var filterItems = document.querySelectorAll(".filter-item");
function removeActiveClass() {
    filterItems.forEach(item => item.classList.remove('active'));
}

filterItems.forEach(item => {
    item.addEventListener("click", function(e) {
        removeActiveClass();
        addActiveClass(item);
    });
});

function addActiveClass(element) {
    if(element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
}

function closeFilterTab() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.style.display = 'none';
    });
}