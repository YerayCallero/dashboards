var client = new Keen({
  projectId: "5465e8423831440585aae8b9",
  readKey: "92091663f85279d2535672a51c1a6c3cfdfdf509940c0c8acb3514ab6a43c1389de2cee1c21d8713c10a8b96d81f033d8492b70e1166b0e909ee2876598cdf7cce8779cd374b0a6c755f3e83c7e9de293be834441692d3f577339cea3ae3b3b941e0b851db04cd5bcea1f4992ddc581b"
});

Keen.ready(function(){
   showOfferViewsRatioChart();
   showOfferFavouritedRatioChart();
   showOfferViewsPadtMonthRatioChart();
   showOffersViewByCategoryChart();
   showSearchesByQueryChart();
   showClientGenderChart();
   showClientAgeChart();
});

var brandID = 14;

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
	      		console.log('Problem with: ' + d);
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
	  	console.log ('Node: ' + element['search.query'] + ' - ' + element['result']);
	  	classes.push({
	  		className: element['search.query'], 
	  		value: element['result']
	  	});	
	  }
	
	  return {children: classes};
	}

	d3.select(self.frameElement).style("height", diameter + "px");  
 }		

//------------- Offer views past monthratio chart----------------------

function showOfferViewsPadtMonthRatioChart() {
	var deferred1 = new $.Deferred();
	var deferred2 = new $.Deferred();
	
	
	$.when(deferred1, deferred2).done(function (offersPublished, offersView) {		    		
		var chartContainer = $('#offerViewsPastMonthRatioChart');
		chartContainer.html(''+
			'<span class=\'keen-metric-title\'>' +
				'<b>' + offersView + '</b> ofertas vistas / <b>' + offersPublished + '</b> ofertas publicadas' +
			'</span>' 
		);
	});
	
	getOffersPublished(brandID, deferred1);
	getOffersViewPrevMonth(brandID, deferred2);
}


//------------- Offer shown by category chart --------------------

function showOffersViewByCategoryChart() {
	getBrandCategory().done(function(category) {
		var keenFilter = [];
    	keenFilter.push({
    		property_name: "offer.brand.category",
    		operator: "eq",
    		property_value: category
    	});
    	var brandsOfTheCategory = new Keen.Query("select_unique", {
    		eventCollection: "smartshop_events",
    		targetProperty: "offer.brand.id",
    		timeframe: {
				start: "2014-10-01T00:00:00.000Z",
				end: "2014-11-01T00:00:00.000Z"
			},
    		filters: keenFilter
    	});
    	
    	client.run(brandsOfTheCategory, function(err, res){ 
    		var deferred = new $.Deferred();
    		var offersViewedForBrand = 0;
    		var offersViewedForCategory = 0;
    		var deferreds = [];
			Keen.utils.each(res.result, function(brand){				
				var deferred2 = new $.Deferred();	
				
				deferreds.push(deferred2);

				$.when(deferred2).done(function (offersView) {	
					if (brand == brandID) {
						offersViewedForBrand += offersView;	
					}									
					offersViewedForCategory += offersView;
				});
			
				getOffersView(brand, deferred2);           			
       		});
       		$.when.apply($, deferreds).done(function(){
       			var chart = new Keen.Dataviz()
    				.el(document.getElementById('offerViewsRatioByCategoryChart'))
    				.parseRawData({ result: (offersViewedForBrand/offersViewedForCategory) * 100 })
    				.chartType("metric")
    				.chartOptions({
    					suffix: '%'
    				})
    				.colors(["#49c5b1"])
    				.title("Categor&iacute;a " + category)
    				.render();
       			});
    	});
	});
}

function getBrandCategory() {
	var deferred = $.Deferred();
	var keenFilter = [];
    keenFilter.push({
    	property_name: "offer.brand.id",
    	operator: "eq",
    	property_value: brandID
    });
	var brandCategory = new Keen.Query("select_unique", {
    	eventCollection: "smartshop_events",
    	targetProperty: "offer.brand.category",
    	filters: keenFilter
    });
    client.run(brandCategory, function(err, res){   
		deferred.resolve(res.result[0]);
    }); 
    
    return deferred.promise();
}

