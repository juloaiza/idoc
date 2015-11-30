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
var sectorPolygons = [];
var secPolyTemp = [];
var siteicon =[]; // Creating the icon. Using sprites Google_Maps_v3 pag 110
var neighborLines = [];
var customPlotValue = '';
var csvPoints=[];
var verbs = ['Adusting','Launching','Transforming','Augmenting','Creating','Initiating','Indexing','Calibrating','Equipping','Building','Generating','Minimizing','Defining','Rendering','Allocating','Packaging'];
var nouns = ['John Legere\'s T-Shirt','Roaming Agreements','COWs','Shareholder Value','Equipment Ventors','Un-Carrier Moves','Sector Splits','Greenfield Candidates','Cost Overruns','UEs'];
var colors = ['Purple','RoyalBlue','SaddleBrown','SeaGreen','Orchid','SlateBlue'];
siteicon['antenna'] = doSiteIcon([[32,37],[0,0],[16,18]]);
siteicon['green'] = doSiteIcon([[18,37],[36,0],[9,18]]);
siteicon['orange'] = doSiteIcon([[18,37],[58,0],[9,18]]);
siteicon['red'] = doSiteIcon([[18,37],[80,0],[9,18]]);
var secSQL = [];
var colorPalette = ["green"/*0*/, "YellowGreen"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/, "Wheat"/*5*/, "Violet"/*6*/, "Turquoise"/*7*/, "#FF6347"/*8*/, "#4682B4"/*9*/, "#708090"/*10*/, "#C0C0C0"/*11*/, "#A0522D"/*12*/, "#F4A460"/*13*/, "#FA8072"/*14*/, "#BC8F8F"/*15*/];
//Humorous Loading Text
loadingText();
var loadTime = 0;
setInterval(loadingText, 1500);
function loadingText(){
    var loadingText = document.getElementById('loadingText');
    loadTime+=1;
    if(loadTime>19){
        loadingText.style.color = 'red';
        loadingText.innerHTML = 'This is taking longer than usual.<br/>Try reloading...';
    }
    else{
        loadingText.style.color = colors[Math.floor(Math.random()*5.999)];
        loadingText.innerHTML = verbs[Math.floor(Math.random()*15.999)] + " " + nouns[Math.floor(Math.random()*9.999)] + "...";
    }
}
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
 //   sites();
 //   sectors(mkt);
    google.maps.event.addListener(map, "rightclick",function(event){showContextMenu(event.latLng);});
    elevator = new google.maps.ElevationService();
    google.maps.event.addListener(map, 'idle', showBans);
    google.maps.event.addListener(map, 'tilesloaded',function(){
        document.getElementById('thingCover').style.visibility='hidden';
    });
    google.maps.event.addListener(map, 'idle', secDraw);
    document.getElementById("mktSea").addEventListener("click", infoWindowSparklineShow('market','Seattle'));
    document.getElementById("mktPdx").addEventListener("click", infoWindowSparklineShow('market','Portland'));
    document.getElementById("mktSpo").addEventListener("click", infoWindowSparklineShow('market','Spokane'));
    document.getElementById("mktPhx").addEventListener("click", infoWindowSparklineShow('market','Phoenix'));
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
        for (i=0; i<data['features'].length;i++) {
            var latLng = new google.maps.LatLng(data['features'][i].properties['Lat'],data['features'][i].properties['Long']);
            var kpi = data['features'][i].properties.KPI_2;
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
                color = '#FFFFFF';
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
                var siteDot = new google.maps.Circle(circleOptions);
                siteDots.push(siteDot); //iterate over this list and modify all of them:
                google.maps.event.addListener(siteDot, 'click', infoWindowSparklineShow('site',[i,data]));
            } else {
                siteDots[i].setOptions(circleOptions);
            }
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
            content = '<div class="winfo">' + passIn[1]['features'][passIn[0]]['properties']['Site']  +'<br/>VoLTE DCR = ' + passIn[1]['features'][passIn[0]]['properties']['KPI_2'] + '</div>';
            infowindow.setContent(content);
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            jSONURL='php/kpi.php?lncel='+passIn[1]['features'][passIn[0]]['properties']['Site']
        }
        if(type=='sector'){
            map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
            $.get("php/phyconf.php?lncel="+passIn[1]['sector'][passIn[0]]['lncel_name'],function(phyconf){
                content = '<div class="winfo">' + passIn[1]['sector'][passIn[0]]['site_name']  +'<br/>Cell: ' + passIn[1]['sector'][passIn[0]]['lncel_name'] + phyconf +'</div>';
                infowindow.setContent(content);
            });
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            $('#ltedropLine'+passIn[0]).sparkline();
            $('#iframett').html('<br><br><span class="blink_txt">Loading...</span>');
            $.get("php/tt.php?SiteID="+passIn[1]['sector'][passIn[0]]['site_name'],function(data) {     /*get function take the content of test.html
             put in variable 'data' inside the callback function*/
                $('#iframett').html(data);
            });
            $('#iframe_alarm').html('<br><br><span class="blink_txt">Loading...</span>');
            $.get("php/alarm.php?SiteID="+passIn[1]['sector'][passIn[0]]['site_name'],function(data) {     /*get function take the content of test.html
             put in variable 'data' inside the callback function*/
                $('#iframe_alarm').html(data);
            });
            jSONURL = "php/kpi_.php?lncel="+passIn[1]['sector'][passIn[0]]['lncel_name'];
            addShowNeighborsButton(passIn);
            for(var k=0;k<sectorPolygons.length;k++){
              //  changeSectorFormat(k,1.5,'#FFFFFF')
            }
            for(var j=0;j<sectorPolygons.length;j++){
                if(sectorPolygons[j][1]==sectorPolygons[passIn[0]][1]){
                 //   changeSectorFormat(j,4,'#FF0000')

                }
            }
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
            g=0;
            j=0;
            for (var prop in datak[0]){
                if (j > 1) {
                    var ltekpif=$('#ltekpi'+g);
                    ltekpif.html('<div class="inlinesparkline">Loading...</div> <div class="info_spk"></div>');
                    //ltekpif.html('<div class="info_spk"></div>');
                    field_ = '#ltekpi'+g+' '+'.inlinesparkline'
                    field2_ = '#ltekpi'+g+' '+'.info_spk'
                    $(field_)
                        .sparkline(
                            $.map(datak,function(kpi) { return kpi[prop]; }),
                            {width: '100px', height: '20px', disableTooltips: true}
                        );
                        
                        //Closures (check variable scope)
                        (function(field__,field2__,prop_){
                            $(field__).on("sparklineRegionChange", function(ev){
                                var idx = ev.sparklines[0].getCurrentRegionFields().offset;
                                if (idx) {
                                    $(field2__).html(
                                        "<h6> Date:" + moment(datak[idx].date).format('MM/DD')
                                        + "&nbsp;&nbsp;&nbsp; "
                                        + "KPI: " + datak[idx][prop_] + "</h6>");
                                }
                            });
                            $(field__).on("mouseout", function() {
                                $(field2__).html("&nbsp;");
                            });  
                        })(field_,field2_,prop);
                        


                        
                    g++;
                }
                j++;
                //console.log(datak[0][prop]);
            }
            
            
            
            console.log(datak[0].CellName);
            var cellLast = String(datak[1].value);
            var dateLast = String(datak[0].value);
            var cellLastsp = cellLast.split(",");
            var dateLastsp = dateLast.split(",");
            $('.infoCell').html('<p>'+cellLastsp[cellLastsp.length - 1]+'-'+dateLastsp[dateLastsp.length - 1]+'</p>');
            if(type == 'sector'){$('.infoSite').html('<p>'+cellLastsp[cellLastsp.length - 1]+'</p>');}
            //$('.inlinesparkline').sparkline('html',{width: '100px', height: '20px'});
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
    //noinspection JSUnusedGlobalSymbols
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

                for (var i=0; i< data['ban'].length;i++) {
                    var latLng = new google.maps.LatLng(data['ban'][i].lat,data['ban'][i].lng);
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
                    var siteDot = new google.maps.Circle(pointOptions);
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
        typeInfo = ['add700','L700','12','SiteID','SiteName'];
    }
    if (document.getElementById("check0").checked == true&&type=='srs') {
        typeInfo = ['addsrs','srs','11','Issue_Type','Technology','SR_Created_Date','Issue_Description','Mobile_Number'];
    }
    if (document.getElementById("check2").checked == false&&type=='L700') {
        markerL700.clearMarkers();
        markers=[];
    }
    if (document.getElementById("check0").checked == false&&type=='srs') {
        markerCluster.clearMarkers();
        markers=[];
    }
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
function LowBandAndSRGetInfoWindow(marker,content){
    return function(){
        if (!infowindow) {
            infowindow = new google.maps.InfoWindow();
        }
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
}

//Custom Plot
var lseven;
window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 72) {
        for(var i=0;i<sectorPolygons.length;i++){
            changeSectorFormat(i,1.5,'#FFFFFF')
        }
    }
    if (key == 67) {
       if(window.getComputedStyle(document.getElementById('textPlotCover')).getPropertyValue('visibility')!= 'visible') {
            showTextDialog();
       }
    }
    if (key == 55){
        lseven=true;
        if(window.getComputedStyle(document.getElementById('textPlotCover')).getPropertyValue('visibility')!= 'visible') {
            showTextDialog();
        }
    }
};

