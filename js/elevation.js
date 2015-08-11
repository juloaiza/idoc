var elevator;
var chart;
// Creating an empty Array
var route = [];
var ruler1, ruler2, ruler2label, rulerpoly;
var listener_ruler;
// Load the Visualization API and the columnchart package.
google.load('visualization', '1', {packages: ['corechart']});

function drawPath() {
  // Create a new chart in the elevation_chart DIV. AreaChar or Column Chart
  chart = new google.visualization.AreaChart(document.getElementById('elevation_chart'));

 // console.log(route);

  
  
  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  var pathRequest = {
    'path':  route,
    'samples': 256
  }

  // Initiate the path request.
  elevator.getElevationAlongPath(pathRequest, plotElevation);
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(results, status) {
  if (status != google.maps.ElevationStatus.OK) {
    return;
  }
  var elevations = results;

  // Extract the elevation samples from the returned results
  // and store them in an array of LatLngs.
  var elevationPath = [];
  for (var i = 0; i < results.length; i++) {
    elevationPath.push(elevations[i].location);
  }

  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sample');
  data.addColumn('number', 'Elevation');
  for (var i = 0; i < results.length; i++) {
    var elev = Math.round(elevations[i].elevation*100)/100;
    data.addRow(['', elev]);
  }

  // Draw the chart using the data within its DIV.
  document.getElementById('elevation_chart').style.display = 'block';
  chart.draw(data, {
    height: 250,
    legend: 'none',
    titleY: 'Elevation (m)'
  });
}


/**
 * Handles click events on a map, and adds a new point to the Polyline.
 * @param {google.maps.MouseEvent} event
 */
function addruler(event) {
 
        //reset after click
        remove_elevation(); 
        // No required
   //     var image = {
   //         url: 'images/circle.ico',
  //          anchor: new google.maps.Point(0, 0)
  //      };

            ruler1 = new google.maps.Marker({
            position: event.latLng ,
            map: map,
            icon: 'images/blank.png',

            draggable: false
        });

            ruler2 = new google.maps.Marker({
            position: event.latLng ,
            map: map,
            icon: 'images/position.png',
            crossOnDrag: false,
            anchorPoint: new google.maps.Point(0, 0),
            draggable: true
        });

        ruler2label = new Label({ map: map });

        ruler2label.bindTo('position', ruler2, 'position');

            rulerpoly = new google.maps.Polyline({
            path: [ruler1.position, ruler2.position] ,
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWeight: 2
        });
        rulerpoly.setMap(map);
        ruler2label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));

        google.maps.event.addListener(ruler2, 'drag', function() {
            rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
            ruler2label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
            route = [ruler1.getPosition(), ruler2.getPosition()];
            drawPath();
        });
    
}

// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.style.cssText = 'position: relative; left: 0%; top: -8px; ' +
			  'white-space: nowrap; border: 0px; font-family:arial; font-weight:bold;' +
			  'padding: 2px; background-color: #ddd; '+
				'opacity: .75; '+
				'filter: alpha(opacity=75); '+
				'-ms-filter: "alpha(opacity=75)"; '+
				'-khtml-opacity: .75; '+
				'-moz-opacity: .75;';

	var div = this.div_ = document.createElement('div');
	div.appendChild(span);
	div.style.cssText = 'position: absolute; display: none';
};
Label.prototype = new google.maps.OverlayView;

// Implement onAdd
Label.prototype.onAdd = function() {
	var pane = this.getPanes().overlayLayer;
	pane.appendChild(this.div_);

	
	// Ensures the label is redrawn if the text or position is changed.
	var me = this;
	this.listeners_ = [
		google.maps.event.addListener(this, 'position_changed',
		function() { me.draw(); }),
		google.maps.event.addListener(this, 'text_changed',
		function() { me.draw(); })
	];
	
};

// Implement onRemove
Label.prototype.onRemove = function() { this.div_.parentNode.removeChild(this.div_ );
	// Label is removed from the map, stop updating its position/text.
	for (var i = 0, I = this.listeners_.length; i < I; ++i) {
		google.maps.event.removeListener(this.listeners_[i]);
	}
};

// Implement draw
Label.prototype.draw = function() {
	var projection = this.getProjection();
	var position = projection.fromLatLngToDivPixel(this.get('position'));

	var div = this.div_;
	div.style.left = position.x + 'px';
	div.style.top = position.y + 'px';
	div.style.display = 'block';

	this.span_.innerHTML = this.get('text').toString();
};

function distance(lat1,lon1,lat2,lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
		Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	if (d>1) return Math.round(d)+"km";
	else if (d<=1) return Math.round(d*1000)+"m";
	return d;
}

function remove_elevation(action) {

if (ruler1) {
    ruler1.setMap(null);
    ruler2.setMap(null);
    ruler2label.setMap(null);
    rulerpoly.setMap(null);
 
}    
$('.contextmenu').remove();

if (action==0) {google.maps.event.removeListener(listener_ruler);}

}

   function  DrawElevation() {
  // Add a listener for the click event
//  
   if (listener_ruler) {
       google.maps.event.removeListener(listener_ruler);
       remove_elevation();
   }

   listener_ruler = google.maps.event.addListener(map, 'click', addruler);
      $('.contextmenu').remove();
   
   }
   
    function  rmvcontext() {

      $('.contextmenu').remove();
  
} 


