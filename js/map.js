/* google maps -----------------------------------------------------*/
// Define map as global scope
var maptiler;
var map;
var cachedGeoJson;
var colorValues = ["#0099FF"/*0*/, "green"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/];
var colorPCC = ["#E20074"/*0*/,"#FF3B9E"/*1*/,"#FF73B9"/*2*/,"#848484"/*3*/,"#CECECE"/*4*/];
var mkt_loc = {
    Portland:[45.523062, -122.676482],
    Seattle:[47.6097, -122.331],
    Spokane:[47.658780, -117.426047],
    Phoenix:[33.448377, -112.074037]
};
//made a change
var cluster = $.getJSON("http://serfopt/webcontent/layers/Cluster.json");  //Add layers with JQUERY and using in options
var subcluster = $.getJSON("http://serfopt/webcontent/layers/SubCluster.json");  //Add layers and using in options
var features = null;
var listenerHandle; //Returns an identifier for this listener that can be used with google.maps.event.removeListener
var markers = []; // Used to group clusters check MarkerClusterer  also used to change icons markers.push(marker);
var siteDots = [];  // Used to modify polyg on the fly
var markerCluster; //Required to removed it when is required http://stackoverflow.com/questions/8229827/update-markercluster-after-removing-markers-from-array
var markerL700;
var bans = [];
var siteicon =[]; // Creating the icon. Using sprites Google_Maps_v3 pag 110
siteicon['antenna'] = doSiteIcon([[32,37],[0,0],[16,18]]);
siteicon['green'] = doSiteIcon([[18,37],[36,0],[9,18]]);
siteicon['orange'] = doSiteIcon([[18,37],[58,0],[9,18]]);
siteicon['red'] = doSiteIcon([[18,37],[80,0],[9,18]]);

function doSiteIcon(pts){
    new google.maps.MarkerImage(
        'images/sites.png',
        new google.maps.Size(pts[0][0], pts[0][1]), // The Size
        new google.maps.Point(pts[1][0], pts[1][1]), // The origin
        new google.maps.Point(pts[2][0], pts[2][1])  // The anchor
    );
}

function initialize() {
    /* position */
    var mkt = $('.market').html();
    var latlng = new google.maps.LatLng(mkt_loc[mkt][0],mkt_loc[mkt][1]);
    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 10, //8

//Control Options
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.BOTTOM,
            mapTypeIds: [

                google.maps.MapTypeId.TERRAIN,
                google.maps.MapTypeId.HYBRID
            ]
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.BOTTOM_LEFT
        },
        streetViewControl: true
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

// Add map menu
    navmenu();
// Load Sites
    sites();
// Load Sectors
    sectors(mkt);

// create a legend
//legend();
//  document.getElementById("put_geojson_string_here").value = cluster;

// Add a listener for the click event
    google.maps.event.addListener(map, "rightclick",function(event){showContextMenu(event.latLng);});

// Create an ElevationService.
    elevator = new google.maps.ElevationService();

    google.maps.event.addListener(map, 'idle', showBans);

// Load a GeoJSON from the same server as our demo.
//  map.data.loadGeoJson('http://serfopt/webcontent/layers/ban_test.json');
//map.data.setStyle({
// icon:{
//     path: google.maps.SymbolPath.CIRCLE,
//     scale: 2
//   }
//});

}

/*It adds a listener to the window object, which as soon as the load event is triggered 
 (i.e. "the page has finished loading") executes the function initialize.
 Another option define  html <body onload="initialize();"> */

google.maps.event.addDomListener(window, 'load', initialize);



/* end google maps -----------------------------------------------------*/

