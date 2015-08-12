/* Based the on the Latitude/longitude spherical geodesy formulae & scripts
 at http://www.movable-type.co.uk/scripts/latlong.html
 (c) Chris Veness 2002-2010
 */

// === A function which returns the bearing between two LatLng in radians ===
// === If v1 is null, it returns the bearing between the first and last vertex ===
// === If v1 is present but v2 is null, returns the bearing from v1 to the next vertex ===
// === If either vertex is out of range, returns void ===
google.maps.LatLng.prototype.Bearing = function(otherLatLng) {
    var from = this;
    var to = otherLatLng;
    if (from.equals(to)) {
        return 0;
    }
    var lat1 = from.latRadians();
    var lon1 = from.lngRadians();
    var lat2 = to.latRadians();
    var lon2 = to.lngRadians();
    var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
    if ( angle < 0.0 ) angle  += Math.PI * 2.0;
    if ( angle > Math.PI ) angle -= Math.PI * 2.0;
    return parseFloat(angle.toDeg());
};
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


function drawArc(center, bearing, radius){
    var triangleCoords = [];
    var resolution = 36;
    var lat = center.lat();
    var lon = center.lng();
    var angle = (90-parseFloat(bearing))*Math.PI/180;
    var width = parseFloat(65)*Math.PI/180;
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

