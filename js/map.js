/* google maps -----------------------------------------------------*/
// Define map as global scope
var maptiler;
var map;
var cachedGeoJson;
var colorValues = ["#0099FF"/*0*/, "green"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/];
var mkt_loc = {Portland:[45.523062, -122.676482], Seattle:[47.6097, -122.331], Spokane:[47.658780, -117.426047], Phoenix:[33.448377, -112.074037], Dallas:[32.7767, -96.7970]};
var cluster = $.getJSON("/webcontent/layers/Cluster.json");  //Add layers with JQUERY and using in options
var subcluster = $.getJSON("/webcontent/layers/SubCluster.json");  //Add layers and using in options
var features = null;
var listenerHandle; //Returns an identifier for this listener that can be used with google.maps.event.removeListener
var markers = []; // Used to group clusters check MarkerClusterer  also used to change icons markers.push(marker);
var siteDots = [];  // Used to modify polyg on the fly
var markerCluster; //Required to removed it when is required http://stackoverflow.com/questions/8229827/update-markercluster-after-removing-markers-from-array
var markerL700;
var bans = [];
var sectorPolygons = [];
var secPolyTemp = [];
var secSQL = [];
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
var colorPalette = ["green"/*0*/, "YellowGreen"/*1*/, "yellow"/*2*/, "orange"/*3*/, "red"/*4*/, "Wheat"/*5*/, "Violet"/*6*/, "Turquoise"/*7*/, "#FF6347"/*8*/, "#4682B4"/*9*/, "#708090"/*10*/, "#C0C0C0"/*11*/, "#A0522D"/*12*/, "#F4A460"/*13*/, "#FA8072"/*14*/, "#BC8F8F"/*15*/];
var umtsfdbk = ['Okay','Poor EcNo','Poor RTWP','Poor EcNo|Poor RTWP','High TX power usage','Poor EcNo|High TX power usage','Poor RTWP|High TX power usage','Poor EcNo|Poor RTWP |High TX power usage','Soft HO fail','Poor EcNo|Soft HO fail','Poor RTWP|Soft HO fail','Poor EcNo|Poor RTWP|Soft HO fail','High TX power usage|Soft HO fail','Poor EcNo|High TX power usage|Soft HO fail','Poor RTWP|High TX power usage|Soft HO fail','Poor EcNo|Poor RTWP|High TX power usage|Soft HO fail'];
var days_= -1;
var old_day = moment().format('YYYY-MM-DD');//.add(-1, 'days');
var CurrentDate = moment().add(-1, 'days').format('YYYY-MM-DD');
var style_ = 'VOICE_DROPS_RAW_SEV';
var query_ = 0;
var Arrkpi = ['FEEDBACK','VOICE_DROPS_RAW_SEV','POOR_ECNO_SEV','HIGH_TX_PWR_USAGE_SEV','POOR_RTWP_SEV'];
var mapLabelTemp = [];
var GISListener;
var RootMetricListener;
var kpiname_ = {'diagnostic':'Possible Issue Detected',
            'voice_traffic':'Voice Traffic (Erl)',
            'voice_acc_fail_rate':'Voice Access Fail Rate (%)', 
            'voice_drop_rate':'Voice Drop Rate (%)',
            'voice_drops': 'Voice Drops (#)',
            'dlr99datatraffic': 'DL R99 Data Traffic (MB)',
            'hsdpatrafficvolume': 'HSDPA Traffic (MB)',
            'ps_acc_fail_rate': 'PS Access Fail Rate (%)',
            'ps_drop_rate': 'PS Drop Rate (%)',
            'soft_handover_failure_rate': 'Soft HO Fail Rate (%)',
            'voice_traffic_sev': 'High Voice Traffic (#)',
            'voice_drops_raw_sev': 'Voice Drops Severity (#)',
            };

var secProperty = {"UMTS":[{"layer":"P1","stack":1,"size":1,"color":"blue"},{"layer":"P2","stack":2,"size":0.8,"color":"blue"},{"layer":"U1","stack":3,"size":0.6,"color":"orange"},
{"layer":"U2","stack":4,"size":0.4,"color":"orange"}],"LTE":[{"layer":"D1","stack":1,"size":1,"color":"purple"},{"layer":"L1","stack":2,"size":0.8,"color":"orange"},
{"layer":"B1","stack":3,"size":0.6,"color":"blue"}],"GSM":[{"layer":"gsm","stack":1,"size":1,"color":"blue"}]};
 

var secObj = {
    sectorPolygons : [],
    secPolyTemp : [],  
    secSQL : []   
}
var seDrawStatus = 0;

 var secMap;
 
//Humorous Loading Text
//loadingText();
var loadTime = 0;
//setInterval(loadingText, 1500);
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
        zoom: 11,
