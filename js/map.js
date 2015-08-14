/* google maps -----------------------------------------------------*/
// Define map as global scope
var maptiler;
var map;
var cachedGeoJson;
var colorValues = ["#0099FF"/*0*/, "green"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/];
var mkt_loc = {Portland:[45.523062, -122.676482], Seattle:[47.6097, -122.331], Spokane:[47.658780, -117.426047], Phoenix:[33.448377, -112.074037]};
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
//calculates the region for the site color icons.
function doSiteIcon(pts){
    new google.maps.MarkerImage(
        'images/sites.png',
        new google.maps.Size(pts[0][0], pts[0][1]), // The Size
        new google.maps.Point(pts[1][0], pts[1][1]), // The origin
        new google.maps.Point(pts[2][0], pts[2][1])  // The anchor
    );
}
//Show the map add stuff to the map; all the stuff you'd expect be done on startup.
function initialize() {
    /* position */
    var mkt = $('.market').html();
    var latlng = new google.maps.LatLng(mkt_loc[mkt][0],mkt_loc[mkt][1]);
    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 10,
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
    navmenu();
    sites();
    sectors(mkt);
    google.maps.event.addListener(map, "rightclick",function(event){showContextMenu(event.latLng);});
    elevator = new google.maps.ElevationService();
    google.maps.event.addListener(map, 'idle', showBans);
}
//onload event listener
google.maps.event.addDomListener(window, 'load', initialize);
//Sites Layer
function sites(nkpi) {
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();
    if (nkpi == 'KPI_2') {
        legend();
    }
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
            var circleOptions = {
                strokeColor: '#000000',
                fillOpacity:1,
                strokeWeight: 1,
                fillColor: color,
                map: map,
                center: latLng,
                radius: rad,
                zIndex: 1
            };
            if (!nkpi) {//if there are no stie dots.
                siteDot = new google.maps.Circle(circleOptions);
                siteDots.push(siteDot); //iterate over this list and modify all of them:
                google.maps.event.addListener(siteDot, 'click', infoWindowSparklineShow('site',[i,data]));
            } else {
                siteDots[i].setOptions(circleOptions);
            }
        }
    });
}
//populates the sectors onto the map
function sectors(market) {
    $.getJSON('php/get_cellinfo.php?market='+market, function(data) {
        for (var i=0; i< data.sector.length; i++) {
            var centerPoint = new google.maps.LatLng(data.sector[i].Lat, data.sector[i].Log);
            var arcPts = circleMath(centerPoint,data.sector[i].azimuth, 75);
            var secPoly = new google.maps.Polygon({
                paths: arcPts,
                strokeColor: "#000000",
                strokeWeight: 1,
                fillColor: "#0099FF",
                fillOpacity:1,
                map: map
            });
            google.maps.event.addListener(secPoly, 'click', infoWindowSparklineShow('sector',[i,data]));
        }
    });
}
//Shows infowindows for site, sector, and clustor onclicks, then shows KPI sparklines for site, sector, clustor, and market onclicks.
function infoWindowSparklineShow(type,passIn){
    return function(event) {
        if (!infowindow) {
            infowindow = new google.maps.InfoWindow();
        }
        var jSONURL;
        var content;
        if(type=='site'){
            content = '<div class="winfo">' + passIn[1].features[passIn[0]].properties.Site  +'<br/>VoLTE DCR = ' + passIn[1].features[passIn[0]].properties.KPI_2 + '</div>';
            infowindow.setContent(content);
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            jSONURL='php/kpi.php?lncel='+passIn[1].features[passIn[0]].properties.Site
        }
        if(type=='sector'){
            $.get("php/phyconf.php?lncel="+passIn[1].sector[passIn[0]].lncel_name,function(phyconf){
                content = '<div class="winfo">' + passIn[1].sector[passIn[0]].site_name  +'<br/>Cell: ' + passIn[1].sector[passIn[0]].lncel_name + phyconf +'</div>';
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
            content = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;"> Cluster = '+
                event.feature.getId() +"<br/>Cluster Name = " + event.feature.getProperty("ClusterName") +"<br/>VoLTE DCR = " + event.feature.getProperty("KPI_2") + "</div>";
            infowindow.setContent(content);
            var anchor = new google.maps.MVCObject();
            anchor.set("position",event.latLng);
            infowindow.open(map,anchor);
            jSONURL = "php/kpi.php?lncel="+event.feature.getProperty("ClusterName");
        }
        if (type == 'market'){
            jSONURL = "php/kpi.php?lncel="+passIn;
            mkt_center(passIn);
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
//Removes the bottom right control and any features layer.
function clearMap(){
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();
    if (!features)
        return;
    for (var i = 0; i < features.length; i++){
        map.data.remove(features[i]);
    }
}
//shows the cluster view
function showFeature(layer, nkpi){
    clearMap();
    legend();
    layer.then(function(data){
        cachedGeoJson = data; //save the geojson in case we want to update its values
        features = map.data.addGeoJson(cachedGeoJson,{idPropertyName:"ClusterID"});  //idPropertyName identify with getId
    });
    if (listenerHandle) {
        google.maps.event.removeListener(listenerHandle);
    }
    listenerHandle =   map.data.addListener('click', infoWindowSparklineShow('cluster',''));
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
//Puts the navigation menus, search and right-side tray buttons on the map.
function navmenu() {
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById("nav-menu"));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById("nav-sear"));
    map.controls[google.maps.ControlPosition.RIGHT].push(document.getElementById("btnsl"));
}
//Centers the viewport on a market
function mkt_center(mkt) {
    map.setCenter(new google.maps.LatLng(mkt_loc[mkt][0],mkt_loc[mkt][1]));
    map.setZoom(10);
    $('.market').html(mkt);
}
//Cleans a Tile Overlay layer and removes any bottom right control (usually the legend)
function cleanlayer() {
    map.overlayMapTypes.clear();
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();
}
//Add any tiled layer
function tiledLayer(maptype,url,offset,opacity) {
    cleanlayer(); //Clean Layer
    legend(maptype);
    maptiler = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return url.replace('{x}',coord.x+offset).replace('{y}',coord.y+offset).replace('{z}',zoom+offset)
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        opacity: opacity
    });
    map.overlayMapTypes.insertAt(0, maptiler);
}
//Remove BANS, and adds BANS in the new viewport
function showBans() {

    for (var i = 0; i < bans.length; i++) {
        bans[i].setMap(null);
    }
    bans.length = 0;
    if (document.getElementById("check1").checked == true) {
        var bounds = map.getBounds();
        var NE = bounds.getNorthEast();
        var SW = bounds.getSouthWest();
        var zoom =  map.getZoom() ;
        if (zoom > 14) {
            $.ajax({   //ajax take the content and put in data after done
                url:"php/ban.php?N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(),
                type: "GET",
                dataType : "json",
                error: function( xhr, status, errorThrown ) {
                    alert( "Sorry, there was a problem!" );
                    console.log( "Error: " + errorThrown );
                    console.log( "Status: " + status );
                    console.dir( xhr );
                }
            }).done(function(data){

                for (var i=0; i< data.ban.length;i++) {
                    var latLng = new google.maps.LatLng(data.ban[i].lat,data.ban[i].lng);
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
//Geolocate an Address
function geolocation(address) {
    var geocoder, marker, infowindow;
    if(!geocoder) {
        geocoder = new google.maps.Geocoder();
    }
    var geocoderRequest = {
        address: address
    };
    geocoder.geocode(geocoderRequest, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            if (!marker) {
                marker = new google.maps.Marker({
                    map: map
                });
            }
            marker.setPosition(results[0].geometry.location);
            if (!infowindow) {
                infowindow = new google.maps.InfoWindow();
            }
            var content = '<strong>' + results[0].formatted_address + '</strong><br />';
            content += 'Lat: ' + results[0].geometry.location.lat() + '<br />';
            content += 'Lng: ' + results[0].geometry.location.lng();
            infowindow.setContent(content);
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
            for (var i=0; i< data[typeInfo[1]].length;i++) {
                var content ='';
                if(typeInfo[1]=='L700'){content = '<div class="winfo">' + data[typeInfo[1]][i][typeInfo[3]]  +'<br/>' + data[typeInfo[1]][i][typeInfo[4]]  +'</div>';}
                if(typeInfo[1]=='srs'){content = '<div class="winfo">' + data[typeInfo[1]][i][typeInfo[4]]  +'<br/>SR Created Date = ' + data[typeInfo[1]][i][typeInfo[5]] +'<br/>Issue Type = ' + data[typeInfo[1]][i][typeInfo[3]]  + '<br/>Issue Description = ' + data[typeInfo[1]][i][typeInfo[6]]  +'<br/>Mobile Number = ' + data[typeInfo[1]][i][typeInfo[7]]  +'</div>';}
                var latLng = new google.maps.LatLng(data[typeInfo[1]][i]['Lat'], data[typeInfo[1]][i]['Log']);
                var marker = new google.maps.Marker({
                    position: latLng,
                    title: data[typeInfo[1]][i][typeInfo[3]],
                    icon : 'images/'+typeInfo[1]+'.png'
                });
                google.maps.event.addListener(marker, 'click', LowBandAndSRGetInfoWindow(marker,content));
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
//Generates the infowindow for the 700 sites and SRs
function LowBandAndSRGetInfoWindow(marker,content) {
    return function(){
        if (!infowindow) {
            infowindow = new google.maps.InfoWindow();
        }
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
}