//Sites Layer
function sites(nkpi) {

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();

    if (nkpi == 'KPI_2') {
        legend();
    }
// getJson help me to read json file
    $.getJSON('http://serfopt/webcontent/layers/sites.json', function(data) {
        var i;
        for (i=0; i<data.features.length;i++) {
            var latLng = new google.maps.LatLng(data.features[i].properties.Lat,data.features[i].properties.Long);
            var kpi = data.features[i].properties.KPI_2;
            var color;
            var z = 1;
            var rad;
            if (nkpi == 'KPI_2') {
                if (kpi > 0.9){
                    color = colorValues[4];
                    rad = 40;
                    z = -1
                } else if (kpi <= 0.7){
                    color = colorValues[1];
                    rad = 10;
                } else {
                    color = colorValues[3];
                    rad = 20;
                }

            } else {
                color = '#0099FF';
                rad = 10;
            }

//Circle properties
            var pointOptions = {
                strokeColor: '#000000',
                strokeOpacity: 1,
                strokeWeight: 1,
                fillColor: color, //define dot color for kpi
                fillOpacity: 1,
                map: map,
                center: latLng,
                radius: rad,
                zIndex: 1
            };

            if (!nkpi) {   //  ! check null values
// Add the site dot on the map first time.
                siteDot = new google.maps.Circle(pointOptions);
                siteDots.push(siteDot); //iterate over this list and modify all of them:

// Creating a variable that will hold the InfoWindow object pag 95
                var infowindow;
// Wrapping the event listener inside an anonymous function pag92
                (function(i, siteDot) {

                    google.maps.event.addListener(siteDot, 'click', function(e) {

                        var content = '<div class="winfo">' + data.features[i].properties.Site  +'<br/>VoLTE DCR = ' + data.features[i].properties.KPI_2 + '</div>';

                        if (!infowindow) {  //Show only one infowindows
                            infowindow = new google.maps.InfoWindow();
                        }

// Setting the content of the InfoWindow
                        infowindow.setContent(content);
                        infowindow.setPosition(e.latLng);
                        infowindow.open(map);

//Charts
                        $.getJSON('php/kpi.php?lncel='+data.features[i].properties.Site,function(datak) {     /*get function with Json result
                         put in variable 'data' inside the callback function*/
                            for (var i = 0; i < 26; i++){
                                var ltekpi = $('#ltekpi'+i);
                                ltekpi.html('<span class="inlinesparkline">Loading...</span>');
                                ltekpi.html('<span class="inlinesparkline">'+datak.kpi[i+3].value+'</span>');
                            }

//Infocell
                            var cellLast = String(datak.kpi[1].value);
                            var dateLast = String(datak.kpi[0].value);

                            var cellLastsp = cellLast.split(",");
                            var dateLastsp = dateLast.split(",");

                            $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p">');
                            $('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
                        });
                    });
                })(i,siteDot);

            } else {
                siteDots[i].setOptions(pointOptions);
            }
        }
    });
}

function sectors(market) {
//alert('php/get_cellinfo.php?market='+market);
// getJson help me to read json file
    $.getJSON('php/get_cellinfo.php?market='+market, function(data) {
        for (var i in data.sector) {
            var centerPoint = new google.maps.LatLng(data.sector[i].Lat, data.sector[i].Log);
            var arcPts = circleMath(centerPoint,data.sector[i].azimuth, 75);
            var secPoly = new google.maps.Polygon({
                paths: [arcPts],
                strokeColor: "#000000",
                strokeOpacity: 1,
                strokeWeight: 1,
                fillColor: "#0099FF",
                fillOpacity: 1,
                map: map
            });

// Creating a variable that will hold the InfoWindow object pag 95
            var infowindow;
// Wrapping the event listener inside an anonymous function pag92
            (function(i, secPoly) {

                google.maps.event.addListener(secPoly, 'click', function(e) {
                    kpi = Math.round(10*Math.random());

                    if (!infowindow) {  //Show only one infowindows
                        infowindow = new google.maps.InfoWindow();
                    }

                    $.get("php/phyconf.php?lncel="+data.sector[i].lncel_name,function(phyconf){
                        var content = '<div class="winfo">' + data.sector[i].site_name  +'<br/>Cell: ' + data.sector[i].lncel_name + phyconf +'</div>';
                        infowindow.setContent(content);
                    });

// Replace the info window's content and position where was clicked.

                    infowindow.setPosition(e.latLng);
                    infowindow.open(map);

//Inline sparklines take their values from the contents of the tag
//       google.maps.event.addListener(infowindow, 'domready', function(event) {  //avoid click second time to run javascript inside

                    $('#ltedropLine'+i).sparkline();

                    $('#iframett').html('<br><br><span class="blink_txt">Loading...</span>');
                    $.get("php/tt.php?SiteID="+data.sector[i].site_name,function(data) {     /*get function take the content of test.html
                     put in variable 'data' inside the callback function*/
                        $('#iframett').html(data);
                    });

                    $('#iframe_alarm').html('<br><br><span class="blink_txt">Loading...</span>');
                    $.get("php/alarm.php?SiteID="+data.sector[i].site_name,function(data) {     /*get function take the content of test.html
                     put in variable 'data' inside the callback function*/
                        $('#iframe_alarm').html(data);
                    });

                    $.getJSON("php/kpi.php?lncel="+data.sector[i].lncel_name,function(datak) {     /*get function with Json result
                     put in variable 'data' inside the callback function*/
                        for (var i = 0; i < 26; i++){
// $('#ltekpi'+i).append('<span class="inlinesparkline">'+data+'</span>');
                            var ltekpif=$('#ltekpi'+i);
                            ltekpif.html('<span class="inlinesparkline">Loading...</span>');
                            ltekpif.html('<span class="inlinesparkline">'+datak.kpi[i+3].value+'</span>');
                        }

//Infocell
                        var cellLast = String(datak.kpi[1].value);
                        var dateLast = String(datak.kpi[0].value);

                        var cellLastsp = cellLast.split(",");
                        var dateLastsp = dateLast.split(",");

                        $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p>');
                        $('.infoSite').html('<p>'+cellLastsp[cellLastsp.length - 1]+'</p>');
// $('#ltekpi').html(data);
//  $('.inlinesparkline').sparkline('html',{width: '50px', height: '20px', lineWidth: 1});
                        $('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
                    });
//      }); //avoid click second time
// console.log(infowindow.content);
                });
            })(i,secPoly);


        }
    });
}
//get the legend container, create a legend, add a legend renderer fn, define css on general.css

function legend(leg_type) {
    var centerControlDiv = document.createElement('div');
    var innerHtml = '<div id="legend-container" style="z-index: 0; position: absolute; bottom: 14px; right: 0;"><h3>Legend</h3><div id="legend">';
    var legendTable = [];
    legendTable['rsrq'] = [['green','orange','red'],['0db to -10db','-10db to -16db','-16db to -30db'],'dB'];
    legendTable['rsrp'] = [['#0099FF','green','yellow','orange','red'],['-45dbm to -91dbm','-91dbm to -97dbm','-97dbm to -114dbm','-114dbm to -120dbm','-120dbm to -130dbm'],'dBm']
    legendTable['traffic'] = [['#0099FF','orange','red'],['Low','Medium','High'],'None'];
    legendTable['TMo_TechLTE_Map'] = [["#E20074","#FF3B9E","#FF73B9","#848484","#CECECE"],['LTE','WCDMA','UMTS','GSM','Roam'],'None'];
    legendTable['other'] = [['green','orange','red'],['Okay','Warning','Degraded'],'None'];
    if (leg_type=='rsrq'||leg_type=='rsrp'||leg_type=='traffic'||leg_type=='TMo_TechLTE_Map'){
        for(var j = 0;j<legendTable[leg_type][0].length;j++){
            innerHtml+='<div style="height:25px;"><div class="legend-color-box" style="background-color:'+legendTable[leg_type][0][j]+';"></div><span style="line-height: 23px;">'+legendTable[leg_type][1][j]+'</span></div>';
        }
    }
    else{
        for(var k = 0;k<legendTable['other'][0].length;k++){
            innerHtml+='<div style="height:25px;"><div class="legend-color-box" style="background-color:'+legendTable['other'][0][k]+';"></div><span style="line-height: 23px;">'+legendTable['other'][1][k]+'</span></div>';
        }
    }
    innerHtml+='</div></div>';
    centerControlDiv.style.width = '240px';
    centerControlDiv.innerHTML = innerHtml;
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
}

// Remove layer
function clearMap(){
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();

    if (!features)
        return;
    for (var i = 0; i < features.length; i++){
        map.data.remove(features[i]);
    }
}

//ShowCluster
function showFeature(layer, nkpi){
    clearMap();
    legend();
//console.log( style)
    layer.then(function(data){
        cachedGeoJson = data; //save the geojson in case we want to update its values
        features = map.data.addGeoJson(cachedGeoJson,{idPropertyName:"ClusterID"});  //idPropertyName identify with getId

    });

    if (listenerHandle) {
// if there is any identifier for this listener, remove it
        google.maps.event.removeListener(listenerHandle);
    }

    var infoWindow;

//listen for click events
    listenerHandle =   map.data.addListener('click', function(event) {
//show an infowindow on click
        if (!infoWindow) {
            infoWindow = new google.maps.InfoWindow({
                content: ""
            });
        }

        var content = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;"> Cluster = '+
            event.feature.getId() +"<br/>Cluster Name = " + event.feature.getProperty("ClusterName") +"<br/>VoLTE DCR = " + event.feature.getProperty("KPI_2") + "</div>"

        infoWindow.setContent(content);
        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);

        infoWindow.open(map,anchor);

//Charts
        $.getJSON("php/kpi.php?lncel="+event.feature.getProperty("ClusterName"),function(datak) {     /*get function with Json result
         put in variable 'data' inside the callback function*/
            for (var i = 0; i < 26; i++){
                ltekpi = $('#ltekpi'+i);
                ltekpi.html('<span class="inlinesparkline">Loading...</span>');
                ltekpi.html('<span class="inlinesparkline">'+datak.kpi[i+3].value+'</span>');
            }

//Infocell
            var cellLast = String(datak.kpi[1].value);
            var dateLast = String(datak.kpi[0].value);

            var cellLastsp = cellLast.split(",");
            var dateLastsp = dateLast.split(",");

            $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p">');
            $('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
        });
    });

//style functions
    var setColorStyleFn = function(feature) {
        var kpi = feature.getProperty(nkpi);
        var color;

        if (nkpi == 'KPI_2') {
            if (kpi > 0.6){
                color = colorValues[4];
            } else if (kpi <= 0.4){
                color = colorValues[1];
            } else {
                color = colorValues[3];
            }
        } else {
            if (kpi > 20){
                color = colorValues[4];
            } else if (kpi < 11){
                color = colorValues[1];
            } else {
                color = colorValues[3];
            }
        }

        return {
            fillColor: color,
            strokeWeight: 1
        };
    };

    map.data.setStyle(setColorStyleFn);

}

//Site KPI
function site_kpi(nkpi) {
    setAllMap(map,nkpi);

}

// Sets the map on all markers in the array. Source: https://developers.google.com/maps/documentation/javascript/examples/marker-remove
function setAllMap(map,nkpi) {
// getJson help me to read json file
    $.getJSON('http://serfopt/webcontent/layers/kpi.json', function(data) {

//  alert(data['LSE01001T'][nkpi]); //http://stackoverflow.com/questions/4968406/javascript-property-access-dot-notation-vs-brackets
        var kpi = 0;

        for (var i = 0; i < markers.length; i++) {
// console.log(i+ markers[i].title + kpi);
            try {
                kpi = data[markers[i].title][nkpi]; //site name & kpi from json
            }
            catch (e) {
                continue;
            }

            if (nkpi == 'KPI_2') {
                if (kpi > 0.6){
                    markers[i].setIcon(siteicon['red']);
                } else if (kpi < 0.4){
                    markers[i].setIcon(siteicon['green']);
                } else {
                    markers[i].setIcon(siteicon['orange']);
                }
            } else {
                if (kpi > 20){
                    markers[i].setIcon(siteicon['red']);
                } else if (kpi < 11){
                    markers[i].setIcon(siteicon['green']);
                } else {
                    markers[i].setIcon(siteicon['orange']);
                }
            }

//  console.log( kpi)
// markers[i].setMap(map);
        }
    });
}

function navmenu() {
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById("nav-menu"));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById("nav-sear"));
    map.controls[google.maps.ControlPosition.RIGHT].push(document.getElementById("btnsl"));
}

