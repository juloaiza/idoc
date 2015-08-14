/* google maps -----------------------------------------------------*/
// Define map as global scope
var maptiler;
var map;
var cachedGeoJson;
var colorValues = ["#0099FF"/*0*/, "green"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/];
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
                fillOpacity:1,
                strokeWeight: 1,
                fillColor: color, //define dot color for kpi
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
                google.maps.event.addListener(siteDot, 'click', infoWindowShowFinally('site',[i,data]));

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
                strokeWeight: 1,
                fillColor: "#0099FF",
                fillOpacity:1,
                map: map
            });
            google.maps.event.addListener(secPoly, 'click', infoWindowShowFinally('sector',[i,data]));
        }
    });
}
function infoWindowShowFinally(type,passIn){
    return function(event) {
        if (!infowindow) {
            infowindow = new google.maps.InfoWindow();
        }
        var jSONURL;
        var infoSiteString;
        if(type=='site'){
            var content = '<div class="winfo">' + passIn[1].features[passIn[0]].properties.Site  +'<br/>VoLTE DCR = ' + passIn[1].features[passIn[0]].properties.KPI_2 + '</div>';
            infowindow.setContent(content);
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            jSONURL='php/kpi.php?lncel='+passIn[1].features[passIn[0]].properties.Site
        }
        if(type=='sector'){
            $.get("php/phyconf.php?lncel="+passIn[1].sector[passIn[0]].lncel_name,function(phyconf){
                var content = '<div class="winfo">' + passIn[1].sector[passIn[0]].site_name  +'<br/>Cell: ' + passIn[1].sector[passIn[0]].lncel_name + phyconf +'</div>';
                infowindow.setContent(content);
            });
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            $('#ltedropLine'+passIn[0]).sparkline();
            $('#iframett').html('<br><br><span class="blink_txt">Loading...</span>');
            $.get("php/tt.php?SiteID="+passIn[1].sector[passIn[0]].site_name,function(data) {     /*get function take the content of test.html
             put in variable 'data' inside the callback function*/
                $('#iframett').html(data);
            });
            $('#iframe_alarm').html('<br><br><span class="blink_txt">Loading...</span>');
            $.get("php/alarm.php?SiteID="+passIn[1].sector[passIn[0]].site_name,function(data) {     /*get function take the content of test.html
             put in variable 'data' inside the callback function*/
                $('#iframe_alarm').html(data);
            });
            jSONURL = "php/kpi.php?lncel="+passIn[1].sector[passIn[0]].lncel_name;
        }
        if (type == 'cluster'){
            var content = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;"> Cluster = '+
                event.feature.getId() +"<br/>Cluster Name = " + event.feature.getProperty("ClusterName") +"<br/>VoLTE DCR = " + event.feature.getProperty("KPI_2") + "</div>"
            infowindow.setContent(content);
            var anchor = new google.maps.MVCObject();
            anchor.set("position",event.latLng);
            infowindow.open(map,anchor);
            jSONURL = "php/kpi.php?lncel="+event.feature.getProperty("ClusterName");
        }
        $.getJSON(jSONURL,function(datak) {
            for (var g = 0; g < 26; g++){
                var ltekpif=$('#ltekpi'+g);
                ltekpif.html('<span class="inlinesparkline">Loading...</span>');
                ltekpif.html('<span class="inlinesparkline">'+datak.kpi[g+3].value+'</span>');
            }
            var cellLast = String(datak.kpi[1].value);
            var dateLast = String(datak.kpi[0].value);
            var cellLastsp = cellLast.split(",");
            var dateLastsp = dateLast.split(",");
            $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p>');
            if(type == 'sector'){$('.infoSite').html('<p>'+cellLastsp[cellLastsp.length - 1]+'</p>');}
            $('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
        });
    }
}
//get the legend container, create a legend, add a legend renderer fn, define css on general.css
function legend(leg_type) {
    var legendDiv = document.createElement('div');
    var innerHtml = '<div id="legend-container" style="z-index: 0; position: absolute; bottom: 14px; right: 0;"><h3>Legend</h3><div id="legend">';
    var legendTable = [];
    legendTable['rsrq'] = [['green','orange','red'],['0db to -10db','-10db to -16db','-16db to -30db'],'dB'];
    legendTable['rsrp'] = [['#0099FF','green','yellow','orange','red'],['-45dbm to -91dbm','-91dbm to -97dbm','-97dbm to -114dbm','-114dbm to -120dbm','-120dbm to -130dbm'],'dBm'];
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
    legendDiv.style.width = '240px';
    legendDiv.innerHTML = innerHtml;
    legendDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendDiv);
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
    layer.then(function(data){
        cachedGeoJson = data; //save the geojson in case we want to update its values
        features = map.data.addGeoJson(cachedGeoJson,{idPropertyName:"ClusterID"});  //idPropertyName identify with getId

    });

    if (listenerHandle) {
// if there is any identifier for this listener, remove it
        google.maps.event.removeListener(listenerHandle);
    }

//listen for click events
    listenerHandle =   map.data.addListener('click', infoWindowShowFinally('cluster',''));

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
    if (maptype!='pci') {
        legend(maptype);
    }
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
//Low band and SR Layer handler
function lowBandAndSR(type){
    var typeInfo = [];
    if (document.getElementById("check2").checked == true&&type=='L700') {
        typeInfo = ['add700','L700','12','SiteID','SiteName']
    }
    if (document.getElementById("check0").checked == true&&type=='srs') {
        typeInfo = ['addsrs','srs','11','Issue_Type','Technology','SR_Created_Date','Issue_Description','Mobile_Number']
    }
    if (document.getElementById("check2").checked == false&&type=='L700') {markerL700.clearMarkers();}
    if (document.getElementById("check0").checked == false&&type=='srs') {markerCluster.clearMarkers();}
    if (typeInfo.length!=0){
        $.getJSON('php/get_'+typeInfo[1]+'.php', function(data) {
            for (var i in data[typeInfo[1]]) {
                var content ='';
                if(typeInfo[1]=='L700'){content = '<div class="winfo">' + data[typeInfo[1]][i][typeInfo[3]]  +'<br/>' + data[typeInfo[1]][i][typeInfo[4]]  +'</div>';}
                if(typeInfo[1]=='srs'){content = '<div class="winfo">' + data[typeInfo[1]][i][typeInfo[4]]  +'<br/>SR Created Date = ' + data[typeInfo[1]][i][typeInfo[5]] +'<br/>Issue Type = ' + data[typeInfo[1]][i][typeInfo[3]]  + '<br/>Issue Description = ' + data[typeInfo[1]][i][typeInfo[6]]  +'<br/>Mobile Number = ' + data[typeInfo[1]][i][typeInfo[7]]  +'</div>';}
                var latLng = new google.maps.LatLng(data[typeInfo[1]][i]['Lat'], data[typeInfo[1]][i]['Log']);
                var marker = new google.maps.Marker({
                    position: latLng,
                    title: data[typeInfo[1]][i][typeInfo[3]],
                    icon : 'images/'+typeInfo[1]+'.png'
                });
                google.maps.event.addListener(marker, 'click', LowBandAndSRGetInfoWindow(i,marker,content));
                markers.push(marker);

            }
            var styles = [[{
                url: 'images/m'+typeInfo[1]+'.png',
                height: 50,
                width: 50,
                opt_anchor: [8, 0],
                opt_textColor: '#FF0000'
            }]];
            var mcOptions = {gridSize: 50, maxZoom: typeInfo[2], styles: styles[0]};
            if(typeInfo[1]=='srs'){markerCluster = new MarkerClusterer(map, markers,mcOptions);}
            if(typeInfo[1]=='L700'){markerL700 = new MarkerClusterer(map, markers,mcOptions);}
        });
    }
}
function LowBandAndSRGetInfoWindow(i,marker,content) {
    return function(){
        if (!infowindow) {
            infowindow = new google.maps.InfoWindow();
        }
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
}