//------------- Offer favourites ratio chart----------------------

function showOfferFavouritedRatioChart() {
	var keenFilter = [];
    keenFilter.push({
    	property_name: "offer.brand.id",
    	operator: "eq",
    	property_value: brandID
    });
    keenFilter.push({
    	property_name: "type",
    	operator: "eq",
    	property_value: 'OFFERFAVOURITE'
    });
    
    var offersFavourited = new Keen.Query("count", {
    	eventCollection: "smartshop_events",
    	groupBy: "offer.name",
    	filters: keenFilter
    });
    
    client.draw(offersFavourited, document.getElementById("offerFavouritedRatioChart"), {
		chartType: "barchart",
		titlePosition: 'none',
		height: "auto",
		width: "auto",
		colors: null,
		chartOptions: {
			is3D: true,	
			legend: 'none',
			vAxis: {
				title: 'Nombre de ofertas'
			}					
		}
	}); 
    
}

//------------- Offer views ratio chart----------------------

function showOfferViewsRatioChart() {
	var deferred1 = new $.Deferred();
	var deferred2 = new $.Deferred();
	
	
	$.when(deferred1, deferred2).done(function (offersPublished, offersView) {		
    		var chartContainer = $('#offerViewsRatioChart');
    		chartContainer.html(''+
    			'<span class=\'keen-metric-title\'>' +
    				'<b>' + offersView + '</b> ofertas vistas / <b>' + offersPublished + '</b> ofertas publicadas' +
    			'</span>' 
    		);
	});
	
	getOffersPublished(brandID, deferred1);
	getOffersView(brandID, deferred2);
}

function getOffersPublished(brandID, deferred1) {
	var keenFilter = [];
    keenFilter.push({
    	property_name: "offer.brand.id",
    	operator: "eq",
    	property_value: brandID
    });
    keenFilter.push({
    	property_name: "type",
    	operator: "eq",
    	property_value: 'OFFERPUBLISHED'
    });
    
    var offersPublished = new Keen.Query("count", {
    	eventCollection: "smartshop_events",
    	filters: keenFilter
    });
    
    client.run(offersPublished, function(err, res){   
		deferred1.resolve(res.result);
    }); 
    
    return deferred1.promise();   
}

function getOffersView(brandID, deferred2) {
	var keenFilter = [];
    keenFilter.push({
    	property_name: "offer.brand.id",
    	operator: "eq",
    	property_value: brandID
    });
    keenFilter.push({
    	property_name: "type",
    	operator: "eq",
    	property_value: 'OFFERSHOWN'
    });
    
    var offersView = new Keen.Query("count", {
    	eventCollection: "smartshop_events",
    	timeframe: {
			start: "2014-10-01T00:00:00.000Z",
			end: "2014-11-01T00:00:00.000Z"
		},
    	filters: keenFilter
    });
    
    client.run(offersView, function(err, res){  	
		deferred2.resolve(res.result);
    }); 
    
    return deferred2.promise();   
}

function getOffersViewPrevMonth(brandID, deferred2) {
	var keenFilter = [];
    keenFilter.push({
    	property_name: "offer.brand.id",
    	operator: "eq",
    	property_value: brandID
    });
    keenFilter.push({
    	property_name: "type",
    	operator: "eq",
    	property_value: 'OFFERSHOWN'
    });
    
    var offersView = new Keen.Query("count", {
    	eventCollection: "smartshop_events",
    	timeframe: {
			start: "2014-09-01T00:00:00.000Z",
			end: "2014-10-01T00:00:00.000Z"
		},
    	filters: keenFilter
    });
    
    client.run(offersView, function(err, res){  	
		deferred2.resolve(res.result);
    }); 
    
    return deferred2.promise();   
}