function mkt_kpi(mkt) {

    $.getJSON("php/kpi.php?lncel="+mkt,function(datak) {     /*get function with Json result
     put in variable 'data' inside the callback function*/
        for (var i = 0; i < 26; i++){
// $('#ltekpi'+i).append('<span class="inlinesparkline">'+data+'</span>');
            var ltekpi = $('#ltekpi'+i);
            ltekpi.html('<span class="inlinesparkline">Loading...</span>');
            ltekpi.html('<span class="inlinesparkline">'+datak.kpi[i+3].value+'</span>');
        }

//Infocell
        var cellLast = String(datak.kpi[1].value);
        var dateLast = String(datak.kpi[0].value);

        var cellLastsp = cellLast.split(",");
        var dateLastsp = dateLast.split(",");

        $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p">');

// $('#ltekpi').html(data);
//  $('.inlinesparkline').sparkline('html',{width: '50px', height: '20px', lineWidth: 1});
        $('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
    });

    mkt_center(mkt);

}

function mkt_center(mkt) {

    map.setCenter(new google.maps.LatLng(mkt_loc[mkt][0],mkt_loc[mkt][1]));
    map.setZoom(10);
    $('.market').html(mkt);

}

//TrueCall Layer with vector
function truecall_vector() {

// getJson help me to read json file
    $.getJSON('http://serfopt/webcontent/layers/truecall.json', function(data) {
        for (var i in data.point) {
            var latLng = new google.maps.LatLng( data.point[i].Y, data.point[i].X);
            var pointOptions = {
                strokeColor: '#FF0'+data.point[i].PCI,
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#FF0'+data.point[i].PCI,
                fillOpacity: 1,
                map: map,
                center: latLng,
                radius: 10
            };
// Add the circle for this city to the map.
            pointCircle = new google.maps.Circle(pointOptions);

        }

    });
}

function cleanlayer() {

    map.overlayMapTypes.clear();
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();

}
//TrueCall Layer with Layer
function truecall(maptype) {
    cleanlayer(); //Clean Layer
    var mkt =$('.market').html();
    if (maptype!='pci') {legend(maptype); }
    maptiler = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return "http://serfopt/webcontent/maps/" + mkt.toLowerCase() + "/" + maptype + "/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        opacity: 0.5
    });
    map.overlayMapTypes.insertAt(0, maptiler);
}

