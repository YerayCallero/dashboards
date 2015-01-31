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
   showOfferFavouritesByBrandChart();
   showSearchesByBrandChart();
   showSearchesByQueryChart();
   showActivityMap();
});

//------------- Searches by query chart --------
function showSearchesByQueryChart() {
 	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "SEARCHRESPONSE"
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "search.query",
		filters: keenFilter
	});
	
	var resultJson = [];
	var obj;
	var URL = 'https://api.keen.io/3.0/projects/5465e8423831440585aae8b9/queries/count?api_key=92091663f85279d2535672a51c1a6c3cfdfdf509940c0c8acb3514ab6a43c1389de2cee1c21d8713c10a8b96d81f033d8492b70e1166b0e909ee2876598cdf7cce8779cd374b0a6c755f3e83c7e9de293be834441692d3f577339cea3ae3b3b941e0b851db04cd5bcea1f4992ddc581b&event_collection=smartshop_events&filters=%5B%7B%22property_name%22%3A%22type%22%2C%22operator%22%3A%22eq%22%2C%22property_value%22%3A%22SEARCHRESPONSE%22%7D%5D&timezone=3600&group_by=search.query;'
		
	var diameter = 450,
	format = d3.format(",d"),
    color = d3.scale.category20c();
    
    var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);
    
    var svg = d3.select("#searchesByQuery").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");
	    
   d3.json(URL, function(error, root) {
	  var node = svg.selectAll(".node")
	      .data(bubble.nodes(classes(root.result))
	      .filter(function(d) { return d.className; }))
	    .enter().append("g")
	     .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }); 

	  node.append("title")
	      .text(function(d) { return d.className + ": " + format(d.value); });
	
	  node.append("circle")
	      .attr("r", function(d) { return d.r; })
	      .style("fill", function(d) { return color(d.className); });
	
	  node.append("text")
	      .attr("dy", ".3em")
	      .attr("font-size", "12px")
	      .style("text-anchor", "middle")
	      .text(function(d) {
	      	if (!d.className) {	      		
	      		return "";
	      	} else {
	      		return d.className.substring(0, d.r/3);
	      	} 
	      });  
	});
	
	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classes(root) {
	  var classes = [],
	  length = root.length;
	  
	  for (var i = 0; i < length; i++) {
	  	var element = root[i];
	  	classes.push({
	  		className: element['search.query'], 
	  		value: element['result']
	  	});	
	  }
	
	  return {children: classes};
	}

	d3.select(self.frameElement).style("height", diameter + "px");  
 }		

//------------- Searches by brand chart --------
function showSearchesByBrandChart() {
 	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "SEARCHRESPONSE"
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "brand.name",
		filters: keenFilter
	});
	
	client.draw(offers_count, document.getElementById("searchesByBrandChart"), {
		chartType: "barchart",
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

//------------- Offer favourites by brand chart --------
function showOfferFavouritesByBrandChart() {
	var deferred1 = $.Deferred();
 	var deferred2 = $.Deferred();
 	var deferred3 = $.Deferred();
 	var data = [];
 	
 	getOfferShownByBrand(deferred1);
	getOfferFavouritedByBrand(deferred2);
	getOfferPublishedByBrand(deferred3);
	
	$.when(deferred1, deferred2, deferred3).done(function(offersShownByBrand, offersFavouritedByBrand, offersPublishedByBrand){
		var length = offersPublishedByBrand.length;
		for (var i = 0; i < length; i++) {
			var entry = offersPublishedByBrand[i];
			var name = entry['offer.brand.name'];
			var offersShown = getOffersShownByName(name, offersShownByBrand);
			var offersFavourited = getOffersShownByName(name, offersFavouritedByBrand);
			data.push({
				name: name,
				impacto: offersShown == 0? 0 : offersFavourited / offersShown
			});
		}
		var chart = new Keen.Dataviz()
    				.el(document.getElementById('offersFavouritesByBrandChart'))
    				.parseRawData({ result: data })
    				.chartType("barchart")
    				.colors(null)
					.chartOptions( {
						is3D: true,
						legend: 'none',
						hAxis: {
							title: 'Impacto = ofertas favoritas / ofertas vistas'
						}	
					})
    				.render();
	});	
}

function getOfferFavouritedByBrand(deferred) {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERFAVOURITE"
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.name",
		filters: keenFilter
	});
	client.run(offers_count, function(err, res){
    	deferred.resolve(res.result);
    });
    return deferred.promise();
}


