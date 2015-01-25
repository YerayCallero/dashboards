var client = new Keen({
  projectId: "5465e8423831440585aae8b9",
  readKey: "92091663f85279d2535672a51c1a6c3cfdfdf509940c0c8acb3514ab6a43c1389de2cee1c21d8713c10a8b96d81f033d8492b70e1166b0e909ee2876598cdf7cce8779cd374b0a6c755f3e83c7e9de293be834441692d3f577339cea3ae3b3b941e0b851db04cd5bcea1f4992ddc581b"
});

var mapboxAccount = {
	apiAccessToken: "pk.eyJ1IjoieWVyYXljYWxsZXJvIiwiYSI6Il9SUFdSMG8ifQ.z94oPq1u1aXBemi5UImfjw",
	mapId: "yeraycallero.l1fah773"
}; 

Keen.ready(function(){
   showDailyActivityChart();
   showClientGenderChart();
   showClientAgeChart();
   showOfferShownByBrandChart();
   showOfferShownByCategoryChart();
   showActivityMap();
});

//------------- Offer shown by category chart --------
function showOfferShownByCategoryChart() {
 	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERSHOWN"
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.category",
		filters: keenFilter
	});
	
	client.draw(offers_count, document.getElementById("offersShownByCategoryChart"), {
		chartType: "piechart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null,
		chartOptions: {
			is3D: true,			
		}
	});	
}

//------------- Offer shown by brand chart --------
function showOfferShownByBrandChart() {
 	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERSHOWN"
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.name",
		filters: keenFilter
	});
	
	client.draw(offers_count, document.getElementById("offersShownByBrandChart"), {
		chartType: "piechart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null,
		chartOptions: {
			is3D: true,
			legend: 'none'
		}
	});	
}

//------------- Client age chart ------------------
function showClientAgeChart() {
	var keenFilter = [];
	keenFilter.push({
		property_name: "client.ageRange",
		operator: "exists",
		property_value: true
	});
	
	var gender_count = new Keen.Query("count_unique", {
		eventCollection: "smartshop_events",
		targetProperty: "client.id",
		groupBy: "client.ageRange",
		filters: keenFilter
	});	
	
	client.draw(gender_count, document.getElementById("clientAgeChart"), {
		chartType: "piechart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null,
		chartOptions: {
			is3D: true
		}
	});	
}

//------------- Client gender chart ---------------
function showClientGenderChart() {
	var keenFilter = [];
	keenFilter.push({
		property_name: "client.gender",
		operator: "exists",
		property_value: true
	});
	
	var gender_count = new Keen.Query("count_unique", {
		eventCollection: "smartshop_events",
		targetProperty: "client.id",
		groupBy: "client.gender",
		filters: keenFilter
	});	
	
	client.draw(gender_count, document.getElementById("clientGenderChart"), {
		chartType: "piechart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null,
		chartOptions: {
			is3D: true
		}
	});
}

//------------- Daily activity chart --------------

function showDailyActivityChart() {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "SERVICESTART"
	});
    
	var activity_timeline = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		interval: "daily",
		timeframe: {
			start: "2014-09-01T00:00:00.000Z",
			end: "2014-10-01T00:00:00.000Z"
		},
		filters: keenFilter
	});
  
	client.draw(activity_timeline, document.getElementById("dailyActivityChart"), {
		chartType: "linechart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null
	});
}

//------------- Activity map ----------------------

function showActivityMap() {
	var mallData = {
		ID: "1",
		Name: "Centro Comercial XXXX"
	};
	
	initializeMap(mallData, map).done(function(map) {
		showActivityMarkersInMap(map);			
	});
}

function initializeMap(mallData, map) {
	var INITIAL_SETTINGS = {
		coordinates: {
			lat: 0,
			lng: 0
		},
		zoom: 12
	},
	keenFilter = [],
	deferred = $.Deferred();
	
	L.mapbox.accessToken = mapboxAccount.apiAccessToken;
    
    keenFilter.push({
    	property_name: "mall.id",
    	operator: "eq",
    	property_value: mallData.ID
    });
    
    var mall_location = new Keen.Query("select_unique", {
    	eventCollection: "smartshop_events",
    	targetProperty: "mall.location",
    	filters: keenFilter
    });
    
    client.run(mall_location, function(err, res){
    	var mallLocation = res.result[0];
    	INITIAL_SETTINGS.coordinates.lat = mallLocation[1];
    	INITIAL_SETTINGS.coordinates.lng = mallLocation[0];
    	map = L.mapbox.map("map", mapboxAccount.mapId, {
			attributionControl: true,
			center: [INITIAL_SETTINGS.coordinates.lat, INITIAL_SETTINGS.coordinates.lng],
			zoom: INITIAL_SETTINGS.zoom
		});
		var mallDataLayer = L.layerGroup().addTo(map);
		L.marker(new L.LatLng(INITIAL_SETTINGS.coordinates.lat, INITIAL_SETTINGS.coordinates.lng), {
          icon: L.mapbox.marker.icon({
              "marker-color": '#000'
            }),
          title: mallData.Name
        }).addTo(mallDataLayer);
		deferred.resolve(map);
    }); 
    
    return deferred.promise();   
}

function showActivityMarkersInMap(map) {
	
    var keenFilter = [];
    keenFilter.push({
      property_name: "type",
      operator: "eq",
      property_value: "SERVICESTART"
    });

	var heat = L.heatLayer([], {maxZoom: 15}).addTo(map);  

    var activity_events = new Keen.Query("select_unique", {
      eventCollection: "smartshop_events",
      targetProperty: "keen.location.coordinates",
      filters: keenFilter
    });
    
    client.run(activity_events, function(err, res){
      Keen.utils.each(res.result, function(coord, index){        
       	heat.addLatLng(new L.LatLng(coord[1], coord[0]));
      });
    });
}

