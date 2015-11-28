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
    var scale = .0007*size;
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


function changeSectorStyle(sec,sectorObj,styleColor){
    $.ajax({   //ajax take the content and put in data after done
        url:'php/style.php',
        type: "POST", // Using POST to avoid error 414 with GET
        dataType : "json",  // The type of data we expect back
        data: { secSQL: sec}, //Passing data. Use serialize when use Form
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    }).done(function(data){
        for(var j=0;j<sectorPolygons.length;j++){
            sectorPolygons[j][0].setOptions({
                fillColor: colorValues[data[sectorPolygons[j][1]]],
                fillOpacity: 0.6,
                strokeOpacity:1
            });
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