//------------- Offer shown by category chart --------
function showOfferShownByCategoryChart() {
 	var deferred1 = $.Deferred();
 	var deferred2 = $.Deferred();
 	var data = [];
 	
 	getOfferShownByCategory(deferred1);
	getOfferPublishedByCategory(deferred2);
	
	$.when(deferred1, deferred2).done(function(offersShownByCategory, offersPublishedByCategory){
		var length = offersPublishedByCategory.length;
		for (var i = 0; i < length; i++) {
			var entry = offersPublishedByCategory[i];
			var name = entry['offer.brand.category'];
			var offersPublished = entry['result'];
			var offersShown = getOffersShownByCategoryName(name, offersShownByCategory);
			data.push({
				name: name,
				impacto: offersShown / offersPublished
			});
		}
		var chart = new Keen.Dataviz()
    				.el(document.getElementById('offersShownByCategoryChart'))
    				.parseRawData({ result: data })
    				.chartType("barchart")
    				.colors(null)
					.chartOptions( {
						is3D: true,
						legend: 'none',
						hAxis: {
							title: 'Impacto = ofertas vistas / ofertas publicadas'
						}	
					})
    				.render();
	});
}

function getOffersShownByCategoryName(name, list) {
	var length = list.length;
	for (var i = 0; i < length; i++) {
		var entry = list[i];
		var entryName = entry['offer.brand.category'];
		if (entryName == name) {
			return entry['result'];
		}
	}
	return 0;
}

function getOfferPublishedByCategory(deferred) {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERPUBLISHED"
	});
	keenFilter.push({
		property_name: "offer.brand.category",
		operator: "exists",
		property_value: true
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.category",
		filters: keenFilter
	});
	client.run(offers_count, function(err, res){
    	deferred.resolve(res.result);
    });
    return deferred.promise();
}

function getOfferShownByCategory(deferred) {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERSHOWN"
	});
	keenFilter.push({
		property_name: "offer.brand.category",
		operator: "exists",
		property_value: true
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.category",
		filters: keenFilter
	});
	client.run(offers_count, function(err, res){
      	deferred.resolve(res.result);
    });
    return deferred.promise();
}

//------------- Offer shown by brand chart --------
function showOfferShownByBrandChart() {
 	var deferred1 = $.Deferred();
 	var deferred2 = $.Deferred();
 	var data = [];
 	
 	getOfferShownByBrand(deferred1);
	getOfferPublishedByBrand(deferred2);
	
	$.when(deferred1, deferred2).done(function(offersShownByBrand, offersPublishedByBrand){
		var length = offersPublishedByBrand.length;
		for (var i = 0; i < length; i++) {
			var entry = offersPublishedByBrand[i];
			var name = entry['offer.brand.name'];
			var offersPublished = entry['result'];
			var offersShown = getOffersShownByName(name, offersShownByBrand);
			data.push({
				name: name,
				impacto: offersShown / offersPublished
			});
		}
		var chart = new Keen.Dataviz()
    				.el(document.getElementById('offersShownByBrandChart'))
    				.parseRawData({ result: data })
    				.chartType("barchart")
    				.colors(null)
					.chartOptions( {
						is3D: true,
						legend: 'none',
						hAxis: {
							title: 'Impacto = ofertas vistas / ofertas publicadas'
						}	
					})
    				.render();
	});
}

function getOffersShownByName(name, list) {
	var length = list.length;
	for (var i = 0; i < length; i++) {
		var entry = list[i];
		var entryName = entry['offer.brand.name'];
		if (entryName == name) {
			return entry['result'];
		}
	}
	return 0;
}

function getOfferPublishedByBrand(deferred) {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERPUBLISHED"
	});
	keenFilter.push({
		property_name: "offer.brand.name",
		operator: "exists",
		property_value: true
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.name",
		filters: keenFilter
	});
	client.run(offers_count, function(err, res){
    	deferred.resolve(res.result);
    });
    return deferred.promise();
}

function getOfferShownByBrand(deferred) {
	var keenFilter = [];
	keenFilter.push({
		property_name: "type",
		operator: "eq",
		property_value: "OFFERSHOWN"
	});
	keenFilter.push({
		property_name: "offer.brand.name",
		operator: "exists",
		property_value: true
	});
	
	var offers_count = new Keen.Query("count", {
		eventCollection: "smartshop_events",
		groupBy: "offer.brand.name",
		filters: keenFilter
	});
	client.run(offers_count, function(err, res){
      	deferred.resolve(res.result);
    });
    return deferred.promise();
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
			end: "2014-11-01T00:00:00.000Z"
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
      	if (coord != null) {
      		heat.addLatLng(new L.LatLng(coord[1], coord[0]));	
      	}       
      });
    });
}