//Control Options
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
            mapTypeIds: [
                google.maps.MapTypeId.TERRAIN,
                google.maps.MapTypeId.HYBRID
            ]
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        streetViewControl: true
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    navmenu();
        
    google.maps.event.addListener(map, "rightclick",function(event){showContextMenu(event.latLng);});
    elevator = new google.maps.ElevationService();
    google.maps.event.addListener(map, 'idle', showBans); 
    google.maps.event.addListener(map, 'tilesloaded',function(){
        //document.getElementById('thingCover').style.visibility='hidden';
    });
    
    google.maps.event.addListener(map, 'idle', secDraw);
    
    document.getElementById("mktSea").addEventListener("click", infoWindowSparklineShow('market','Seattle'));
    document.getElementById("mktPdx").addEventListener("click", infoWindowSparklineShow('market','Portland'));
    document.getElementById("mktSpo").addEventListener("click", infoWindowSparklineShow('market','Spokane'));
    document.getElementById("mktPhx").addEventListener("click", infoWindowSparklineShow('market','Phoenix'));
    document.getElementById("mktDal").addEventListener("click", infoWindowSparklineShow('market','Dallas'));
    
    for (i=0;i<5;i++){
        document.getElementById("MKPI_"+i).addEventListener("click", (function(k){
            return function() {
            style_=Arrkpi[k];
            query_ = 1;
            changeSectorStyle(secSQL.toString(),sectorPolygons,style_,CurrentDate,query_)
            };
        })(i)); 
    }
    
    for (i=0;i<4;i++){
        document.getElementById("Par_"+i).addEventListener("click", (function(k){
            return function() {
            style_=$("#Par_"+k).val();
            query_ = 2;
            changeSectorStyle(secSQL.toString(),sectorPolygons,style_,CurrentDate,query_)
           
            };
        })(i)); 
    }   
}

//onload event listener
google.maps.event.addDomListener(window, 'load', initialize);

