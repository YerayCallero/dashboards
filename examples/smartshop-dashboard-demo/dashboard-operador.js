var client = new Keen({
  projectId: "5465e8423831440585aae8b9",
  readKey: "92091663f85279d2535672a51c1a6c3cfdfdf509940c0c8acb3514ab6a43c1389de2cee1c21d8713c10a8b96d81f033d8492b70e1166b0e909ee2876598cdf7cce8779cd374b0a6c755f3e83c7e9de293be834441692d3f577339cea3ae3b3b941e0b851db04cd5bcea1f4992ddc581b"
});

Keen.ready(function(){
   showOfferViewsRatioChart();
   showOfferFavouritedRatioChart();
   showOfferViewsPadtMonthRatioChart();
   showOffersViewByCategoryChart();
});

var brandID = 14;


//------------- Offer views past monthratio chart----------------------

function showOfferViewsPadtMonthRatioChart() {
	var deferred1 = new $.Deferred();
	var deferred2 = new $.Deferred();
	
	
	$.when(deferred1, deferred2).done(function (offersPublished, offersView) {
		var chart = new Keen.Dataviz()
    		.el(document.getElementById('offerViewsPastMonthRatioChart'))
    		.parseRawData({ result: offersView/offersPublished })
    		.chartType("metric")
    		.colors(["#49c5b1"])
    		.title(offersView + " ofertas vistas / " + offersPublished + " ofertas publicadas")
    		.render();
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
    		filters: keenFilter
    	});
    	
    	client.run(brandsOfTheCategory, function(err, res){ 
    		var deferred = new $.Deferred();
    		var brands = 0;
    		var combineRatio = 0;
    		var deferreds = [];
			Keen.utils.each(res.result, function(brand){
				var deferred1 = new $.Deferred();
				var deferred2 = new $.Deferred();	
				
				deferreds.push(deferred1);
				deferreds.push(deferred2);

				$.when(deferred1, deferred2).done(function (offersPublished, offersView) {					
					brands++;
					combineRatio += offersView/offersPublished;
				});
			
				getOffersPublished(brand, deferred1);
				getOffersView(brand, deferred2);           			
       		});
       		$.when.apply($, deferreds).done(function(){
       			var chart = new Keen.Dataviz()
    				.el(document.getElementById('offerViewsRatioByCategoryChart'))
    				.parseRawData({ result: combineRatio/brands })
    				.chartType("metric")
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
    	groupBy: "offer.id",
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
				title: 'ID de ofertas'
			}					
		}
	}); 
    
}

//------------- Offer views ratio chart----------------------

function showOfferViewsRatioChart() {
	var deferred1 = new $.Deferred();
	var deferred2 = new $.Deferred();
	
	
	$.when(deferred1, deferred2).done(function (offersPublished, offersView) {
		var chart = new Keen.Dataviz()
    		.el(document.getElementById('offerViewsRatioChart'))
    		.parseRawData({ result: offersView/offersPublished })
    		.chartType("metric")
    		.colors(["#49c5b1"])
    		.title(offersView + " ofertas vistas / " + offersPublished + " ofertas publicadas")
    		.render();
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