function clear_kpi() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null); // remove icons setMap(null);
    }
}

//Sites Layer
function srs() {

    var x = document.getElementById("check0").checked;
    markers.length = 0;
    if (x == true) {

// getJson help me to read json file
        $.getJSON('php/srs.php', function(data) {
//var markers = [];
            for (var i in data.srs) {
                var latLng = new google.maps.LatLng(data.srs[i].Lat, data.srs[i].Log);
                var marker = new google.maps.Marker({
                    position: latLng,
                    title: data.srs[i].Issue_Type,
                    icon : 'images/error.png'
                });
                markers.push(marker);

// Wrapping the event listener inside an anonymous function pag92
// that we immediately invoke and passes the variable i to.
                (function(i, marker) {

// Creating the event listener. It now has access to the values of
// i and marker as they were during its creation
                    google.maps.event.addListener(marker, 'click', function() {
                        kpi = Math.round(10*Math.random());
                        var content = '<div class="winfo">' + data.srs[i].Technology  +'<br/>SR Created Date = ' + data.srs[i].SR_Created_Date  +'<br/>Issue Type = ' + data.srs[i].Issue_Type  +
                            '<br/>Issue Description = ' + data.srs[i].Issue_Description  +'<br/>Mobile Number = ' + data.srs[i].Mobile_Number  +'</div>';

                        if (!infowindow) {  //Show only one infowindows
                            infowindow = new google.maps.InfoWindow();
                        }

// Setting the content of the InfoWindow
                        infowindow.setContent(content);
                        infowindow.open(map, marker);
                    });
                })(i, marker);
            }
// Adding the markers to the MarkerClusterer
            var styles = [[{
                url: 'images/m3.png',
                height: 50,
                width: 50,
                opt_anchor: [8, 0],
                opt_textColor: '#FF0000'
            }]];
//console.log(  styles[0])
            var mcOptions = {gridSize: 50, maxZoom: 11, styles: styles[0]};
//var mcOptions = {gridSize: 50, maxZoom: 12};
            markerCluster = new MarkerClusterer(map, markers,mcOptions);
        });

    }else{

        markerCluster.clearMarkers();
    }

}