//Sites Layer
function sites(nkpi) {
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();
    if (nkpi == 'KPI_2') {
        legend();
    }
    $.getJSON('/webcontent/layers/sites.json', function(data) {
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
function infoWindowSparklineShow(type,passIn,tech){
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
            $('#info').html( '<img src="images/spin.gif" height="40" width="40" style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;">' );
            $('#alarms').html( '<img src="images/spin.gif" height="40" width="40" style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;">' );
            $('#tt').html( '<img src="images/spin.gif" height="40" width="40" style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;">' ); 
            $('#wo').html( '<img src="images/spin.gif" height="40" width="40" style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;">' );            
        
           $.get("php/phyconf.php?lncel="+passIn[1]['sector'][passIn[0]]['lncel_name'],(function(phyconf){
                return function(phyconf) {
                    content ='     <div class="winfo"> \
                                      <!-- Nav tabs --> \
                                      <ul class="nav nav-tabs" role="tablist"> \
                                        <li role="presentation" class="active"><a href="#info" aria-controls="info" role="tab" data-toggle="tab">Info</a></li> \
                                        <li role="presentation"><a href="#alarms" aria-controls="alarms" role="tab" data-toggle="tab">Alarms</a></li> \
                                        <li role="presentation"><a href="#tt" aria-controls="tt" role="tab" data-toggle="tab">TT</a></li> \
                                        <li role="presentation"><a href="#wo" aria-controls="wo" role="tab" data-toggle="tab">WO</a></li> \
                                      </ul>\
                                      <!-- Tab panes --> \
                                      <div class="tab-content"> \
                                        <div role="tabpanel" class="tab-pane active" id="info">...</div> \
                                        <div role="tabpanel" class="tab-pane" id="alarms">...</div> \
                                        <div role="tabpanel" class="tab-pane" id="tt">...</div> \
                                        <div role="tabpanel" class="tab-pane" id="wo">...</div> \
                                      </div>\
                                    </div>';    
                    infowindow.setContent(content);
                    $('#info').html('<b style="padding-left:20px;">'+passIn[1]['sector'][passIn[0]]['site_name']  +'-' + passIn[1]['sector'][passIn[0]]['lncel_name'] +'</b><br><div class="col-xs-8"><table class="table table-condensed table-striped"> <tbody>'+ phyconf + '</tbody> </table></div>');
                    
                    
                    $.get("php/alarm.php?SiteID="+passIn[1]['sector'][passIn[0]]['site_name'],function(data) {     /*get function take the content of test.html
                     put in variable 'data' inside the callback function*/
                        $('#alarms').html(data);
                    });                
                };
            })()); 
            infowindow.setPosition(event.latLng);
            infowindow.open(map);
            $('#ltedropLine'+passIn[0]).sparkline();
            $('#iframett').html('<br><br><span class="blink_txt">Loading...</span>');
            $.get("php/tt.php?SiteID="+passIn[1]['sector'][passIn[0]]['site_name'],function(data) {     /*get function take the content of test.html
             put in variable 'data' inside the callback function*/
                $('#iframett').html(data);
            });

            jSONURL = "php/kpi_.php?TECH="+tech+"&lncel="+passIn[1]['sector'][passIn[0]]['lncel_name']; 
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
        
        $('#ui-kpis > .col-sm-12').html('<h5> <div class="infoCell"></div></h5>');
        $.getJSON(jSONURL,function(datak) {
            var g=0;
            kpiName[tech].forEach(function(kpiObj){
                var prop = [Object.keys(kpiObj)[0].toUpperCase(),kpiObj[Object.keys(kpiObj)]];

                var html_chartKpi = ('<div id="chart-kpi-'+g+'" style="text-align:left"></div>')
                $('#ui-kpis > .col-sm-12').append(html_chartKpi);
                $('#chart-kpi-'+g).wrapAll( "<p/>");
                var chartKpi=$('#chart-kpi-'+g);

                chartKpi.html('<strong>'+prop[1]+'</strong><div style="text-align:center" class="inlinesparkline">Loading...</div> <div style="text-align:center" class="info_spk">&nbsp;</div>');
                field_ = '#chart-kpi-'+g+' '+'.inlinesparkline'
                field2_ = '#chart-kpi-'+g+' '+'.info_spk'
                if (prop[0] == 'DIAGNOSTIC'){
                    chartKpi.append('<div id="fdbk" class="well" style="background-color:transparent">'+ feedback_(umtsfdbk[datak[datak.length-1].DIAGNOSTIC]) +'</div>');
                }
                $(field_)
                    .sparkline(
                        $.map(datak,function(kpi) { return kpi[prop[0]]; }),
                        {width: '350px', height: '40px', fillColor: '#F5F5F5', lineColor: '#113B51', lineWidth: 2, disableTooltips: true}
                    );
                //Closures (check variable scope)
                (function(field__,field2__,prop_){
                    $(field__).on("sparklineRegionChange", function(ev){
                        var idx = ev.sparklines[0].getCurrentRegionFields().offset;
                        if (idx) {
                            $(field2__).html(
                                "<span> Date:" + moment(datak[idx].date).format('MM/DD')
                                + "&nbsp;&nbsp;&nbsp; "
                                + "Value: " + datak[idx][prop_] + "</span>");
                            if (prop_ == 'DIAGNOSTIC'){$('#fdbk').html(feedback_(umtsfdbk[datak[idx][prop_]]));}
                        }
                    });
                    $(field__).on("mouseout", function() {
                        $(field2__).html("&nbsp;");
                    });  
                })(field_,field2_,prop[0]);
                g++;


            })
            var cellLastsp = datak[0].CellName;
            var dateLastsp = moment(datak[datak.length-1].date).format('MM/DD');
            
           // $('#ui-kpis > .col-sm-12').html('<h2>TESTING</h2>');
            
            $('.infoCell').html('<p>&nbsp;<span style="float: left">'+cellLastsp+'</span><span style="float: right">Upd:'+dateLastsp+'</span></p>');
            if(type == 'sector'){$('.infoSite').html('<p>'+cellLastsp.substr(0,cellLastsp.length - 2)+'</p>');}
        });
    }
}
//Diagnostic
function feedback_(str_){
    var res = '<ul>'
    var strSp = str_.split('|')
    for(var j=0;j<strSp.length;j++){
        res = res + '<li>'+strSp[j]+'</li>'
    }
    res = res+'</ul>'
    return res
}

//get the legend container, create a legend, add a legend renderer fn, define css on general.css
function legend(leg_type) {
    //var legendDiv = document.createElement('div');
    //var innerHtml = '<div id="legend-container" style="z-index: 0; position: absolute; bottom: 14px; right: 0;"><h4>Legend</h4><div id="legend">';
    var legendTable = [];
    
    var  innerHtml = '<div id="legend-container"><h4>'+leg_type+'</h4><div id="legend">';
    
    legendTable['rsrq'] = [['green','orange','red'],['0db to -10db','-10db to -16db','-16db to -30db'],'dB','left'];
    legendTable['rsrp'] = [['#0099FF','green','yellow','orange','red'],['-45dbm to -91dbm','-91dbm to -97dbm','-97dbm to -114dbm','-114dbm to -120dbm','-120dbm to -130dbm'],'dBm','left'];
    legendTable['traffic'] = [['#0099FF','orange','red'],['Low','Medium','High'],'None','left'];
    legendTable['TMo_Tech_Map'] = [["#E20074","#FF3B9E","#FF73B9","#848484","#CECECE"],['LTE','WCDMA','UMTS','GSM','Roam'],'None','left'];
    legendTable['other'] = [['green','orange','red'],['Okay','Warning','Degraded'],'None','left']; //blank leg_type
    legendTable['RootMetrics_Map'] = [['#BAE294','#F4B765','#F38871','#888888','#FFFFFF'],['Good','Fair','Poor','Bad','Untested'],'None','left']; //blank leg_type
    legendTable['TMo_Verified_Map'] = [["#FFFFFF"],['Coverage'],'None','left'];
    legendTable['EchoLocate_Drop'] = [['rgb(0,255,0)','red','#FFFFFF'],[' <= 0.9 %', '> 0.9 %','Untested'],'None','left']; //blank leg_type    
    legendTable['EchoLocate_AccessFailure'] = [['rgb(0,255,0)','red','#FFFFFF'],[' <=3 %', '> 3 %','Untested'],'None','left']; //blank leg_type    
    legendTable['EchoLocate_AudioIssue'] = [['rgb(0,255,0)','red','#FFFFFF'],[' <= 3 %', '> 3 %','Untested'],'None','left']; //blank leg_type    
    legendTable['EchoLocate_SRVCC'] = [['rgb(0,255,0)','red','#FFFFFF'],[' <= 2.76', '> 2.76','Untested'],'None','left']; //blank leg_type        

    legendTable['LTE'] = [["Purple", "Orange", "Blue"],['BAND-700', 'BAND-2100', 'BAND-1900'],'None','right'];   
    legendTable['UMTS'] = [["Orange", "Blue"],['BAND-2100', 'BAND-1900'],'None','right'];      
    legendTable['GSM'] = [["Blue"],['BAND-1900'],'None','right'];  
    legendTable['pci'] = [["White"],['0'],'None','right'];     
    legendTable['Voice_Drops_Raw'] = [["green", "YellowGreen", "yellow", "orange", "red"],[' <= 10 Drops', '> 10 Drops ~ <= 20 Drops', '> 20 Drops ~ <= 30 Drops', '> 30 Drops ~ <= 40 Drops','> 40 Drops'],'None','right'];
    legendTable['FeedBack'] = [["White"],['0'],'None','right'];   
    legendTable['Poor_EcNo'] = [["red"],['Degraded'],'None','right'];      
    legendTable['High_TX_Pwr_Usage'] = [["red"],['Degraded'],'None','right'];      
    legendTable['Poor_RTWP'] = [["red"],['Degraded'],'None','right'];      
 // console.log(leg_type);  
    if (!leg_type){
        for(var k = 0;k<legendTable['other'][0].length;k++){
            innerHtml+='<div style="height:25px;"><div class="legend-color-box" style="background-color:'+legendTable['other'][0][k]+';"></div><span style="line-height: 23px;">'+legendTable['other'][1][k]+'</span></div>';
        }        
    }
    else{
        for(var j = 0;j<legendTable[leg_type][0].length;j++){
            innerHtml+='<div style="height:25px;"><div class="legend-color-box" style="background-color:'+legendTable[leg_type][0][j]+';"></div><span style="line-height: 23px;">'+legendTable[leg_type][1][j]+'</span></div>';
        }
    }    
    innerHtml+='</div></div>';

    
    $('.legend-'+legendTable[leg_type][3]).html(innerHtml)

    if (legendTable[leg_type][3] == 'left') { $('.legend-left').css({'display':'block'}); }
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
  //  map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById("nav-menu"));
  //  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById("nav-sear")); 
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById("nav-dpicker"));
  //  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(document.getElementById("btnsl"));
  // Problem with TOP_CENTER so all TOP_LEFT
}
//Centers the viewport on a market
function mkt_center(mkt) {
    map.setCenter(new google.maps.LatLng(mkt_loc[mkt][0],mkt_loc[mkt][1]));
    map.setZoom(11);
    $('.market').html(mkt);
}
//Cleans a Tile Overlay layer and removes any bottom right control (usually the legend)
function cleanlayer() {
    map.overlayMapTypes.clear();
 //   map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();
    if (GISListener) { GISListener.remove(); }
    if (RootMetricListener) {RootMetricListener.remove(); }
    
 
     if ($(".icon-bar-left").css( "left" ) == '200px' ) { 
        $('.legend-left').css({'display':'none', 'left':'200px', 'bottom':'60px', 'top': 'auto'});
     } else {
        $('.legend-left').css({'display':'none', 'left':'0px', 'bottom':'60px', 'top': 'auto'}); 
     }   
          
     
     
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
    
    if (maptype == 'RootMetrics_Map'){
        // RootMetric info
        RootMetricListener = map.addListener('click', function(e) {

            require( ["rm.projections"], function( rmProjections ) {
                // convert point.latLng to hexId
                var hexId = rmProjections.helpers.googLatLngToHexId(e.latLng);
                console.log('hexId: ' + hexId);
                           
              // console.log('hexId:22 ' + hexId); //only load when is required (http://requirejs.org/)
                var ajaxUrl = "http://stats.tilesgridv2.rootmetrics.com/tilesgrid/api/v2/hex" + "/perf/" + hexId + "/stats";
                //Using Callback
                $.ajax({
                    url: ajaxUrl,
                    type: "GET",
                    dataType : "json",
                    error: function( xhr, status, errorThrown ) {
                        alert( "Sorry, there was a problem!" );
                        console.log( "Error: " + errorThrown );
                        console.log( "Status: " + status );
                        console.dir( xhr );
                    },
                    success:  function (data) {
                        //loop and get key/value pair for JSON array
                        //console.log(data.carriers);

                        i=0;
                        var ObjRow = {1:['&nbsp', '&nbsp', '&nbsp'],2:['&nbsp', '&nbsp', '&nbsp'],3:['&nbsp', '&nbsp', '&nbsp'],4:['&nbsp', '&nbsp', '&nbsp']};    
                        for (var prop in data.carriers) {
                            if (prop <= 4 ) {
                                
                                console.log(prop + " is " + data.carriers[prop]['name']);
                            
                                if ('data' in data.carriers[prop]) {
                                    if ('LTE' in data.carriers[prop]['data']) {
                                        console.log('LTE' + " is " + data.carriers[prop]['data']['LTE']['recv_max_kbps']+' kbps');
                                        ObjRow[prop][1] += Math.round(100*data.carriers[prop]['data']['LTE']['recv_max_kbps']/1024)/100 +'(LTE) <br>';
                                    }                           
         
                                    if ('3G+' in data.carriers[prop]['data']) {
                                        console.log('3G+' + " is " + data.carriers[prop]['data']['3G+']['recv_max_kbps']+' kbps');
                                        ObjRow[prop][1] += Math.round(100*data.carriers[prop]['data']['3G+']['recv_max_kbps']/1024)/100 +'(3G+) <br>';                                        
                                    }         

                                    if ('2G/3G' in data.carriers[prop]['data']) {
                                        console.log('2G/3G' + " is " + data.carriers[prop]['data']['2G/3G']['recv_max_kbps']+' kbps');
                                        ObjRow[prop][1] += Math.round(100*data.carriers[prop]['data']['2G/3G']['recv_max_kbps']/1024)/100 +'(2G/3G) <br>';
                                    }                                     
                                }
                                
                                if ('sig' in data.carriers[prop]) {
                                    if ('sig' in data.carriers[prop]['sig']) {
                                        console.log('Signal Level' + " is " + data.carriers[prop]['sig']['sig']['avg']+' dBm');
                                        ObjRow[prop][0] = data.carriers[prop]['sig']['sig']['avg'];
                                    }
         
                                    if ('best_tech' in data.carriers[prop]['sig']) {
                                        console.log('Best Tech Avaliable' + " is " + data.carriers[prop]['sig']['best_tech']);
                                        ObjRow[prop][2] = data.carriers[prop]['sig']['best_tech'];
                                    }
                                    
                                }  
                            }
                        }
                        
                        
                       console.log(ObjRow);

                        var strpan ='<table class="table table-hover"> \
                                        <thead> \
                                            <tr> \
                                                <th></th> \
                                                <th class="text-center"><img src="images/att.png" alt="AT&T" width=32 height=32></th> \
                                                <th class="text-center"><img src="images/sprint.png" alt="Sprint" width=32 height=32</th> \
                                                <th class="text-center"><img src="images/tmobile.png" alt="T-Mobile" width=42 height=22</th> \
                                                <th class="text-center"><img src="images/verizon.png" alt="Verizon" width=42 height=22</th> \
                                            </tr> \
                                        </thead> \
                                        <tbody> \
                                            <tr> \
                                                <th scope="row">Ave Signal (dBm)</th> \
                                                <td class="text-center">'+ObjRow[1][0]+'</td> \
                                                <td class="text-center">'+ObjRow[2][0]+'</td> \
                                                <td class="text-center">'+ObjRow[3][0]+'</td> \
                                                <td class="text-center">'+ObjRow[4][0]+'</td> \
                                            </tr> \
                                            <tr> \
                                                <th scope="row">Tested Max Throughput (Mbps)</th> \
                                                <td class="text-center">'+ObjRow[1][1]+'</td> \
                                                <td class="text-center">'+ObjRow[2][1]+'</td> \
                                                <td class="text-center">'+ObjRow[3][1]+'</td> \
                                                <td class="text-center">'+ObjRow[4][1]+'</td> \
                                            </tr> \
                                            <tr> \
                                                <th scope="row">Best Tech Available</th> \
                                                <td class="text-center">'+ObjRow[1][2]+'</td> \
                                                <td class="text-center">'+ObjRow[2][2]+'</td> \
                                                <td class="text-center">'+ObjRow[3][2]+'</td> \
                                                <td class="text-center">'+ObjRow[4][2]+'</td> \
                                            </tr> \
                                        </tbody> \
                                    </table>';
                        infowindow.setContent(strpan);
                        infowindow.setPosition(e.latLng);
                        infowindow.open(map);
                        
                        
                        
                        

                    }
                });   
                
            });

        });    
    
    
    }
    
    
    
}



//Add any Geoserver layer
function geosrv(maptype){
    cleanlayer(); //Clean Layer
    legend(maptype);
    //Define custom WMS layer for census output areas in WGS84
    var geoserverLayer =
     new google.maps.ImageMapType(
     {
       getTileUrl:
      function (coord, zoom) {
        // Compose URL for overlay tile
 
        var s = Math.pow(2, zoom);  
        var twidth = 256;
        var theight = 256;
 
        //latlng bounds of the 4 corners of the google tile
        //Note the coord passed in represents the top left hand (NW) corner of the tile.
        var gBl = map.getProjection().fromPointToLatLng(
          new google.maps.Point(coord.x * twidth / s, (coord.y + 1) * theight / s)); // bottom left / SW
        var gTr = map.getProjection().fromPointToLatLng(
          new google.maps.Point((coord.x + 1) * twidth / s, coord.y * theight / s)); // top right / NE
 
        // Bounding box coords for tile in WMS pre-1.3 format (x,y)
        var bbox = gBl.lng() + "," + gBl.lat() + "," + gTr.lng() + "," + gTr.lat();
 
        //base WMS URL
        var url = "http://10.2.4.212:8080/geoserver/truecall/wms?";
 
        url += "&service=WMS";           //WMS service
        url += "&version=1.1.0";         //WMS version 
        url += "&request=GetMap";        //WMS operation
        url += "&layers=truecall:seattle"; //WMS layers to draw
        url += "&styles=truecall:" + maptype;   //use default style
        url += "&format=image/png";      //image format
        url += "&TRANSPARENT=TRUE";      //only draw areas where we have data
        url += "&srs=EPSG:4326";         //projection WGS84
        url += "&bbox=" + bbox;          //set bounding box for tile
        url += "&width=256";             //tile size used by google
        url += "&height=256";
        //url += "&tiled=true";
 
        return url;                 //return WMS URL for the tile  
      }, //getTileURL
 
      tileSize: new google.maps.Size(256, 256),
      opacity: 0.85,
      isPng: true
     });
 
    // add WMS layer to map
    // google maps will end up calling the getTileURL for each tile in the map view
    map.overlayMapTypes.push(geoserverLayer);  
    
    // GIS info
       GISListener = map.addListener('click', function(e) {
       
        var ajaxUrl = "http://10.2.4.212:8080/geoserver/truecall/wms?";
        ajaxUrl += "&service=WMS";           //WMS service
        ajaxUrl += "&version=1.1.0";         //WMS version 
        ajaxUrl += "&request=GetFeatureInfo";        //WMS operation
        ajaxUrl += "&layers=truecall:seattle"; //WMS layers to draw
        ajaxUrl += "&styles=truecall:" + maptype;   //use default style
        ajaxUrl += "&srs=EPSG:4326";         //projection WGS84
        ajaxUrl += "&bbox=" + (e.latLng.lng()-1/100000) + "," + (e.latLng.lat()-1/100000) + "," + e.latLng.lng() + "," + e.latLng.lat();         //set bounding box for tile
        ajaxUrl += "&width=256";             //tile size used by google
        ajaxUrl += "&height=256";       
        ajaxUrl += "&query_layers=truecall:seattle";   
        ajaxUrl += "&X=50&Y=50";
        ajaxUrl += "&info_format=text/javascript"; 
        ajaxUrl += "&format_options=callback:processJSON"; 

       // console.log(ajaxUrl);
        
        //Using Callback
        $.ajax({
            url: ajaxUrl,
            type: "GET",
            dataType : "jsonp",
            error: function( xhr, status, errorThrown ) {
                alert( "Sorry, there was a problem!" );
                console.log( "Error: " + errorThrown );
                console.log( "Status: " + status );
                console.dir( xhr );
            },
            jsonpCallback: 'processJSON',
            success: handleJson
        });

        function handleJson(data) {
            //loop and get key/value pair for JSON array  
            var str = ['&nbsp', '&nbsp', '&nbsp']; // new Array(3);
            i=0;
            for (var prop in data.features[0].properties) {
               // console.log(prop + " is " + data.features[0].properties[prop]);
                if (prop!=='WKT') {
                    if (i <= 12) {
                        str[0] += '<tr><td>'+ prop + '</td><td>'+ data.features[0].properties[prop] + '</td></tr>';
                    } else if (i > 12 && i <= 24 ) {
                        str[1] += '<tr><td>'+ prop + '</td><td>'+ data.features[0].properties[prop] + '</td></tr>';
                    } else if (i > 24 && i <= 36 )  {
                        str[2] += '<tr><td>'+ prop + '</td><td>'+ data.features[0].properties[prop] + '</td></tr>';
                    }                    
                }
                if (i === 36) { break; }
                i++;
            }        
           for (j=0; j < 3; j++) {
                str[j] = '<table class="table table-condensed">' + str[j] + '</table>';
            }
            strpan = '        <div class="TrueCallinfo"> <div role="tabpanel"> \
                                <!-- Nav tabs --> \
                                <ul class="nav nav-tabs" role="tablist">\
                                    <li role="presentation" class="active"><a href="#1" aria-controls="1" role="tab" data-toggle="tab">1</a></li>\
                                    <li role="presentation"><a href="#2" aria-controls="2" role="tab" data-toggle="tab">2</a></li>\
                                    <li role="presentation"><a href="#3" aria-controls="3" role="tab" data-toggle="tab">3</a></li>\
                                </ul>\
                                <!-- Tab panes -->\
                                <div class="tab-content">\
                                    <div role="tabpanel" class="tab-pane active" id="1">'+str[0]+'\
                                    </div>\
                                    <div role="tabpanel" class="tab-pane" id="2">'+str[1]+'\
                                    </div>\
                                    <div role="tabpanel" class="tab-pane" id="3">'+str[2]+'\
                                    </div>\
                                </div>\
                            </div></div>';
            infowindow.setContent(strpan);
            infowindow.setPosition(e.latLng);
            infowindow.open(map);
        }  
    });
    
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


//populates the sectors onto the map
function secDraw222() {
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var zoom=  map.getZoom() ;

    if (!$.isEmptyObject(secPolyTemp)) {
        for (i=0; i<secPolyTemp.length; i++) 
        {                           
            secPolyTemp[i].setMap(null);
        }
        secPolyTemp = [];
        sectorPolygons = [];
        secSQL = [];
    }
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();    
    if (zoom > 10) {
        var start = performance.now();
        
        var tech = $('input:radio[name=opttech]:checked').val();
        $('#nav-tech').html(tech)
        
        var j = 0;
        $.getJSON("php/sector.php?TECH="+tech+"&N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(), function(data) {
            for (var i=0; i< data['sector'].length; i++) {
                var centerPoint = new google.maps.LatLng(data['sector'][i]['Lat'], data['sector'][i]['Log']);
                var cellname = data['sector'][i]['lncel_name'];
                var layer = data['sector'][i]['layer'];
                var layerProperty = $.grep(secProperty[tech], function(e){ return e.layer === layer; });
                var size;
                //console.log(layer);
                if (!jQuery.isEmptyObject(layerProperty)) { //More Layer definied
                    var arcPts = circleMath(centerPoint,data['sector'][i].azimuth, 75, layerProperty[0].size);
                    var secPoly = new google.maps.Polygon({
                        paths: arcPts,
                        strokeOpacity:0,
                        fillOpacity:0
                    });
                    secPolyTemp.push(secPoly);
                    sectorPolygons.push([secPoly, cellname]);
                    secSQL.push("'"+cellname+"'");
                   //console.log(arcPts);
                    google.maps.event.addListener(secPoly, 'click', infoWindowSparklineShow('sector',[i,data]));
                    
                }
            }

            //Show Sectors
     (function SectorLoop (i, data) {
              //  console.log(i);
               // console.log(data);
                setTimeout(function () {   
                    while (i%500 != 0 && i>-1) {   
                        data[i][0].setOptions({
                    
                            map: map
                        });
                        --i
                    }
                    if (--i>-1) {SectorLoop(i,data)};      
                }, 1);
            })(sectorPolygons.length-1,sectorPolygons);
            
            //Verify style
            changeSectorStyle(secSQL.toString(),sectorPolygons,style_,CurrentDate,query_, tech);    
      
        });
        var end = performance.now();
        var time = end - start;
       //console.log('Execution time: ' + time + ' ms.');

    }
}


function myLoop (i, j,data) {           //  create a loop function
    setTimeout(function () {   
        while ( i%100 != 0 && i>=j) {   
            data[i][0].setOptions({
                map: map
            });
            --i
        }
        if (--i>=j) {myLoop(i,j,data)};      
    }, 1);
}

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
        }
        secPolyTemp = [];
        sectorPolygons = [];
        secSQL = [];
        clearTimeout(secMap);
    }
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();    
    if (zoom > 10) {
        var start = performance.now();
        var tech = $('input:radio[name=opttech]:checked').val();
        $('#nav-tech').html(tech);
        $.getJSON("php/sector.php?TECH="+tech+"&N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(), function(data) {
            var Allsector_= data['sector'].slice();
                     if (seDrawStatus == 0) {
                        seDrawStatus = 1; } else {
                        seDrawStatus = 0;
                        return;
                    }                
            var j = 0;
            secMap = setTimeout(function(){
                var i = 0;
                while (i<1000 && Allsector_.length > 0) {
                    var sector_ = Allsector_.shift(); 
                    //console.log(sector_)
                    var centerPoint = new google.maps.LatLng(sector_['Lat'], sector_['Log']);
                    var cellname = sector_['lncel_name'];
                    var layer = sector_['layer'];
                    var layerProperty = $.grep(secProperty[tech], function(e){ return e.layer === layer; });
                    var size;
                    //console.log(layer);
                    if (!jQuery.isEmptyObject(layerProperty)) { //More Layer definied
                        var arcPts = circleMath(centerPoint,sector_.azimuth, 75, layerProperty[0].size);
                        var secPoly = new google.maps.Polygon({
                            paths: arcPts
                            ,strokeWeight: 0.1
                            ,fillOpacity:0.1
                            ,map:map
                        });
                        secPolyTemp.push(secPoly);
                        sectorPolygons.push([secPoly, cellname]);
                        secSQL.push("'"+cellname+"'");
                       //console.log(arcPts);
                        google.maps.event.addListener(secPoly, 'click', infoWindowSparklineShow('sector',[j,data],tech));
                    }
                    i++;
                    j++;
                }
                if(Allsector_.length > 0 && seDrawStatus==1) {
                     secMap = setTimeout(arguments.callee,25);
                }else{
                    changeSectorStyle(secSQL.toString(),sectorPolygons,style_,CurrentDate,query_, tech);
                    seDrawStatus = 0;                    
                }
            },25)
        });
        var end = performance.now();
        var time = end - start;
       console.log('Execution time: ' + time + ' ms.');
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

