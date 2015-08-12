/**
 * Extend the Number object to convert degrees to radians
 *
 * @return {Number} Bearing in radians
 * @ignore
 */
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};

/**
 * Extend the Number object to convert radians to degrees
 *
 * @return {Number} Bearing in degrees
 * @ignore
 */
Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
};

/**
 * Normalize a heading in degrees to between 0 and +360
 *
 * @return {Number} Return
 * @ignore
 */
Number.prototype.toBrng = function () {
    return (this.toDeg() + 360) % 360;
};

var infowindow = new google.maps.InfoWindow(
    {
        size: new google.maps.Size(150,50)
    });

function circleMath(center, bearing, radius){
    var triangleCoords = [];
    var resolution = 32;
    var lat = center.lat();
    var lon = center.lng();
    var angle = (90-bearing)*Math.PI/180;
    var width = 65*Math.PI/180;
    var scale = .0004;
        if(width < 6.2){
            triangleCoords.push(new google.maps.LatLng(lat,lon));
            scale = .001;
        }
        var m;
        for (m = 0; m<resolution; m++){
            var xcomp = scale*(Math.cos(angle-width/2+width*m/(resolution-1)))/Math.cos(lat*Math.PI/180);
            var ycomp = scale*(Math.sin(angle-width/2+width*m/(resolution-1)));
            triangleCoords.push(new google.maps.LatLng(lat+ycomp,lon+xcomp));
        }
        if(width < 6.2){
            triangleCoords.push(new google.maps.LatLng(lat,lon));
        }
    return triangleCoords;
}

function drawCircle(point, radius) {
    var d2r = Math.PI / 180;   // degrees to radians
    var r2d = 180 / Math.PI;   // radians to degrees
    var EarthRadiusMeters = 6378137.0; // meters
    var points = 32;

// find the raidus in lat/lon
    var rlat = (radius / EarthRadiusMeters) * r2d;
    var rlng = rlat / Math.cos(point.lat() * d2r);


    var extp = [];
    for (var i=0; i < points+1; i++) // one extra here makes sure we connect the
    {
        var theta = Math.PI * (i / (points/2));
        ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
        ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
        extp.push(new google.maps.LatLng(ex, ey));

    }
// alert(extp.length);
    return extp;
}