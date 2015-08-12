var infowindow = new google.maps.InfoWindow(
    {
        size: new google.maps.Size(150,50)
    });
//Returns an array of Google Maps points for a tower with radius r a
function circleMath(center, angle, beamWidth){
    var triangleCoords = [];
    var resolution = 32;
    var lat = center.lat();
    var lon = center.lng();
    angle = (90-angle)*Math.PI/180;
    var width = beamWidth*Math.PI/180;
    var scale = .0007;
    triangleCoords.push(new google.maps.LatLng(lat,lon));
    for (var m = 0; m<resolution; m++){
        var xcomp = scale*(Math.cos(angle-width/2+width*m/(resolution-1)))/Math.cos(lat*Math.PI/180);
        var ycomp = scale*(Math.sin(angle-width/2+width*m/(resolution-1)));
        triangleCoords.push(new google.maps.LatLng(lat+ycomp,lon+xcomp));
    }
    triangleCoords.push(new google.maps.LatLng(lat,lon));
    return triangleCoords;
}