//populates the sectors onto the map
function secDraw() {
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var zoom=  map.getZoom() ;
    if (!$.isEmptyObject(secPolyTemp)) {
        for (i=0; i<secPolyTemp.length; i++) 
        {                           
          secPolyTemp[i].setMap(null); //or line[i].setVisible(false);
         // google.maps.event.removeListener(listener[i]);
        }
        secPolyTemp = [];
        sectorPolygons = [];
        secSQL = [];
    }
    if (zoom > 10) {
        var scale = 1
        if (zoom == 11) {
            scale = 6;
        } else if (zoom >= 12 && zoom <= 14 ) {
            scale = 4;
        } else if (zoom >= 15 && zoom <= 15 )  {
            scale = 2;
        }
        $.getJSON("php/sector.php?TECH=UMTS&N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(), function(data) {
            for (var i=0; i< data['sector'].length; i++) {
                var centerPoint = new google.maps.LatLng(data['sector'][i]['Lat'], data['sector'][i]['Log']);
                var cellname = data['sector'][i]['lncel_name'];
                var layer = cellname.substr(0,1)+cellname.substr(cellname.length-1);
                //console.log (layer);
                if (layer == 'P1') {
                    size = 1;
                    stack_= 1;
                } else if (layer == 'P2' )  {
                    size = 0.8;
                    stack_= 2;
                } else if (layer == 'U1' )  {
                    size = 0.6;
                    stack_= 3;
                } else if (layer == 'U2' )  {
                    size = 0.4;
                    stack_= 4;
                } else  {
                    size = 0.2;
                    stack_= 5;
                }
                var arcPts = circleMath(centerPoint,data['sector'][i].azimuth, 75,scale*size);
                //var pciTempArrayC = ["Name","BSE01649C11","BSE01649C21","BSE01649C31","BSE01676B11","BSE01676B21","BSE01676B31","BSE01726E11","BSE01726E21","BSE01726E31","BSE01729C11","BSE01729C21","BSE01729C31","BSE01731C11","BSE01731C21","BSE01731C31","BSE01734C11","BSE01734C21","BSE01734C31","BSE01742E11","BSE01742E21","BSE01742E31","BSE01744E11","BSE01744E21","BSE01744E31","BSE01748A11","BSE01748A21","BSE01748A31","BSE01758B11","BSE01758B21","BSE01758B31","BSE01794A11","BSE01794A21","BSE01794A31","BSE01870B11","BSE01870B21","BSE01870B31","BSE01872A11","BSE01872A21","BSE01872A31","BSE01873C11","BSE01873C21","BSE01873C31","BSE02199A11","BSE02199A21","BSE02199A31","BSE02860A11","BSE02860A21","BSE02860A31","BSE02866G11","BSE02866G21","BSE02866G31","BSE02867I11","BSE02867I21","BSE02867I31","BSE02872A11","BSE02872A21","BSE02872A31","BSE05027C11","BSE05027C21","BSE05027C31","BSE05060A11","BSE05060A21","BSE05060A31","BSE05083A11","BSE05083A21","BSE05083A31","BSE05102A11","BSE05102A21","BSE05102A31","BSE05103B11","BSE05103B21","BSE05103B31","BSE05105C11","BSE05105C21","BSE05105C31","BSE05107A11","BSE05107A21","BSE05107A31","BSE05109A11","BSE05109A21","BSE05109A31","BSE05112A11","BSE05112A21","BSE05112A31","BSE05113A11","BSE05113A21","BSE05113A41","BSE05116A11","BSE05116A21","BSE05116A31","BSE05118A11","BSE05118A21","BSE05118A31","BSE05144B11","BSE05144B21","BSE05144B31","BSE05147D11","BSE05147D21","BSE05147D31","BSE05165A11","BSE05165A21","BSE05165A31","BSE05166A11","BSE05166A21","BSE05166A31","BSE05167A11","BSE05167A21","BSE05167A31","BSE05167A41","BSE05172A11","BSE05172A21","BSE05172A31","BSE05173B11","BSE05173B21","BSE05173B31","BSE05173B41","BSE05198D11","BSE05198D21","BSE05198D31","BSE05300A11","BSE05300A21","BSE05300A31","BSE05301A11","BSE05301A21","BSE05301A31","BSE05302A11","BSE05302A21","BSE05302A31","BSE06024A11","BSE06024A21","BSE06024A31","BSE06044A11","BSE06044A21","BSE06044A31","BSE06055A11","BSE06055A21","BSE06055A31","BSE06056A11","BSE06056A21","BSE06056A31","BSE06062A11","BSE06062A21","BSE06062A31","BSE06101A11","BSE06101A21","BSE06101A31","BSE06103A11","BSE06103A21","BSE06103A31","BSE06103A41","BSE06104A11","BSE06104A21","BSE06104A31","BSE06104A41","BSE06105A11","BSE06105A21","BSE06105A31","BSE06110A11","BSE06110A21","BSE06110A31","BSE06123A11","BSE06123A21","BSE06123A31","BSE07001A11","BSE07001A21","BSE07001A31","BSE07005A11","BSE07005A21","BSE07005A31","BSE07005A41","BSE07008C11","BSE07008C21","BSE07008C31","BSE07015B11","BSE07015B21","BSE07015B31","BSE07022A11","BSE07022A21","BSE07022A31","BSE07026C11","BSE07026C21","BSE07026C31","BSE07028A11","BSE07028A21","BSE07028A31","BSE07036A11","BSE07036A21","BSE07036A31","BSE07041F11","BSE07041F21","BSE07041F31","BSE07042B11","BSE07042B21","BSE07042B31","BSE07051A11","BSE07051A21","BSE07051A31","BSE07068A11","BSE07068A21","BSE07068A31","BSE07080A11","BSE07080A21","BSE07080A31","BSE07086B11","BSE07086B21","BSE07086B31","BSE07088A11","BSE07088A21","BSE07088A31","BSE07089F11","BSE07089F21","BSE07089F31","BSE07108D11","BSE07108D21","BSE07109G11","BSE07109G21","BSE07109G31","BSE07111D11","BSE07111D21","BSE07111D31","BSE07121B11","BSE07121B21","BSE07121B31","BSE07122I11","BSE07122I21","BSE07122I31","BSE07123A11","BSE07123A21","BSE07123A31","BSE07126C11","BSE07126C21","BSE07126C31","BSE07141A11","BSE07141A21","BSE07141A31","BSE07144A11","BSE07144A21","BSE07144A31","BSE07150A11","BSE07150A21","BSE07150A31","BSE09002A11","BSE09002A21","BSE09002A31","BSE09026A11","BSE09026A21","BSE09026A31","LSE01001T11","LSE01001T21","LSE01001T31","LSE01002D11","LSE01002D21","LSE01002D31","LSE01005F11","LSE01005F21","LSE01005F31","LSE01006D11","LSE01006D21","LSE01006D31","LSE01008A11","LSE01008A21","LSE01008A31","LSE01010G11","LSE01010G21","LSE01010G31","LSE01015A11","LSE01015A21","LSE01015A31","LSE01017D11","LSE01017D21","LSE01017D31","LSE01101C11","LSE01101C21","LSE01101C31","LSE01102A11","LSE01102A21","LSE01102A31","LSE01103A11","LSE01103A21","LSE01103A31","LSE01105A11","LSE01105A21","LSE01105A31","LSE01106A11","LSE01106A21","LSE01106A31","LSE01107F11","LSE01107F21","LSE01107F31","LSE01108C11","LSE01108C21","LSE01108C31","LSE01109F11","LSE01109F21","LSE01109F31","LSE01110B11","LSE01110B21","LSE01110B31","LSE01111B11","LSE01111B21","LSE01111B31","LSE01112E11","LSE01112E21","LSE01112E31","LSE01115A11","LSE01115A21","LSE01115A31","LSE01120D11","LSE01120D21","LSE01120D31","LSE01121F11","LSE01121F21","LSE01121F31","LSE01123A11","LSE01123A21","LSE01123A31","LSE01124A11","LSE01124A21","LSE01124A31","LSE01125A11","LSE01125A21","LSE01125A31","LSE01126A11","LSE01126A21","LSE01126A31","LSE01130C11","LSE01130C21","LSE01130C31","LSE01139A11","LSE01139A21","LSE01139A31","LSE01141D11","LSE01141D21","LSE01141D31","LSE01142D11","LSE01142D21","LSE01142D31","LSE01147A11","LSE01147A21","LSE01147A31","LSE01200D11","LSE01200D21","LSE01200D31","LSE01201C11","LSE01201C21","LSE01201C31","LSE01202C11","LSE01202C21","LSE01202C31","LSE01204B11","LSE01204B21","LSE01204B31","LSE01205F11","LSE01205F21","LSE01205F31","LSE01206B11","LSE01206B21","LSE01206B31","LSE01207B11","LSE01207B21","LSE01208D11","LSE01208D21","LSE01208D31","LSE01210C11","LSE01210C21","LSE01210C31","LSE01211D11","LSE01211D21","LSE01211D31","LSE01212A11","LSE01212A21","LSE01212A31","LSE01213B11","LSE01213B21","LSE01213B31","LSE01215C11","LSE01215C21","LSE01215C31","LSE01216O11","LSE01216O21","LSE01216O31","LSE01217A11","LSE01217A31","LSE01217A41","LSE01225D11","LSE01225D21","LSE01225D31","LSE01227A11","LSE01261A11","LSE01261A21","LSE01261A31","LSE01302D11","LSE01302D21","LSE01302D31","LSE01303A11","LSE01303A21","LSE01303A31","LSE01304F11","LSE01304F21","LSE01304F31","LSE01400B11","LSE01400B21","LSE01400B31","LSE01401B11","LSE01401B21","LSE01401B31","LSE01402C11","LSE01402C21","LSE01402C31","LSE01406C11","LSE01406C21","LSE01406C31","LSE01407B11","LSE01407B21","LSE01407B31","LSE01408E11","LSE01408E21","LSE01408E31","LSE01409A11","LSE01409A21","LSE01409A31","LSE01410A11","LSE01410A21","LSE01410A31","LSE01411A11","LSE01411A21","LSE01411A31","LSE01412B11","LSE01412B21","LSE01413D11","LSE01413D21","LSE01414A11","LSE01414A21","LSE01414A31","LSE01416C11","LSE01416C21","LSE01416C31","LSE01418E11","LSE01418E21","LSE01418E31","LSE01419C11","LSE01419C21","LSE01419C31","LSE01422D11","LSE01422D21","LSE01422D31","LSE01506A11","LSE01506A21","LSE01506A31","LSE01507B11","LSE01507B21","LSE01507B31","LSE01508C11","LSE01508C21","LSE01508C31","LSE01509A11","LSE01509A21","LSE01509A31","LSE01510A11","LSE01510A21","LSE01510A31","LSE01511A11","LSE01511A21","LSE01511A31","LSE01513A11","LSE01513A21","LSE01513A31","LSE01514A11","LSE01514A21","LSE01514A31","LSE01515E11","LSE01515E21","LSE01515E31","LSE01518Q11","LSE01518Q21","LSE01518Q31","LSE01519H11","LSE01519H21","LSE01519H31","LSE01523A11","LSE01523A21","LSE01523A31","LSE01524I11","LSE01524I21","LSE01524I31","LSE01537C11","LSE01537C21","LSE01537C31","LSE01540F11","LSE01540F21","LSE01540F31","LSE01546B11","LSE01546B21","LSE01546B31","LSE01548D11","LSE01548D21","LSE01548D31","LSE01550A11","LSE01550A21","LSE01550A31","LSE01552A11","LSE01552A21","LSE01552A31","LSE01553E11","LSE01553E21","LSE01553E31","LSE01555I11","LSE01555I21","LSE01555I31","LSE01558E11","LSE01558E21","LSE01558E31","LSE01559C11","LSE01559C21","LSE01559C31","LSE01560C11","LSE01560C21","LSE01560C31","LSE01563A11","LSE01563A21","LSE01563A31","LSE01564F11","LSE01564F21","LSE01564F31","LSE01567D11","LSE01567D21","LSE01567D31","LSE01572A11","LSE01575A11","LSE01575A21","LSE01575A31","LSE01601B11","LSE01601B21","LSE01601B31","LSE01603A11","LSE01603A21","LSE01603A31","LSE01605A11","LSE01605A21","LSE01605A31","LSE01606E11","LSE01606E21","LSE01606E31","LSE01607B11","LSE01607B21","LSE01608E11","LSE01608E21","LSE01608E31","LSE01610C11","LSE01610C21","LSE01610C31","LSE01611C11","LSE01611C21","LSE01611C31","LSE01612A11","LSE01612A31","LSE01613E11","LSE01613E21","LSE01613E31","LSE01614E11","LSE01614E21","LSE01614E31","LSE01615E11","LSE01615E21","LSE01615E31","LSE01616B11","LSE01616B21","LSE01616B31","LSE01619D11","LSE01619D21","LSE01619D31","LSE01621B11","LSE01621B21","LSE01621B31","LSE01623A11","LSE01623A21","LSE01623A31","LSE01624D11","LSE01624D21","LSE01624D31","LSE01625H11","LSE01625H21","LSE01625H31","LSE01626B11","LSE01626B21","LSE01626B31","LSE01627B11","LSE01627B21","LSE01627B31","LSE01629B11","LSE01629B21","LSE01629B31","LSE01630E11","LSE01630E21","LSE01630E31","LSE01631C11","LSE01631C21","LSE01631C31","LSE01632A11","LSE01632A21","LSE01633I11","LSE01633I21","LSE01633I31","LSE01634E11","LSE01634E21","LSE01634E31","LSE01635A11","LSE01635A21","LSE01635A31","LSE01636D11","LSE01636D21","LSE01636D31","LSE01637G11","LSE01637G21","LSE01637G31","LSE01638E11","LSE01638E21","LSE01638E31","LSE01639E11","LSE01639E21","LSE01639E31","LSE01641A11","LSE01641A21","LSE01641A31","LSE01644A11","LSE01644A21","LSE01644A31","LSE01645B11","LSE01645B21","LSE01645B31","LSE01650D11","LSE01650D21","LSE01650D31","LSE01651A11","LSE01651A21","LSE01651A31","LSE01652A11","LSE01652A21","LSE01652A31","LSE01654B11","LSE01654B21","LSE01654B31","LSE01660A11","LSE01660A21","LSE01660A31","LSE01661C11","LSE01661C21","LSE01661C31","LSE01662E11","LSE01662E21","LSE01662E31","LSE01664B11","LSE01664B21","LSE01664B31","LSE01665A11","LSE01665A21","LSE01665A31","LSE01668A11","LSE01668A21","LSE01668A31","LSE01670E11","LSE01670E21","LSE01670E31","LSE01671G11","LSE01671G21","LSE01671G31","LSE01674B11","LSE01674B21","LSE01674B31","LSE01675A11","LSE01675A21","LSE01675A31","LSE01677A11","LSE01677A21","LSE01677A31","LSE01678B11","LSE01678B21","LSE01678B31","LSE01679A11","LSE01679A21","LSE01679A31","LSE01680D11","LSE01680D21","LSE01680D31","LSE01682B11","LSE01682B21","LSE01683F11","LSE01683F21","LSE01683F31","LSE01684A11","LSE01684A21","LSE01684A31","LSE01685B11","LSE01685B21","LSE01685B31","LSE01686A11","LSE01686A21","LSE01686A31","LSE01687C11","LSE01687C21","LSE01687C31","LSE01688A11","LSE01688A21","LSE01688A31","LSE01689A11","LSE01689A21","LSE01690A11","LSE01690A21","LSE01690A31","LSE01691A11","LSE01691A21","LSE01692B11","LSE01692B21","LSE01692B31","LSE01693B11","LSE01693B21","LSE01693B31","LSE01694A11","LSE01694A21","LSE01694A31","LSE01695H11","LSE01695H21","LSE01695H31","LSE01705E11","LSE01705E21","LSE01705E31","LSE01707A11","LSE01707A21","LSE01707A31","LSE01708F11","LSE01708F21","LSE01708F31","LSE01719D11","LSE01719D21","LSE01719D31","LSE01720A11","LSE01720A21","LSE01720A31","LSE01721A11","LSE01721A21","LSE01721A31","LSE01722B11","LSE01722B21","LSE01722B31","LSE01737C11","LSE01737C21","LSE01737C31","LSE01739H11","LSE01739H21","LSE01739H31","LSE01750A11","LSE01750A21","LSE01750A31","LSE01751B11","LSE01751B21","LSE01751B31","LSE01752A11","LSE01752A21","LSE01752A31","LSE01753C11","LSE01753C21","LSE01753C31","LSE01754C11","LSE01754C21","LSE01754C31","LSE01755A11","LSE01755A21","LSE01755A31","LSE01756B11","LSE01756B21","LSE01756B31","LSE01757A11","LSE01757A21","LSE01757A31","LSE01764B11","LSE01764B21","LSE01764B31","LSE01765A11","LSE01765A21","LSE01765A31","LSE01772C11","LSE01772C21","LSE01772C31","LSE01778D11","LSE01778D21","LSE01778D31","LSE01780A11","LSE01780A21","LSE01780A31","LSE01781F11","LSE01781F21","LSE01781F31","LSE01783A11","LSE01783A21","LSE01783A31","LSE01798A11","LSE01798A21","LSE01798A31","LSE01809F11","LSE01809F21","LSE01809F31","LSE01810E11","LSE01810E21","LSE01810E31","LSE01815A11","LSE01815A21","LSE01815A31","LSE01817A11","LSE01817A21","LSE01817A31","LSE01837B11","LSE01837B21","LSE01837B31","LSE01864A11","LSE01864A21","LSE01864A31","LSE01874D11","LSE01874D21","LSE01874D31","LSE01899A11","LSE01899A21","LSE01904A11","LSE01904A21","LSE01904A31","LSE01905A11","LSE01905A21","LSE01905A31","LSE01906A11","LSE01906A21","LSE01906A31","LSE01907B11","LSE01907B21","LSE01907B31","LSE01908D11","LSE01908D21","LSE01908D31","LSE01910A11","LSE01910A21","LSE01911A11","LSE01911A21","LSE01911A31","LSE01912A11","LSE01912A21","LSE01913F11","LSE01913F21","LSE01913F31","LSE01914A21","LSE01914A31","LSE01916A11","LSE01916A21","LSE01916A31","LSE01917A11","LSE01917A21","LSE01917A31","LSE01919C11","LSE01919C21","LSE01919C31","LSE01924G11","LSE01924G21","LSE01928F11","LSE01928F21","LSE01928F31","LSE01929A11","LSE01929A21","LSE01929A31","LSE01930A11","LSE01930A21","LSE01932B11","LSE01932B21","LSE01932B31","LSE01934D11","LSE01934D21","LSE01940A11","LSE01940A31","LSE01940A41","LSE01941A11","LSE01941A21","LSE01941A31","LSE01942A11","LSE02002E11","LSE02002E21","LSE02002E31","LSE02003G11","LSE02003G21","LSE02003G31","LSE02004B11","LSE02004B21","LSE02004B31","LSE02005A11","LSE02005A21","LSE02005A31","LSE02006A11","LSE02006A21","LSE02006A31","LSE02007A11","LSE02007A21","LSE02007A31","LSE02008C11","LSE02008C21","LSE02008C31","LSE02009A11","LSE02009A21","LSE02009A31","LSE02010C11","LSE02010C21","LSE02010C31","LSE02016B11","LSE02016B21","LSE02016B31","LSE02101A21","LSE02101A31","LSE02102C11","LSE02102C21","LSE02102C31","LSE02103B11","LSE02103B21","LSE02104A11","LSE02104A21","LSE02104A31","LSE02105A11","LSE02105A21","LSE02105A31","LSE02107B11","LSE02107B21","LSE02107B31","LSE02108E11","LSE02108E21","LSE02108E31","LSE02109A11","LSE02109A21","LSE02109A31","LSE02110F11","LSE02110F21","LSE02110F31","LSE02111B11","LSE02111B21","LSE02111B31","LSE02112J11","LSE02112J21","LSE02112J31","LSE02113E11","LSE02113E21","LSE02114A11","LSE02114A21","LSE02114A31","LSE02115A11","LSE02115A21","LSE02115A31","LSE02116A11","LSE02116A21","LSE02116A31","LSE02117A11","LSE02117A21","LSE02120D11","LSE02120D21","LSE02120D31","LSE02122C11","LSE02122C21","LSE02122C31","LSE02123A11","LSE02123A21","LSE02123A31","LSE02127G11","LSE02127G21","LSE02127G31","LSE02201C11","LSE02201C21","LSE02201C31","LSE02202A11","LSE02202A21","LSE02202A31","LSE02203I11","LSE02203I21","LSE02203I31","LSE02204A11","LSE02204A21","LSE02204A31","LSE02205A11","LSE02205A21","LSE02205A31","LSE02206A11","LSE02206A21","LSE02206A31","LSE02207A11","LSE02207A21","LSE02207A31","LSE02208D11","LSE02208D21","LSE02208D31","LSE02210A11","LSE02210A21","LSE02212A11","LSE02212A21","LSE02212A31","LSE02213B11","LSE02213B21","LSE02213B31","LSE02216C11","LSE02216C21","LSE02216C31","LSE02218E11","LSE02218E21","LSE02218E31","LSE02222I11","LSE02222I21","LSE02222I31","LSE02223H11","LSE02223H21","LSE02223H31","LSE02225A11","LSE02225A21","LSE02225A31","LSE02227D11","LSE02227D21","LSE02227D31","LSE02228K11","LSE02228K21","LSE02228K31","LSE02229J11","LSE02229J21","LSE02229J31","LSE02230B21","LSE02230B31","LSE02230B41","LSE02231A11","LSE02231A21","LSE02231A31","LSE02236A11","LSE02236A21","LSE02237A11","LSE02237A21","LSE02237A41","LSE02238A11","LSE02238A21","LSE02238A31","LSE02300G11","LSE02300G21","LSE02300G31","LSE02301A11","LSE02301A21","LSE02301A31","LSE02302C11","LSE02302C21","LSE02302C31","LSE02303C11","LSE02303C21","LSE02303C31","LSE02305F11","LSE02305F21","LSE02305F31","LSE02306D11","LSE02306D21","LSE02307D11","LSE02307D21","LSE02307D31","LSE02309A11","LSE02309A21","LSE02309A31","LSE02312D11","LSE02312D21","LSE02312D31","LSE02313A11","LSE02313A21","LSE02313A31","LSE02314K11","LSE02314K21","LSE02314K31","LSE02315A11","LSE02315A21","LSE02315A31","LSE02316A11","LSE02316A21","LSE02316A31","LSE02317B11","LSE02317B21","LSE02317B31","LSE02318A11","LSE02318A21","LSE02318A31","LSE02320F11","LSE02320F21","LSE02320F31","LSE02321B11","LSE02321B21","LSE02321B31","LSE02323A11","LSE02323A21","LSE02323A31","LSE02326A11","LSE02326A21","LSE02326A31","LSE02338E11","LSE02338E21","LSE02338E31","LSE02339D11","LSE02339D21","LSE02339D31","LSE02340A11","LSE02340A21","LSE02340A31","LSE02341A11","LSE02341A21","LSE02341A31","LSE02343A11","LSE02343A21","LSE02343A31","LSE02346A11","LSE02346A31","LSE02346A41","LSE02347D11","LSE02347D21","LSE02347D31","LSE02362A11","LSE02362A21","LSE02362A31","LSE02402C11","LSE02402C21","LSE02402C31","LSE02404B11","LSE02404B21","LSE02404B31","LSE02405B11","LSE02405B21","LSE02405B31","LSE02407A11","LSE02407A21","LSE02408C11","LSE02408C21","LSE02408C31","LSE02409D11","LSE02409D21","LSE02409D31","LSE02410C11","LSE02410C21","LSE02410C31","LSE02411A11","LSE02411A21","LSE02411A31","LSE02412A11","LSE02412A21","LSE02412A31","LSE02413P11","LSE02413P21","LSE02413P31","LSE02414B11","LSE02414B21","LSE02414B31","LSE02415B11","LSE02415B21","LSE02415B31","LSE02416B11","LSE02416B21","LSE02416B31","LSE02417D11","LSE02417D21","LSE02417D31","LSE02418A11","LSE02418A21","LSE02418A31","LSE02423D11","LSE02423D21","LSE02423D31","LSE02424A11","LSE02424A21","LSE02424A31","LSE02430A11","LSE02430A21","LSE02449A11","LSE02449A21","LSE02452A11","LSE02452A21","LSE02452A31","LSE02454A11","LSE02454A21","LSE02454A31","LSE02462A11","LSE02462A21","LSE02462A31","LSE02469A11","LSE02469A21","LSE02469A31","LSE02473A11","LSE02473A21","LSE02473A31","LSE02474E11","LSE02474E21","LSE02474E31","LSE02475D11","LSE02475D21","LSE02475D31","LSE02476A11","LSE02478B11","LSE02478B21","LSE02478B31","LSE02480A11","LSE02480A21","LSE02480A31","LSE02501A11","LSE02501A21","LSE02501A31","LSE02502D11","LSE02502D21","LSE02502D31","LSE02503A11","LSE02503A21","LSE02503A31","LSE02504D11","LSE02504D21","LSE02504D31","LSE02505C11","LSE02505C21","LSE02505C31","LSE02506H11","LSE02506H21","LSE02506H31","LSE02507A11","LSE02507A21","LSE02507A31","LSE02509A11","LSE02509A21","LSE02509A31","LSE02510A11","LSE02510A21","LSE02510A31","LSE02511G11","LSE02511G21","LSE02511G31","LSE02514E11","LSE02514E21","LSE02514E31","LSE02515A11","LSE02515A21","LSE02515A31","LSE02520C11","LSE02520C21","LSE02520C31","LSE02523A11","LSE02523A21","LSE02523A31","LSE02525A11","LSE02525A21","LSE02525A31","LSE02526B11","LSE02526B21","LSE02526B31","LSE02530A11","LSE02530A21","LSE02530A31","LSE02535C11","LSE02535C21","LSE02535C31","LSE02536I11","LSE02536I21","LSE02536I31","LSE02538B11","LSE02538B21","LSE02538B31","LSE02540B11","LSE02540B21","LSE02540B31","LSE02541A11","LSE02541A21","LSE02541A31","LSE02543D11","LSE02543D21","LSE02543D31","LSE02545A11","LSE02545A21","LSE02545A31","LSE02595A11","LSE02595A21","LSE02595A31","LSE02596A11","LSE02598A11","LSE02599A11","LSE02602A11","LSE02602A21","LSE02602A31","LSE02608C11","LSE02608C21","LSE02608C31","LSE02609A11","LSE02609A21","LSE02609A31","LSE02610A11","LSE02611A11","LSE02611A41","LSE02612A11","LSE02613E11","LSE02613E21","LSE02613E31","LSE02614A11","LSE02614A21","LSE02615A11","LSE02615A21","LSE02617A11","LSE02617A21","LSE02617A31","LSE02618A11","LSE02618A21","LSE02618A31","LSE02619D11","LSE02619D21","LSE02619D31","LSE02622A11","LSE02622A21","LSE02622A31","LSE02623E11","LSE02623E21","LSE02623E31","LSE02624D11","LSE02624D21","LSE02624D31","LSE02625B11","LSE02625B21","LSE02626C11","LSE02626C21","LSE02626C31","LSE02628D11","LSE02628D21","LSE02628D31","LSE02629A11","LSE02629A21","LSE02629A31","LSE02630B11","LSE02630B21","LSE02630B31","LSE02631A11","LSE02631A21","LSE02634M11","LSE02634M21","LSE02634M31","LSE02635G11","LSE02635G21","LSE02635G31","LSE02637B11","LSE02637B21","LSE02637B31","LSE02638A11","LSE02638A21","LSE02638A31","LSE02639E11","LSE02639E21","LSE02639E31","LSE02641K11","LSE02641K21","LSE02641K31","LSE02644F11","LSE02644F31","LSE02644F41","LSE02646A11","LSE02646A21","LSE02646A31","LSE02649A11","LSE02649A21","LSE02649A31","LSE02650D11","LSE02650D21","LSE02650D31","LSE02651A11","LSE02651A21","LSE02651A31","LSE02652A11","LSE02652A21","LSE02652A31","LSE02653C11","LSE02653C21","LSE02653C31","LSE02654C11","LSE02654C21","LSE02654C31","LSE02655A11","LSE02655A21","LSE02655A31","LSE02656A11","LSE02656A21","LSE02656A31","LSE02657E11","LSE02657E21","LSE02657E31","LSE02659C11","LSE02659C21","LSE02659C31","LSE02660C11","LSE02660C21","LSE02660C31","LSE02661D11","LSE02661D21","LSE02661D31","LSE02662A11","LSE02662A21","LSE02662A31","LSE02663D11","LSE02663D21","LSE02663D31","LSE02665A11","LSE02665A21","LSE02665A31","LSE02666A11","LSE02666A21","LSE02666A31","LSE02667D11","LSE02667D21","LSE02667D31","LSE02668A11","LSE02668A21","LSE02668A31","LSE02669D11","LSE02669D21","LSE02669D31","LSE02670A11","LSE02670A21","LSE02671A11","LSE02671A21","LSE02671A31","LSE02672A11","LSE02672A21","LSE02672A31","LSE02673A11","LSE02673A21","LSE02681B11","LSE02681B21","LSE02681B31","LSE02690B21","LSE02690B31","LSE02690B41","LSE02691C11","LSE02691C21","LSE02691C31","LSE02693A11","LSE02693A21","LSE02693A31","LSE02698A11","LSE02698A21","LSE02698A31","LSE02701A11","LSE02701A21","LSE02701A31","LSE02702A11","LSE02702A21","LSE02702A31","LSE02703E11","LSE02703E21","LSE02703E31","LSE02707B11","LSE02707B21","LSE02707B31","LSE02811B11","LSE02811B21","LSE02811B31","LSE02816A11","LSE02816A21","LSE02816A31","LSE02820G11","LSE02820G21","LSE02820G31","LSE02822A11","LSE02822A21","LSE02822A31","LSE02825C11","LSE02825C31","LSE02827C11","LSE02827C21","LSE02827C31","LSE02830B11","LSE02830B21","LSE02830B31","LSE02837A11","LSE02837A21","LSE02837A31","LSE02839A11","LSE02839A21","LSE02839A31","LSE02844A11","LSE02844A21","LSE02844A31","LSE02845A11","LSE02845A21","LSE02845A31","LSE02847D11","LSE02847D21","LSE02847D31","LSE02848A11","LSE02848A21","LSE02848A31","LSE02849C11","LSE02849C21","LSE02849C31","LSE02850C11","LSE02850C21","LSE02850C41","LSE02851A11","LSE02851A21","LSE02851A31","LSE02852C11","LSE02852C21","LSE02852C31","LSE02854A11","LSE02854A21","LSE02854A31","LSE02855B11","LSE02855B21","LSE02855B31","LSE02856B11","LSE02856B21","LSE02856B31","LSE02857C11","LSE02857C21","LSE02857C31","LSE02858C11","LSE02858C21","LSE02858C31","LSE02863A11","LSE02863A21","LSE02863A31","LSE02864D11","LSE02864D21","LSE02864D31","LSE02865D11","LSE02865D21","LSE02865D31","LSE02868A11","LSE02868A21","LSE02868A31","LSE02869A11","LSE02869A21","LSE02869A31","LSE02870A11","LSE02870A21","LSE02870A31","LSE02871A11","LSE02871A21","LSE02871A31","LSE02878B11","LSE02878B21","LSE02878B31","LSE02881A11","LSE02881A21","LSE02881A31","LSE02882D11","LSE02882D21","LSE02882D31","LSE02884A11","LSE02884A21","LSE02884A31","LSE02885D11","LSE02885D21","LSE02885D31","LSE02886I11","LSE02886I21","LSE02886I31","LSE02898A11","LSE02898A21","LSE02898A31","LSE03001A11","LSE03001A21","LSE03001A31","LSE03002A11","LSE03002A21","LSE03003D11","LSE03003D21","LSE03004E11","LSE03004E21","LSE03004E31","LSE03005D11","LSE03005D21","LSE03005D31","LSE03007A11","LSE03007A21","LSE03007A31","LSE03008D11","LSE03008D21","LSE03009A11","LSE03009A21","LSE03009A31","LSE03011A11","LSE03011A21","LSE03011A31","LSE03012F11","LSE03012F21","LSE03012F31","LSE03020G11","LSE03020G21","LSE03020G31","LSE03021I11","LSE03021I21","LSE03021I31","LSE03022B11","LSE03022B21","LSE03023A11","LSE03023A21","LSE03023A31","LSE03024B11","LSE03024B21","LSE03024B31","LSE03025A11","LSE03025A21","LSE03027C11","LSE03027C21","LSE03027C31","LSE03028A11","LSE03028A21","LSE03028A31","LSE03031A11","LSE03031A21","LSE03031A31","LSE03032A11","LSE03032A21","LSE03032A31","LSE03033A11","LSE03033A21","LSE03033A31","LSE03034E11","LSE03034E21","LSE03034E31","LSE03035B11","LSE03035B21","LSE03035B31","LSE03037H11","LSE03037H21","LSE03037H31","LSE03101A11","LSE03101A21","LSE03105A11","LSE03105A21","LSE03105A31","LSE03110A11","LSE03110A21","LSE03110A31","LSE03112C11","LSE03112C21","LSE03112C31","LSE03120E11","LSE03120E21","LSE03120E31","LSE03130A11","LSE03130A21","LSE03130A31","LSE03201D11","LSE03201D21","LSE03201D41","LSE03202I11","LSE03202I21","LSE03202I31","LSE03207E11","LSE03207E21","LSE03207E31","LSE03208A11","LSE03208A21","LSE03208A31","LSE03209A11","LSE03209A21","LSE03209A31","LSE03210A11","LSE03210A21","LSE03210A31","LSE03224A11","LSE03224A21","LSE03224A31","LSE03225G11","LSE03225G21","LSE03225G31","LSE03302E11","LSE03302E21","LSE03302E31","LSE03304D11","LSE03304D21","LSE03304D31","LSE03307B11","LSE03307B21","LSE03307B31","LSE03308C11","LSE03308C21","LSE03308C31","LSE03309A11","LSE03309A21","LSE03309A31","LSE03310A11","LSE03310A21","LSE03311A11","LSE03311A21","LSE03311A31","LSE03312B11","LSE03312B31","LSE03314B11","LSE03314B21","LSE03315B11","LSE03315B21","LSE03315B31","LSE03316A11","LSE03316A21","LSE03316A31","LSE03325C11","LSE03325C21","LSE03325C31","LSE03328A11","LSE03328A21","LSE03328A31","LSE03329D11","LSE03329D21","LSE03329D31","LSE03333A11","LSE03333A21","LSE03333A31","LSE03340A11","LSE03340A21","LSE03340A31","LSE03341B11","LSE03341B21","LSE03341B31","LSE03343B11","LSE03343B21","LSE03343B31","LSE03401B11","LSE03401B21","LSE03401B31","LSE03404F11","LSE03404F21","LSE03404F31","LSE03408A11","LSE03408A21","LSE03408A31","LSE03409C11","LSE03409C21","LSE03409C31","LSE03411A11","LSE03411A21","LSE03411A31","LSE03422B11","LSE03422B21","LSE03422B31","LSE03440A11","LSE03440A21","LSE03440A31","LSE03481A11","LSE03481A21","LSE03481A31","LSE03482A11","LSE03482A21","LSE03482A31","LSE03483A11","LSE03483A21","LSE03483A31","LSE03496A11","LSE03496A21","LSE03496A31","LSE03496A41","LSE03497A11","LSE03497A21","LSE03497A31","LSE03497A41","LSE03501B11","LSE03501B21","LSE03501B31","LSE03502E11","LSE03502E21","LSE03502E31","LSE03503A11","LSE03503A21","LSE03503A31","LSE03504A11","LSE03504A21","LSE03504A31","LSE03506E11","LSE03506E21","LSE03506E31","LSE03507A11","LSE03507A21","LSE03507A31","LSE03508A11","LSE03508A21","LSE03509A11","LSE03509A21","LSE03509A31","LSE03513G11","LSE03513G21","LSE03513G31","LSE03514A11","LSE03514A21","LSE03514A31","LSE03515D11","LSE03515D21","LSE03515D31","LSE03516C11","LSE03516C21","LSE03516C31","LSE03517A11","LSE03517A21","LSE03517A31","LSE03518A11","LSE03518A21","LSE03518A31","LSE03519D11","LSE03519D21","LSE03519D31","LSE03520B11","LSE03520B21","LSE03520B31","LSE03521A11","LSE03521A21","LSE03521A31","LSE03524A11","LSE03524A21","LSE03524A31","LSE03530C11","LSE03530C21","LSE03530C31","LSE03532B11","LSE03532B21","LSE03532B31","LSE03533A11","LSE03533A21","LSE03535D11","LSE03535D21","LSE03535D31","LSE03536A11","LSE03537E11","LSE03537E21","LSE03537E31","LSE03538A11","LSE03538A21","LSE03539F11","LSE03539F21","LSE03539F31","LSE03540A11","LSE03540A21","LSE03540A31","LSE03541G11","LSE03541G21","LSE03541G31","LSE03542B11","LSE03542B21","LSE03544D11","LSE03544D21","LSE03544D31","LSE03545A11","LSE03545A21","LSE03545A31","LSE03547C11","LSE03547C21","LSE03547C31","LSE03548A11","LSE03548A21","LSE03548A31","LSE03549D11","LSE03549D21","LSE03549D31","LSE03550A11","LSE03550A21","LSE03550A31","LSE03551C11","LSE03551C21","LSE03552A11","LSE03552A21","LSE03552A31","LSE03553B11","LSE03553B21","LSE03553B31","LSE03555I11","LSE03555I21","LSE03555I31","LSE03556D11","LSE03556D21","LSE03556D31","LSE03558G11","LSE03558G21","LSE03558G31","LSE03559F11","LSE03559F21","LSE03559F31","LSE03560G11","LSE03560G21","LSE03560G31","LSE03561A11","LSE03561A21","LSE03561A31","LSE03562B11","LSE03562B21","LSE03562B31","LSE03563D11","LSE03563D21","LSE03563D31","LSE03564G11","LSE03564G21","LSE03564G31","LSE03568A11","LSE03568A21","LSE03568A31","LSE03570A11","LSE03570A21","LSE03570A31","LSE03573C11","LSE03573C21","LSE03573C31","LSE03574B11","LSE03574B21","LSE03574B31","LSE03577D11","LSE03577D21","LSE03577D31","LSE03579C11","LSE03579C21","LSE03579C31","LSE03580A11","LSE03580A21","LSE03580A31","LSE03582B11","LSE03582B21","LSE03582B31","LSE03584A11","LSE03584A21","LSE03584A31","LSE03585C11","LSE03585C21","LSE03585C31","LSE03587A11","LSE03587A21","LSE03587A31","LSE03591B11","LSE03591B21","LSE03591B31","LSE03592C11","LSE03592C21","LSE03592C31","LSE03593A11","LSE03593A21","LSE03593A31","LSE03594C11","LSE03594C21","LSE03594C31","LSE03612D11","LSE03612D21","LSE03612D31","LSE03616C11","LSE03616C21","LSE03616C31","LSE03623A11","LSE03623A21","LSE03623A31","LSE03626A11","LSE03626A21","LSE03626A31","LSE03702D11","LSE03702D21","LSE03702D31","LSE03824A11","LSE03824A21","LSE03825E11","LSE03825E21","LSE03825E31","LSE03832K11","LSE03832K21","LSE03832K31","LSE03833D11","LSE03833D21","LSE03833D31","LSE03834B11","LSE03834B21","LSE03834B31","LSE03835A11","LSE03835A21","LSE03835A31","LSE03837A11","LSE03837A21","LSE03837A31","LSE03838C21","LSE03838C31","LSE03838C41","LSE03839A11","LSE03839A21","LSE03840D11","LSE03840D21","LSE03840D31","LSE03841B11","LSE03842A11","LSE03842A21","LSE03842A31","LSE03843D11","LSE03843D21","LSE03843D31","LSE03844C11","LSE03844C21","LSE03844C31","LSE03844C41","LSE03845A11","LSE03845A21","LSE03845A31","LSE03846D11","LSE03846D21","LSE03846D31","LSE03847E11","LSE03847E21","LSE03847E31","LSE03848A11","LSE03848A21","LSE03849A11","LSE03849A21","LSE03849A31","LSE03849A41","LSE03850D11","LSE03850D21","LSE03850D31","LSE03851A11","LSE03851A21","LSE03851A31","LSE03852D11","LSE03852D21","LSE03852D31","LSE03853D11","LSE03853D21","LSE03854A11","LSE03854A21","LSE03854A31","LSE03855B11","LSE03855B21","LSE03855B31","LSE03856A11","LSE03856A21","LSE03856A31","LSE03857E11","LSE03857E21","LSE03858A11","LSE03858A21","LSE03859C11","LSE03859C21","LSE03859C31","LSE03860B11","LSE03860B21","LSE03860B31","LSE03863D11","LSE03863D21","LSE03863D31","LSE03864C11","LSE03864C21","LSE03864C31","LSE03865B11","LSE03865B21","LSE03865B31","LSE03866A11","LSE03866A21","LSE03866A31","LSE03867C11","LSE03867C21","LSE03867C31","LSE03868A11","LSE03868A21","LSE03868A31","LSE03870G11","LSE03870G21","LSE03870G31","LSE03871D11","LSE03871D21","LSE03871D31","LSE03872A11","LSE03872A21","LSE03872A31","LSE03873E11","LSE03873E21","LSE03878A11","LSE03878A21","LSE03878A31","LSE03880A11","LSE03880A21","LSE03880A31","LSE03886B11","LSE03886B21","LSE03886B31","LSE03887B11","LSE03887B21","LSE03887B31","LSE03891A11","LSE03891A21","LSE03891A31","LSE03893A11","LSE03893A21","LSE03893A31","LSE03898A11","LSE03898A21","LSE03940A11","LSE03940A21","LSE03940A31","LSE03943B11","LSE03943B21","LSE03943B31","LSE03950D11","LSE03950D21","LSE03950D31","LSE03956A11","LSE03956A21","LSE03956A31","LSE03999A11","LSE03999A21","LSE03999A31","LSE04000B11","LSE04000B21","LSE04000B31","LSE04001A11","LSE04001A21","LSE04001A31","LSE04002A11","LSE04002A21","LSE04002A31","LSE04003A11","LSE04003A21","LSE04003A31","LSE04006B11","LSE04006B21","LSE04006B31","LSE04007D11","LSE04007D21","LSE04007D31","LSE04008B11","LSE04008B21","LSE04008B31","LSE04009A11","LSE04009A21","LSE04009A31","LSE04010E11","LSE04010E21","LSE04010E31","LSE04013E11","LSE04013E21","LSE04013E31","LSE04014C11","LSE04014C21","LSE04014C31","LSE04015C11","LSE04015C21","LSE04015C31","LSE04017D11","LSE04017D21","LSE04017D31","LSE04018A11","LSE04018A21","LSE04018A31","LSE04019C11","LSE04019C21","LSE04019C31","LSE04020D11","LSE04020D21","LSE04020D31","LSE04022I11","LSE04022I21","LSE04022I31","LSE04024A11","LSE04024A21","LSE04024A31","LSE04027A11","LSE04027A21","LSE04027A31","LSE04028B11","LSE04028B21","LSE04028B31","LSE04029E11","LSE04029E21","LSE04029E31","LSE04032B11","LSE04032B21","LSE04032B31","LSE04033A11","LSE04033A21","LSE04033A31","LSE04034C11","LSE04034C21","LSE04034C31","LSE04035A11","LSE04035A21","LSE04035A31","LSE04036D11","LSE04036D21","LSE04036D31","LSE04037A11","LSE04037A21","LSE04037A31","LSE04039C11","LSE04039C21","LSE04041A11","LSE04042A11","LSE04042A21","LSE04042A31","LSE04046P11","LSE04046P21","LSE04046P31","LSE04050A11","LSE04050A21","LSE04050A31","LSE04051A11","LSE04051A21","LSE04051A31","LSE04053A11","LSE04053A21","LSE04053A31","LSE04061B11","LSE04061B21","LSE04061B31","LSE04099F11","LSE04099F21","LSE04099F31","LSE04100A11","LSE04100A21","LSE04100A31","LSE04101A11","LSE04101A21","LSE04101A31","LSE04102D11","LSE04102D21","LSE04102D31","LSE04103A11","LSE04103A21","LSE04103A31","LSE04104B11","LSE04104B21","LSE04104B31","LSE04105A11","LSE04105A21","LSE04105A31","LSE04106B11","LSE04106B21","LSE04106B31","LSE04107A11","LSE04107A21","LSE04107A31","LSE04111A11","LSE04111A21","LSE04111A31","LSE04112D11","LSE04112D21","LSE04112D31","LSE04114A11","LSE04114A21","LSE04114A31","LSE04115B11","LSE04115B21","LSE04115B31","LSE04117B11","LSE04117B21","LSE04117B31","LSE04119A11","LSE04119A21","LSE04119A31","LSE04123A11","LSE04123A21","LSE04123A31","LSE04125A11","LSE04125A21","LSE04125A31","LSE04130A11","LSE04130A21","LSE04130A31","LSE04135A11","LSE04135A21","LSE04135A31","LSE04138D11","LSE04138D21","LSE04138D31","LSE04148C11","LSE04148C21","LSE04148C31","LSE04572E11","LSE04572E21","LSE04572E31","LSE04590A11","LSE04590A21","LSE04590A31","LSE04600A11","LSE04600A21","LSE04600A31","LSE04601A11","LSE04601A21","LSE04601A31","LSE04602A11","LSE04602A21","LSE04602A31","LSE04604B11","LSE04604B21","LSE04604B31","LSE04606E11","LSE04606E21","LSE04606E31","LSE04607E11","LSE04607E21","LSE04607E31","LSE04608C11","LSE04608C21","LSE04608C31","LSE04609B11","LSE04609B21","LSE04609B31","LSE04610C11","LSE04610C21","LSE04610C31","LSE04611A11","LSE04611A21","LSE04611A31","LSE04612A11","LSE04612A21","LSE04612A31","LSE04613C11","LSE04613C21","LSE04613C31","LSE04615A11","LSE04615A21","LSE04615A31","LSE04616B11","LSE04616B21","LSE04616B31","LSE04617A11","LSE04617A21","LSE04617A31","LSE04618B11","LSE04618B21","LSE04618B31","LSE04623D11","LSE04623D21","LSE04625B11","LSE04625B21","LSE04625B31","LSE04626A11","LSE04626A21","LSE04626A31","LSE04627C11","LSE04627C21","LSE04629A11","LSE04629A21","LSE04630E11","LSE04630E21","LSE04630E31","LSE04631E11","LSE04631E21","LSE04631E31","LSE04632A11","LSE04632A21","LSE04632A31","LSE04633A11","LSE04633A21","LSE04633A31","LSE04634D11","LSE04634D21","LSE04634D31","LSE04635A11","LSE04635A21","LSE04635A31","LSE04636F11","LSE04636F21","LSE04636F31","LSE04637F11","LSE04637F21","LSE04637F31","LSE04640A11","LSE04640A21","LSE04640A31","LSE04642F11","LSE04642F21","LSE04642F31","LSE04643D11","LSE04643D21","LSE04643D31","LSE04646C11","LSE04646C21","LSE04646C31","LSE04648A11","LSE04648A21","LSE04648A31","LSE04649C11","LSE04649C21","LSE04649C31","LSE04650A11","LSE04650A21","LSE04650A31","LSE04651A11","LSE04651A21","LSE04651A31","LSE04652C11","LSE04652C21","LSE04652C31","LSE04653A11","LSE04653A21","LSE04653A31","LSE04654A11","LSE04654A21","LSE04654A31","LSE04655A11","LSE04655A21","LSE04655A31","LSE04656H11","LSE04656H21","LSE04656H31","LSE04657A11","LSE04657A21","LSE04657A31","LSE04658A11","LSE04658A21","LSE04658A31","LSE04661A11","LSE04661A21","LSE04661A31","LSE04663F11","LSE04663F21","LSE04663F31","LSE04664D11","LSE04664D21","LSE04664D31","LSE04667A11","LSE04667A21","LSE04667A31","LSE04669B11","LSE04669B21","LSE04669B31","LSE04673A11","LSE04673A21","LSE04673A31","LSE04675A11","LSE04675A21","LSE04675A31","LSE04677G11","LSE04677G21","LSE04677G31","LSE04678D11","LSE04678D21","LSE04678D31","LSE04679A11","LSE04679A21","LSE04679A31","LSE04680A11","LSE04680A21","LSE04680A31","LSE04686B11","LSE04686B21","LSE04686B31","LSE04689A11","LSE04689A21","LSE04689A31","LSE04691A11","LSE04691A21","LSE04691A31","LSE04692H11","LSE04692H21","LSE04692H31","LSE04693A11","LSE04693A21","LSE04693A31","LSE04694C11","LSE04694C21","LSE04694C31","LSE04695A11","LSE04695A21","LSE04695A31","LSE04697F11","LSE04697F21","LSE04697F31","LSE04698B11","LSE04698B21","LSE04698B31","LSE04702C11","LSE04702C21","LSE04702C31","LSE04703A11","LSE04703A21","LSE04703A31","LSE04704A11","LSE04704A21","LSE04704A31","LSE04705E11","LSE04705E21","LSE04705E31","LSE04709A11","LSE04709A21","LSE04709A31","LSE04730F11","LSE04730F21","LSE04730F31","LSE04731D21","LSE04731D31","LSE04731D41","LSE04733A11","LSE04733A21","LSE04733A31","LSE04750A11","LSE04750A21","LSE04750A31","LSE04753A11","LSE04753A21","LSE04753A31","LSE04754E11","LSE04754E21","LSE04754E31","LSE04768A11","LSE04768A21","LSE04768A31","LSE04769C11","LSE04769C21","LSE04770B11","LSE04770B21","LSE04770B31","LSE04771B11","LSE04771B21","LSE04772A11","LSE04772A21","LSE04772A31","LSE04774C11","LSE04774C21","LSE04774C31","LSE04794A11","LSE04794A21","LSE04799A11","LSE04799A21","LSE04799A31","LSE04800B11","LSE04800B21","LSE04800B31","LSE04804E11","LSE04804E21","LSE04804E31","LSE04810A11","LSE04810A21","LSE04810A31","LSE04812A11","LSE04812A21","LSE04812A31","LSE04814B11","LSE04814B21","LSE04814B31","LSE05000A11","LSE05000A11","LSE05000A21","LSE05000A21","LSE05001B11","LSE05001B21","LSE05001B31","LSE05005A11","LSE05005A21","LSE05005A31","LSE05006A11","LSE05006A21","LSE05006A31","LSE05007B11","LSE05007B21","LSE05007B31","LSE05009E11","LSE05009E21","LSE05009E31","LSE05012C11","LSE05012C21","LSE05012C31","LSE05013E11","LSE05013E21","LSE05013E31","LSE05016C11","LSE05016C21","LSE05016C31","LSE05017A11","LSE05017A21","LSE05017A31","LSE05019A11","LSE05019A21","LSE05019A31","LSE05021A11","LSE05021A21","LSE05021A31","LSE05022A11","LSE05022A21","LSE05022A31","LSE05023A11","LSE05023A21","LSE05023A31","LSE05024D11","LSE05024D21","LSE05024D31","LSE05025A11","LSE05025A21","LSE05025A31","LSE05026A11","LSE05026A21","LSE05026A31","LSE05028B11","LSE05028B21","LSE05028B31","LSE05030E11","LSE05030E21","LSE05030E31","LSE05033B11","LSE05033B21","LSE05033B31","LSE05034A11","LSE05034A21","LSE05034A31","LSE05036A11","LSE05036A21","LSE05036A31","LSE05040A11","LSE05040A21","LSE05040A31","LSE05041A11","LSE05041A21","LSE05041A31","LSE05042A11","LSE05042A21","LSE05042A31","LSE05043E11","LSE05043E21","LSE05043E31","LSE05045B11","LSE05045B21","LSE05045B31","LSE05046A11","LSE05046A21","LSE05046A31","LSE05048A11","LSE05048A21","LSE05048A31","LSE05051A11","LSE05051A31","LSE05051A41","LSE05061A11","LSE05061A21","LSE05061A31","LSE05062A11","LSE05062A21","LSE05062A31","LSE05063A11","LSE05063A21","LSE05063A31","LSE05064D11","LSE05064D21","LSE05064D31","LSE05066B11","LSE05066B21","LSE05066B31","LSE05068A11","LSE05068A21","LSE05068A31","LSE05070D11","LSE05070D21","LSE05070D31","LSE05071A11","LSE05071A21","LSE05071A31","LSE05072A11","LSE05072A21","LSE05072A31","LSE05073C11","LSE05073C21","LSE05073C31","LSE05074A11","LSE05074A21","LSE05074A31","LSE05075A11","LSE05075A21","LSE05075A31","LSE05077A11","LSE05077A21","LSE05077A31","LSE05078A11","LSE05078A21","LSE05078A31","LSE05079B11","LSE05079B21","LSE05079B31","LSE05080A11","LSE05080A21","LSE05080A31","LSE05088A11","LSE05088A21","LSE05088A31","LSE05092A11","LSE05092A21","LSE05092A31","LSE05093B11","LSE05093B21","LSE05093B31","LSE05094F11","LSE05094F21","LSE05094F31","LSE05098D11","LSE05098D21","LSE05098D31","LSE05104A11","LSE05104A21","LSE05104A31","LSE05121A11","LSE05121A21","LSE05121A31","LSE05124B11","LSE05124B21","LSE05124B31","LSE05132A11","LSE05132A21","LSE05132A31","LSE05134H11","LSE05134H21","LSE05134H31","LSE05138A11","LSE05138A21","LSE05138A31","LSE05150D11","LSE05150D21","LSE05150D31","LSE05158A11","LSE05158A21","LSE05158A31","LSE05180A11","LSE05180A21","LSE05180A31","LSE05181A11","LSE05181A21","LSE05181A31","LSE05186A11","LSE05186A21","LSE05186A31","LSE05191B11","LSE05191B21","LSE05191B31","LSE05204E11","LSE05204E21","LSE05204E31","LSE05214A11","LSE05214A21","LSE05214A31","LSE05220A11","LSE05220A21","LSE05220A31","LSE05237A11","LSE05237A21","LSE05237A31","LSE05238C11","LSE05238C21","LSE05238C31","LSE05240A11","LSE05240A21","LSE05240A31","LSE05316B11","LSE05316B21","LSE05316B31","LSE05405A11","LSE05405A21","LSE05405A31","LSE05406A11","LSE05406A21","LSE05406A31","LSE05410B11","LSE05410B21","LSE05410B31","LSE05411A11","LSE05411A21","LSE05411A31","LSE05502B11","LSE05502B21","LSE05502B31","LSE05503B11","LSE05503B21","LSE05503B31","LSE05504A11","LSE05504A21","LSE05504A31","LSE05506A11","LSE05506A21","LSE05506A31","LSE05508A11","LSE05508A21","LSE05508A31","LSE05509A11","LSE05509A21","LSE05509A31","LSE05510E11","LSE05510E21","LSE05510E31","LSE05511A11","LSE05511A21","LSE05511A31","LSE05512B11","LSE05512B21","LSE05513F11","LSE05513F21","LSE05513F31","LSE05514A11","LSE05514A21","LSE05514A31","LSE05515B11","LSE05515B21","LSE05515B31","LSE05516A11","LSE05516A21","LSE05516A31","LSE05517A11","LSE05517A21","LSE05517A31","LSE05518C11","LSE05518C21","LSE05518C31","LSE05520D11","LSE05520D21","LSE05520D31","LSE05521B11","LSE05521B21","LSE05521B31","LSE05522F11","LSE05522F21","LSE05522F31","LSE05525B11","LSE05525B21","LSE05525B31","LSE05526F11","LSE05526F21","LSE05526F31","LSE05527A11","LSE05527A21","LSE05527A31","LSE05528F11","LSE05528F21","LSE05528F31","LSE05530D11","LSE05530D21","LSE05530D31","LSE05531A11","LSE05531A21","LSE05531A31","LSE05532A11","LSE05532A21","LSE05532A31","LSE05533A11","LSE05533A21","LSE05533A31","LSE05535C11","LSE05535C21","LSE05535C31","LSE05536A11","LSE05536A21","LSE05536A31","LSE05537A11","LSE05537A21","LSE05537A31","LSE05538A11","LSE05538A21","LSE05538A31","LSE05541D11","LSE05541D21","LSE05541D31","LSE05542C11","LSE05542C21","LSE05542C31","LSE05544A11","LSE05544A21","LSE05544A31","LSE05547F11","LSE05547F21","LSE05547F31","LSE05550B11","LSE05550B21","LSE05550B31","LSE05551A11","LSE05551A21","LSE05551A31","LSE05552A11","LSE05552A21","LSE05552A31","LSE05553A11","LSE05553A21","LSE05553A31","LSE05554B11","LSE05554B21","LSE05554B31","LSE05556B11","LSE05556B21","LSE05556B31","LSE05557A11","LSE05557A21","LSE05557A41","LSE05558D11","LSE05558D21","LSE05558D31","LSE05559A11","LSE05559A21","LSE05559A31","LSE05560B11","LSE05560B21","LSE05560B31","LSE05561C11","LSE05561C21","LSE05561C31","LSE05562A11","LSE05562A21","LSE05562A31","LSE05565A11","LSE05565A21","LSE05565A31","LSE05566A11","LSE05566A21","LSE05566A31","LSE05567D11","LSE05567D21","LSE05567D31","LSE05570A11","LSE05570A21","LSE05570A31","LSE05570A41","LSE05570A51","LSE05570A61","LSE05571C11","LSE05571C21","LSE05571C31","LSE05573A11","LSE05573A21","LSE05573A31","LSE05574A11","LSE05574A21","LSE05574A31","LSE05575A11","LSE05575A21","LSE05575A31","LSE05579B11","LSE05579B21","LSE05579B31","LSE05587A11","LSE05587A21","LSE05587A31","LSE05601A11","LSE05601A21","LSE05601A31","LSE05606A11","LSE05606A21","LSE05606A31","LSE05607C11","LSE05607C21","LSE05607C31","LSE05608A11","LSE05608A21","LSE05608A31","LSE05611B11","LSE05611B21","LSE05611B31","LSE05674B11","LSE05674B21","LSE05674B31","LSE05676A11","LSE05676A21","LSE05676A31","LSE05687A11","LSE05687A21","LSE05687A31","LSE05689A11","LSE05689A21","LSE05689A31","LSE05690C11","LSE05690C21","LSE05690C31","LSE05717E11","LSE05717E21","LSE05717E31","LSE05726A11","LSE05726A21","LSE05726A31","LSE05743A11","LSE05743A21","LSE05743A31","LSE05744A11","LSE06000A11","LSE06000A21","LSE06000A31","LSE06002A11","LSE06002A21","LSE06002A31","LSE06003B11","LSE06003B21","LSE06003B31","LSE06004A11","LSE06004A21","LSE06004A31","LSE06005A11","LSE06005A21","LSE06005A31","LSE06007A11","LSE06007A21","LSE06007A31","LSE06008A11","LSE06008A21","LSE06008A31","LSE06009A11","LSE06009A21","LSE06009A31","LSE06010A11","LSE06010A21","LSE06010A31","LSE06011C11","LSE06011C21","LSE06011C31","LSE06014B11","LSE06014B21","LSE06014B31","LSE06016A11","LSE06016A21","LSE06016A31","LSE06017B11","LSE06017B21","LSE06017B31","LSE06018A11","LSE06018A21","LSE06018A31","LSE06019A11","LSE06019A21","LSE06019A31","LSE06020A11","LSE06020A21","LSE06020A31","LSE06021B11","LSE06021B21","LSE06021B31","LSE06022A11","LSE06022A21","LSE06022A31","LSE06025A11","LSE06025A21","LSE06025A31","LSE06026A11","LSE06026A31","LSE06026A41","LSE06027C11","LSE06027C21","LSE06027C31","LSE06033A11","LSE06033A21","LSE06033A31","LSE06034A11","LSE06034A21","LSE06034A31","LSE06035A11","LSE06035A21","LSE06035A31","LSE06036C11","LSE06036C21","LSE06036C31","LSE06037A11","LSE06037A21","LSE06037A31","LSE06038A11","LSE06038A21","LSE06038A31","LSE06039A11","LSE06039A21","LSE06039A31","LSE06063B11","LSE06063B21","LSE06063B31","LSE06069B11","LSE06069B21","LSE06069B31","LSE06082A11","LSE06082A21","LSE06082A31","LSE06112A11","LSE06112A21","LSE06112A31","LSE06113A11","LSE06113A21","LSE06113A31","LSE06115C11","LSE06115C21","LSE06115C31","LSE06538A11","LSE06538A21","LSE07002B11","LSE07002B21","LSE07002B31","LSE07007A11","LSE07007A21","LSE07007A31","LSE07009B21","LSE07009B31","LSE07009B41","LSE07010C11","LSE07010C21","LSE07010C31","LSE07011A11","LSE07011A21","LSE07011A31","LSE07012A11","LSE07012A21","LSE07012A31","LSE07014A11","LSE07014A21","LSE07014A31","LSE07017B11","LSE07017B21","LSE07017B31","LSE07019A11","LSE07019A21","LSE07019A31","LSE07023D11","LSE07023D21","LSE07023D31","LSE07030A11","LSE07030A21","LSE07030A31","LSE07031K11","LSE07031K21","LSE07031K31","LSE07032H11","LSE07032H21","LSE07032H31","LSE07035C11","LSE07035C21","LSE07035C31","LSE07037O11","LSE07037O21","LSE07037O31","LSE07038A11","LSE07038A21","LSE07038A31","LSE07039D11","LSE07039D21","LSE07039D31","LSE07040G11","LSE07040G21","LSE07040G31","LSE07043A11","LSE07043A21","LSE07043A31","LSE07044D11","LSE07048H11","LSE07048H21","LSE07048H31","LSE07049E11","LSE07049E21","LSE07049E31","LSE07054A11","LSE07054A21","LSE07054A31","LSE07058F11","LSE07058F21","LSE07058F41","LSE07064A11","LSE07064A21","LSE07064A31","LSE07070A11","LSE07070A21","LSE07070A31","LSE07081D11","LSE07081D21","LSE07081D31","LSE07101A11","LSE07101A21","LSE07101A31","LSE07102C11","LSE07102C21","LSE07102C31","LSE07104B11","LSE07104B21","LSE07104B31","LSE07106D11","LSE07106D21","LSE07106D31","LSE07107C11","LSE07107C21","LSE07113B11","LSE07113B21","LSE07113B31","LSE07117A11","LSE07117A21","LSE07117A31","LSE07120A11","LSE07120A21","LSE07120A31","LSE07125B11","LSE07125B21","LSE07125B31","LSE07129B11","LSE07129B21","LSE07129B31","LSE07151B11","LSE07151B21","LSE07151B31","LSE07152F11","LSE07152F21","LSE07152F31","LSE07155D11","LSE07155D21","LSE07155D31","LSE07161A11","LSE07161A21","LSE07161A31","LSE07164E11","LSE07164E21","LSE07164E31","LSE07178A11","LSE07178A21","LSE07178A31","LSE07217C11","LSE07217C21","LSE07217C31","LSE07218A11","LSE07218A21","LSE07218A31","LSE08002A11","LSE08006A11","LSE08006A21","LSE09994A11"];
                //var pciTempArrayP = ["PCI","198","265","458","99","343","14","450","355","287","381","391","266","162","466","236","183","484","320","198","142","224","432","457","302","234","373","338","432","211","272","258","334","230","210","268","422","318","295","446","477","343","299","330","391","293","360","436","80","369","64","149","459","31","230","429","484","95","345","328","383","336","118","23","159","73","374","141","43","290","225","82","380","336","262","131","333","397","152","249","325","2","237","319","59","369","457","316","306","376","467","75","202","212","33","346","71","15","391","449","264","274","11","276","118","2","180","259","305","154","21","322","329","333","304","209","136","42","343","128","219","133","152","240","139","347","135","427","242","342","340","17","411","4","464","108","13","194","114","487","92","486","181","191","108","22","38","315","292","29","85","9","55","476","217","27","331","20","0","7","113","405","217","269","102","361","68","24","97","245","190","210","220","119","435","94","431","357","454","200","84","7","476","255","478","344","180","151","305","174","487","311","114","253","257","108","301","14","315","244","440","249","100","140","444","238","281","204","193","8","264","409","359","123","13","3","214","224","96","40","23","339","325","17","51","55","149","81","10","20","183","250","179","30","166","77","474","238","347","399","427","263","72","250","407","45","19","293","198","247","320","282","418","287","318","433","410","450","295","422","120","391","458","192","466","302","204","424","221","393","418","287","54","289","410","213","460","338","99","400","251","318","166","221","6","151","368","396","481","194","141","58","182","399","91","299","219","283","230","120","253","482","9","358","161","228","367","116","465","223","470","321","229","296","333","52","80","366","424","392","240","172","29","195","46","407","459","346","101","493","494","495","453","364","389","165","103","86","441","286","65","375","478","26","294","454","383","393","88","341","186","409","212","66","310","287","432","208","485","234","37","378","112","167","264","475","71","312","160","68","414","292","200","111","469","386","303","235","305","162","4","143","156","113","466","204","328","395","27","414","472","206","345","178","437","12","451","317","198","241","248","192","445","302","414","466","341","267","334","122","273","184","254","84","385","275","252","484","302","132","340","323","237","337","35","174","427","119","72","271","426","157","261","226","404","417","256","329","480","40","326","63","379","332","21","307","374","282","418","356","420","433","308","69","211","401","213","484","350","279","436","164","318","268","362","450","91","365","162","142","380","183","202","446","390","316","215","468","427","464","102","247","143","231","262","395","243","313","176","345","334","452","465","400","470","348","265","347","273","274","95","327","268","287","372","349","323","282","79","410","393","424","206","405","439","320","474","277","239","408","448","143","144","136","74","300","454","317","426","288","130","344","420","295","422","438","373","218","441","115","416","330","433","89","258","256","309","367","308","396","442","356","171","52","374","168","353","69","469","371","195","127","479","216","139","236","129","145","386","162","91","14","237","343","395","267","226","443","459","190","203","189","193","404","345","232","431","201","220","446","462","241","473","36","79","326","123","187","275","240","199","252","283","455","174","481","479","363","253","65","135","256","164","183","271","110","447","262","116","423","397","173","300","277","116","423","412","326","126","481","485","216","463","431","255","94","242","99","157","257","150","412","50","381","166","263","207","208","401","477","460","254","330","79","323","204","196","86","132","484","311","351","160","338","234","328","155","285","211","383","279","238","440","297","280","296","402","124","56","261","298","440","300","148","353","222","310","306","289","467","411","199","113","363","349","170","321","157","197","258","472","104","132","229","434","444","460","246","148","275","120","226","228","142","335","432","274","290","354","376","161","117","67","185","138","1","416","273","445","176","228","172","185","102","172","365","351","79","158","141","376","203","195","271","341","87","1","254","192","286","104","327","292","404","189","139","323","291","307","419","54","250","206","282","148","458","348","181","470","135","313","107","84","283","452","243","265","350","294","52","14","273","277","50","360","34","62","216","133","224","174","220","479","372","316","110","390","403","137","231","385","119","456","214","419","288","340","248","408","364","311","387","373","122","444","19","359","447","463","95","153","349","84","43","335","147","421","458","324","424","395","456","130","122","198","187","272","9","478","141","193","404","270","448","327","241","56","259","458","78","124","215","171","487","218","183","13","371","429","367","321","373","452","216","385","326","426","109","282","85","284","24","223","243","356","250","441","184","470","111","87","415","377","180","259","302","177","187","404","126","118","380","474","364","425","246","277","245","93","394","371","153","145","197","372","388","11","189","238","467","160","491","309","475","281","444","166","162","202","314","312","43","170","186","328","236","372","292","296","0","310","26","354","346","167","405","196","212","345","127","338","204","4","225","283","488","270","304","35","375","235","104","303","31","348","25","287","330","358","278","216","100","437","276","448","236","387","430","8","369","199","284","123","16","125","105","325","344","93","277","155","42","64","353","81","259","134","153","217","110","447","121","48","448","191","120","313","347","150","469","308","285","352","128","207","106","455","486","148","230","135","61","479","363","73","443","264","349","143","435","364","488","453","214","446","234","400","275","156","283","213","145","185","294","409","452","66","427","131","309","190","41","204","88","311","75","265","182","297","280","266","414","16","252","127","314","387","436","434","48","400","263","351","469","239","381","412","485","399","451","170","417","397","269","444","25","476","348","31","281","450","409","143","321","196","131","384","409","32","294","76","362","36","340","248","18","172","92","126","328","296","108","82","230","378","169","53","318","400","290","180","358","17","144","142","62","102","34","320","267","346","188","30","475","332","63","103","129","157","152","360","154","206","219","55","260","312","160","86","0","319","200","231","415","158","174","340","38","249","166","302","81","361","386","117","403","368","264","334","326","279","52","212","477","97","344","372","292","480","226","159","382","101","51","277","266","291","10","221","27","484","305","21","163","23","354","307","410","96","427","68","237","489","490","491","408","457","50","297","445","2","474","238","242","336","412","224","225","421","233","42","181","170","93","79","104","378","481","359","69","49","173","117","208","479","123","37","164","66","205","422","240","298","374","402","61","149","231","337","428","90","40","98","465","454","254","120","211","128","78","439","110","69","40","137","39","1","347","423","442","341","147","487","278","156","475","74","387","46","434","114","286","236","363","393","60","261","91","167","147","373","26","135","433","431","132","162","472","186","168","256","95","210","202","3","376","303","235","239","57","247","194","258","274","14","228","127","74","207","106","83","54","385","149","252","460","15","367","473","156","301","350","315","115","482","285","220","374","462","268","471","349","452","402","205","275","441","115","482","78","31","107","426","436","89","381","67","398","456","173","406","246","391","65","306","148","227","465","112","122","234","304","365","333","469","62","93","454","233","447","463","380","189","145","194","393","16","179","192","124","89","300","355","161","192","382","158","390","295","242","486","79","140","159","161","160","384","175","62","390","442","83","291","418","428","99","61","116","327","229","281","219","121","468","301","194","429","310","398","450","91","312","187","122","229","215","105","36","64","464","165","442","50","138","97","419","60","367","350","129","133","434","72","442","332","315","73","308","57","100","155","438","244","209","420","331","473","396","304","104","195","197","357","112","368","426","286","311","483","19","284","384","457","371","423","460","107","150","70","128","12","274","131","483","1","389","459","451","455","66","466","248","123","109","185","141","472","179","183","187","461","42","178","467","54","403","353","18","31","185","324","424","317","84","52","137","357","445","74","78","487","164","171","262","479","438","265","338","477","166","125","375","181","254","6","118","176","21","67","158","204","34","221","126","319","227","48","208","44","471","37","260","18","58","155","369","331","149","138","436","288","367","363","379","83","255","325","227","303","28","353","93","58","465","34","197","6","364","284","333","79","161","210","55","260","48","28","44","243","205","96","313","170","324","121","86","189","262","315","139","206","342","70","188","177","106","488","486","352","455","348","214","269","57","196","293","168","148","233","369","325","86","405","418","306","361","461","189","262","359","36","238","467","477","121","146","96","430","158","423","352","203","420","214","251","114","181","155","165","64","56","279","130","98","249","421","65","453","298","263","411","49","416","6","271","389","459","94","176","396","142","113","351","322","71","429","28","179","273","253","432","232","323","357","278","435","244","468","412","440","45","250","218","144","133","119","342","316","401","213","199","164","243","439","314","195","394","197","201","175","293","369","430","455","255","100","146","216","379","338","45","139","47","33","151","116","345","172","329","432","211","485","177","439","299","342","49","362","384","361","365","39","304","461","378","301","224","481","336","70","464","169","117","10","413","0","319","239","222","184","221","36","37","305","393","223","332","438","343","101","27","34","30","451","350","249","376","176","90","472","95","45","115","350","435","403","47","330","190","83","336","355","362","60","109","152","276","97","266","270","355","164","108","175","428","471","91","71","399","373","416","18","112","402","220","263","414","12","178","251","459","388","180","286","302","3","250","440","57","274","272","96","28","321","190","65","228","163","323","48","388","161","132","271","476","222","193","107","423","442","422","237","319","210","124","209","420","355","401","333","418","80","480","385","407","360","463","368","357","370","155","171","139","182","270","88","119","168","250","371","147","430","440","420","22","380","261","232","248","87","19","140","381","76","56","216","301","347","171","82","131","309","202","272","81","253","56","477","16","41","6","460","269","438","43","224","306","208","245","141","133","218","267","52","410","78","229","293","246","67","404","102","40","227","243","154","392","207","169","191","165","337","32","24","247","473","351","415","75","181","59","318","1","113","180","298","53","297","280","197","69","82","293","282","295","56","130","173","1","477","76","456","316","242","225","159","382","401","324","133","290","114","187","356","20","129","322","158","51","445","218","468","94","5","192","118","231","232","398","17","390","394","203","417","307","107","195","334","206","483","229","429","397","77","18","226","146","468","322","131","87","73","429","235","126","265","434","63","289","35","171","85","137","396","412","419","339","391","449","462","268","44","213","43","386","450","79","431","246","7","227","327","370","209","474","463","425","300","331","444","454","254","342","340","263","102","58","200","201","244","92","138","487","377","411","406","89","381","67","375","58","383","288","289","413","258","457","74","300","397","443","201","259","134","60","112","335","309","382","152","459","280","305","123","472","194","60","445","305","105","40","275","21","487","314","150","199","308","201","406","206","417","85","437","138","151","392","480","316","83","153","82","464","357","307","110","69","256","326","417","31","29","225","136","227","384","205","488","75","46","59","411","337","146","177","223","107","384","127","281","327","1","341","141","103","278","108","157","215","366","439","173","156","310","413","174","85","126","207","331","476","144","388","389","432","100","296","132","94","125","105","163","359","18","322","41","54","217","470","177","265","344","45","346","233","78","34","50","117","361","398","63","148","26","84","76","101","342","124","110","240","181","32","156","247","359","63","334","116","57","103","98","108","37","413","87","196","59","144","361","239","309","250","173","261","118","257","12","379","41","114","163","215","291","25","83","372","112","278","486","421","251","48","319","419","402","52","134","207","19","449","276","316","485","267","10","251","183","211","125","291","268","137","252","196","23","480","379","299","84","127","191","282","88","209","201","322","83","162","274","419","276","394","119","315","406","293","213","259","392","375","301","272","339","346","39","298","11","474","154","335","120","43","21","160","390","295","62","129","145","338","204","94","59","135","151","290","231","166","89","36","175","347","192","115","101","351","349","92","45","451","485","78","370","269","225","130","242","294","91","467","453","205","140","111","97","245","249","61","437","237","268","482","129","382","149","441","112","53","9","193","188","15","184","98","276","370","161","69","457","314","447","349","53","234","262","329","396","76","428","249","220","92","99","415","185","159","175","368","309","136","182","255","31","344","324","244","434","366","184","212","426","397","266","312","292","443","339","37","299","399","88","401","51","142","47","288","64","167","408","190","344","33","169","203","465","208","317","12","400","14","324","439","254","144","100","320","102","475","377","237","478","482","69","16","8","354","133","188","444","22","278","334","257","453","252","85","386","171","16","377","363","67","239","51","205","212","114","115","386","57","73","441","223","203","303","415","24","199","182","120","232","455","198","424","96","253","449","57","244","110","87","115","341","405","280","425","273","304","221","471","28","317","33","33","295","295","186","283","128","246","184","140","51","61","53","207","268","482","138","13","203","72","37","464","474","223","155","159","277","80","63","298","371","132","67","311","333","376","53","261","370","368","294","259","194","60","94","68","345","34","68","294","409","398","117","370","317","15","322","260","111","364","233","39","394","452","48","307","26","387","103","320","123","355","167","93","10","443","435","331","389","222","475","326","378","121","65","186","49","128","231","335","193","57","415","488","153","10","230","435","214","248","453","85","359","81","169","167","39","331","353","375","76","98","105","346","428","360","343","188","423","19","23","27","244","467","75","109","461","210","124","182","366","439","113","471","379","80","45","310","314","15","160","296","270","352","107","189","58","200","60","82","428","117","25","8","483","247","113","150","241","329","63","280","146","159","154","5","219","394","425","210","136","134","321","154","377","75","70","425","96","157","65","126","352","74","297","61","47","408","217","92","72","64","68","9","58","77","111","352","134","96","304","197","312","226","191","78","307","410","219","70","422","66","211","17","129","403","2","228","403","35","354","175","173","90","469","350","6","73","335","417","358","308","321","433","125","159","25","230","276","64","458","420","301","248","168","115","332","270","55","255","451","161","390","364","455","447","253","329","441","7","29","348","202","170","273","319","251","147","82","179","156","430","392","288","406","41","138","478","362","462","76","413","120","325","122","480","232","134","12","484","17","453","460","323","165","106","473","327","163","200","84","157","266","240","217","278","399","205","290","465","238","98","252","10","209","186","352","38","297","292","47","33","217","215","264","43","377","21","49","476","171","235","143","153","70","443","111","373","257","33","286","92","45","325","200","90","112","122","177","205","71","225","448","299","264","151","443","228","55","17","339","109","284","387","151","281","354","103","449","174","406","392","490","491","489","375","241","404","246","388","428","219","127","341","435","94","299","411","208","395","186","259","290","486","286","2","90","40","32","372","130","149","180","22","461","117","136","221","9","448","446","408","88","26","177","145","317","165","370","488","456","337","431","132","382","101","42","136","77","408","4","62","42","39","169","17","399","46","116","261","28","416","174","1","53","81","100","8","291","274","425","300","4","257","471","49","395","147","145","5","483","13","152","342","103","38","66","109","179","90","421","11","369","22","86","168","427","119","411","163","59","405","226","332","150","241","137","450","61","380","438","356","223","72","91","80","468","121","125","366","463","2","315","70","38","219","361","143","486","34","287","324","325","362","195","172","260","399","193","47","27","478","50","6","55","476","234","4","20","18","232","215","402","160","38","489","490","135","10","56","0","382","398","424","38","9","42","379","32","336","7","374","48","442","266","75","97","20","222","58","86","354","199","407","3","169","446","33","379","35","165","13","5","39","22","191","114","400","272","159","109","41","291","358","245","210","388","95","30","463","167","303","64","125","462","81","298","50","24","184","281","156","46","68","240","313","11","189","121","191","30","106","260","378","52","128","297","313","425","402","409","20","9","178","23","456","19","188","480","394","90","88","260","333","214","182","393","388","11","0","49","284","111","475","239","93","82","77","264","16","20","429","178","416","63","289","434","312","217","35","201","385","284","141","352","227","18","28","44","99","150","433","492"];
                //var color = colorLookup('pci', pciTempArrayP[pciTempArrayC.indexOf(data['sector'][i]['lncel_name'])]);
                var secPoly = new google.maps.Polygon({
                    paths: arcPts,
                    strokeColor:'#585555',
                    strokeOpacity:0,
                    strokeWeight: 0.6,
                    fillColor: "#F57D2F",
                    fillOpacity:0,
                    zIndex: stack_, //stack order
                    map: map
                });
                secPolyTemp.push(secPoly)
                sectorPolygons.push([secPoly, cellname]);
                secSQL.push("'"+cellname+"'");
                //console.log(Object.keys(sectorPolygons[i]));
                google.maps.event.addListener(secPoly, 'click', infoWindowSparklineShow('sector',[i,data]));
            }
            //Verify style
            style_ = 0
            changeSectorStyle(secSQL.toString(),sectorPolygons,style_)
        });
        
    }
}

function secDrawWebGL () {
    var geoJson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -122.31028676033021,
              47.60613410935067
            ],
            [
              -122.31021165847778,
              47.604325670210855
            ],
            [
              -122.30769038200378,
              47.604325670210855
            ],
            [
              -122.31028676033021,
              47.60613410935067
            ]
          ]
        ]
      }
    }
  ]
};

    var myLayer;
    myLayer = new WebGLLayer(map);
    myLayer.loadData(geoJson);
    myLayer.start(); 

}