function showBans() {
//Remove BANS and reset array
    for (var i = 0; i < bans.length; i++) {
        bans[i].setMap(null); // remove icons setMap(null);
    }
    bans.length = 0;

    var x = document.getElementById("check1").checked;

    if (x == true) {

        var bounds = map.getBounds();
        var NE = bounds.getNorthEast();
        var SW = bounds.getSouthWest();
        var zoom =  map.getZoom() ;

//  console.log(bounds+"-"+zoom);
// Call you server with ajax passing it the bounds

// In the ajax callback delete the current markers and add new markers

        if (zoom > 14) {
//console.log("php/ban.php?N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng());

//More detail way that $.getjson
            $.ajax({   //ajax take the content and put in data after done
                url:"php/ban.php?N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(),

// Whether this is a POST or GET request
                type: "GET",

// The type of data we expect back
                dataType : "json",

//  success: function () {
//    alert(" Done ! ");
//        },


// Error!
                error: function( xhr, status, errorThrown ) {
                    alert( "Sorry, there was a problem!" );
                    console.log( "Error: " + errorThrown );
                    console.log( "Status: " + status );
                    console.dir( xhr );
                }

            }).done(function(data){

                for (var i in data.ban) {
                    var latLng = new google.maps.LatLng(data.ban[i].lat,data.ban[i].lng);

//Circle properties
                    var pointOptions = {
                        strokeColor: '#000000',
                        strokeOpacity: 1,
                        strokeWeight: 0,
                        fillColor: '#F011DD', //define dot color for kpi
                        fillOpacity: 1,
                        map: map,
                        center: latLng,
                        radius: 5,
                        zIndex: 1
                    };
                    siteDot = new google.maps.Circle(pointOptions);
                    bans.push(siteDot);
                }
            });
        }
    }
}

