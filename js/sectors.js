var infowindow = new google.maps.InfoWindow(
    {
        size: new google.maps.Size(150,50)
    });
function circleMath(center, angle, beamWidth, size){
    var triangleCoords = [];
    var resolution = 32;
    var lat = center.lat();
    var lon = center.lng();
    angle = (90-angle)*Math.PI/180;
    var width = beamWidth*Math.PI/180;
    var scale = size/Math.pow(2, map.getZoom()/1.5);
    triangleCoords.push(new google.maps.LatLng(lat,lon));
    for (var m = 0; m<resolution; m++){
        var xcomp = scale*(Math.cos(angle-width/2+width*m/(resolution-1)))/Math.cos(lat*Math.PI/180);
        var ycomp = scale*(Math.sin(angle-width/2+width*m/(resolution-1)));
        triangleCoords.push(new google.maps.LatLng(lat+ycomp,lon+xcomp));
    }
    triangleCoords.push(new google.maps.LatLng(lat,lon));
    return triangleCoords;
}
function cellMidpoint(lat,lon,angle,type){
    var scale = .0007;
    angle = (90-angle)*Math.PI/180;
    if (type=='lon') {
        return lon + scale * (Math.cos(angle)) / Math.cos(lat * Math.PI / 180);
    }
    else{
        return lat + scale*(Math.sin(angle));
    }

}
function changeSectorFormat(i,strokeWidth,strokeColor){
    sectorPolygons[i][0].setOptions({
        strokeColor: strokeColor,
        strokeWeight: strokeWidth
    });
}


function changeSectorStyle(sec,sectorObj,styleColor, date_, queryT_, tech_){
    $.ajax({   //ajax take the content and put in data after done
        url:'php/style.php',
        type: "POST", // Using POST to avoid error 414 with GET
        dataType : "json",  // The type of data we expect back
        data: { secSQL: sec, style: styleColor, date: date_, query: queryT_, tech: tech_}, //Passing data. Use serialize when use Form
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    }).done(function(data){
        off = 0
        if (styleColor == 'VOICE_DROPS_RAW_SEV' || styleColor == 'FEEDBACK') {
            off = 0;
        }
        else{
            off = 3
        }

        if (queryT_ === 0) {legend(tech_);}
        if (queryT_ === 1) {legend( $('input:radio[name=options3G]:checked').val());}    

        for(var j=0;j<sectorPolygons.length;j++){
            if (queryT_ === 0) {
                var layer = data[sectorPolygons[j][1]];
                var layerProperty = $.grep(secProperty[tech_], function(e){ return e.layer === layer; });                
                sectorPolygons[j][0].setOptions({
                    strokeColor:'#585555',
                    strokeOpacity:1,
                    strokeWeight: 0.6,
                    fillColor: layerProperty[0].color,
                    fillOpacity:1
                    //zIndex: layerProperty[0].stack //stack orde
                   //,map: map
                });
            } else {
                sectorPolygons[j][0].setOptions({
                    fillColor: (queryT_ === 1 ? colorPalette[data[sectorPolygons[j][1]] + off]:'#' + Math.floor(Chance(data[sectorPolygons[j][1]]).random()*16777215).toString(16)),
                    fillOpacity: (typeof data[sectorPolygons[j][1]] === 'undefined' ? 0:(colorPalette[data[sectorPolygons[j][1]]] === 'green' ? 0:1)),
                    strokeColor:(queryT_ === 1 ? colorPalette[data[sectorPolygons[j][1]]]:'#585555'),
                    strokeOpacity:(typeof data[sectorPolygons[j][1]] === 'undefined' ? 0.2:1),
                    strokeWeight: (colorPalette[data[sectorPolygons[j][1]]] === 'green' ? 0.2:0.6)
                    //,map: map
                });
            }
           
            //Adding label 
            (function(j,value_) {
                google.maps.event.addListener(sectorPolygons[j][0],'mouseover',function(e){
                    var mapLabel = new MapLabel({
                        text: value_.toString(),
                        position:  e.latLng,
                        fontSize: 10,
                        align: 'center',
                        map: map                        
                    });
                    //Removing label 
                    google.maps.event.addListenerOnce(sectorPolygons[j][0],'mouseout', function(){
                        mapLabel.setMap(null);
                    });
                });
            })(j,sectorPolygons[j][1]+"-"+data[sectorPolygons[j][1]]);            
        }
    });    
}

//Get random colors
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


//geoJSON
function circleMath_geoJSON(center, angle, beamWidth, size){
    var triangleCoords = [];
    var resolution = 32;
    var decimals = 10000000000;
    var lat = Math.round(center.lat()*decimals)/decimals;
    var lon = Math.round(center.lng()*decimals)/decimals;
    angle = (90-angle)*Math.PI/180;
    var width = beamWidth*Math.PI/180;
    var scale = .0007*size;
    triangleCoords.push([lon,lat]);
    for (var m = 0; m<resolution; m++){
        var xcomp = Math.round(scale*(Math.cos(angle-width/2+width*m/(resolution-1)))/Math.cos(lat*Math.PI/180)*decimals)/decimals;
        var ycomp = Math.round(scale*(Math.sin(angle-width/2+width*m/(resolution-1)))*decimals)/decimals;
        triangleCoords.push([lon+xcomp,lat+ycomp]);
    }
    triangleCoords.push([lon,lat]);
//console.log(triangleCoords);
    var geometry ={
        "type": "Polygon",
        "coordinates": [triangleCoords]
        };

    return geometry;
}