function btnpicker(step_) {
    if (step_=='d'){
        --days_;
    } else {
        if (days_ < -1)  {
            ++days_;
        }
    }
    $('#dpicker').data("DateTimePicker").date(moment().add(days_, 'days'));
    //console.log($('#dpicker').data("DateTimePicker").date().format('MM/DD/YY'));
    //$('#dpicker').attr("value", moment().add(days_, 'days').format('MM/DD/YY'));
    //$('#dpicker').data("DateTimePicker").date('2012-08-08');
}

//populates the sectors onto the map using GeoJSON
function secDraw_GeoJSON() {
    console.log('GeoJSON');
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var zoom=  map.getZoom() ;
 /*   if (!$.isEmptyObject(secPolyTemp)) {
        for (i=0; i<secPolyTemp.length; i++) 
        {                           
            secPolyTemp[i].setMap(null); //or line[i].setVisible(false);
         // google.maps.event.removeListener(listener[i]);
          //  mapLabelTemp[i].setMap(null);
        }
        secPolyTemp = [];
        sectorPolygons = [];
        secSQL = [];
    }
*/    
    
    map.data.setMap(null);
    map.data = new google.maps.Data({map:map}); 
    map.data.setMap(map);    
    
    if (zoom > 10) {
        var scale = 1
        if (zoom == 11) {
            scale = 6;
        } else if (zoom >= 12 && zoom <= 14 ) {
            scale = 4;
        } else if (zoom >= 15 && zoom <= 15 )  {
            scale = 2;
        }
        
        var start = performance.now();
        
        $.getJSON("php/sector_geoJSON.php?TECH=UMTS&N="+NE.lat()+"&E="+NE.lng()+"&S="+SW.lat()+"&W="+SW.lng(), function(data) {
            for (var i=0; i< data['features'].length; i++) {
                var centerPoint = new google.maps.LatLng(data['features'][i]['properties']['lat'], data['features'][i]['properties']['log']);
                var cellname = data['features'][i]['properties']['lncel_name'];
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
                
             
              data['features'][i]['geometry'] = circleMath_geoJSON(centerPoint,data['features'][i]['properties'].azimuth, 75,scale*size);
             //  data['features'][i]['geometry'] = circleMath_geoJSON(centerPoint,data['features'][i]['properties'].azimuth, 75,scale*size);

              /*  var arcPts = circleMath(centerPoint,data['features'][i]['properties'].azimuth, 75,scale*size);
                var secPoly = new google.maps.Polygon({
                    paths: arcPts,
                    strokeColor:'#585555',
                    strokeOpacity:1,
                    strokeWeight: 0.6,
                    fillColor: "#F57D2F",
                    fillOpacity:0,
                    zIndex: stack_ //stack order
                    map: map
                }); */

            }
         
          map.data.setStyle({
            strokeColor:'#585555',
            strokeOpacity:1,
            strokeWeight: 0.6,
            fillColor: "#F57D2F",
            fillOpacity:1
              
          });          
          map.data.addGeoJson(data);

//console.log(JSON.stringify(data));

//var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(data));
//window.open(url, '_blank');
//window.focus();
        
          
        });
        var end = performance.now();
        var time = end - start;
       console.log('Execution time: ' + time + ' ms.');
        
    }
}


function initialSector(){
     query_ = 0;
     secDraw();
   
}