//pcc Layer with Layer
function pcc(maptype) {
    cleanlayer(); //Clean Layer
    if (maptype!='pci') {legend(maptype); }
    maptiler = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return "http://maps.t-mobile.com/" + maptype + "/" + (zoom+1) + "/" + (coord.x+1) + ":" + (coord.y+1) + "/tile.png";
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        opacity: 0.8
    });
    map.overlayMapTypes.insertAt(0, maptiler);
}

function geolocation(address) {
// Create a function the will return the coordinates for the address
    var geocoder, marker, infowindow;
// var address = document.getElementById('seartxt').value;

// Check to see if we already have a geocoded object. If not we create one
    if(!geocoder) {
        geocoder = new google.maps.Geocoder();
    }
// Creating a GeocoderRequest object
    var geocoderRequest = {
        address: address
    };
// Making the Geocode request
    geocoder.geocode(geocoderRequest, function(results, status) {
// Check if status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
// Center the map on the returned location
            map.setCenter(results[0].geometry.location);
// Check to see if we've already got a Marker object
            if (!marker) {
// Creating a new marker and adding it to the map
                marker = new google.maps.Marker({
                    map: map
                });
            }
// Setting the position of the marker to the returned location
            marker.setPosition(results[0].geometry.location);
// Check to see if we've already got an InfoWindow object
            if (!infowindow) {
// Creating a new InfoWindow
                infowindow = new google.maps.InfoWindow();
            }
// Creating the content of the InfoWindow to the address
// and the returned position
            var content = '<strong>' + results[0].formatted_address + '</strong><br />';
            content += 'Lat: ' + results[0].geometry.location.lat() + '<br />';
            content += 'Lng: ' + results[0].geometry.location.lng();
// Adding the content to the InfoWindow
            infowindow.setContent(content);
// Opening the InfoWindow
            infowindow.open(map, marker);
        }
    });
}
//Search site and move map in its location
function moveCenter() {
    var site = document.getElementById('seartxt').value;
    $.ajax({   //ajax take the content and put in data after done
        url:'php/geo.php?site='+site.toUpperCase(),
        type: "GET", // Whether this is a POST or GET request
        dataType : "json",  // The type of data we expect back
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    }).done(function(data){
        if (!$.isEmptyObject(data)) {
            var newLatLng = new google.maps.LatLng(data.site[0].Lat,data.site[0].Log);
            map.setCenter(newLatLng);map.setZoom(18);
        } else {
            geolocation(site);
        }
    });
}
//Sites Layer 700
function L700() {
    markers.length = 0;
    if (document.getElementById("check2").checked == true) {
// getJson help me to read json file
        $.getJSON('php/get_L700.php', function(data) {
            for (var i in data.L700) {
                var latLng = new google.maps.LatLng(data.L700[i].Lat, data.L700[i].Log);
                var marker = new google.maps.Marker({
                    position: latLng,
                    title: data.L700[i].SiteID ,
                    icon : 'images/L700.png'
                });
                markers.push(marker);
// Wrapping the event listener inside an anonymous function pag92
// that we immediately invoke and passes the variable i to.
                (function(i, marker) {

// Creating the event listener. It now has access to the values of
// i and marker as they were during its creation
                    google.maps.event.addListener(marker, 'click', function() {
                        var content = '<div class="winfo">' + data.L700[i].SiteID  +'<br/>' + data.L700[i].SiteName  +'</div>';
                        if (!infowindow) {  //Show only one infowindows
                            infowindow = new google.maps.InfoWindow();
                        }
// Setting the content of the InfoWindow
                        infowindow.setContent(content);
                        infowindow.open(map, marker);
                    });
                })(i, marker);
            }
// Adding the markers to the MarkerClusterer
            var styles = [[{
                url: 'images/m4.png',
                height: 50,
                width: 50,
                opt_anchor: [8, 0],
                opt_textColor: '#FF0000'
            }]];
//console.log(  styles[0])
            var mcOptions = {gridSize: 50, maxZoom: 12, styles: styles[0]};
//var mcOptions = {gridSize: 50, maxZoom: 12};
            markerL700 = new MarkerClusterer(map, markers,mcOptions);
        });

    }else{

        markerL700.clearMarkers();
    }
}