define('rm.projections', function(){
    
    part1by1_masks = [
        new goog.math.Long(0xFFFFFFFF, 0),
        new goog.math.Long(0x0000FFFF, 0x0000FFFF),
        new goog.math.Long(0x00FF00FF, 0x00FF00FF),
        new goog.math.Long(0x0F0F0F0F, 0x0F0F0F0F),
        new goog.math.Long(0x33333333, 0x33333333),
        new goog.math.Long(0x55555555, 0x55555555)
    ];
    
    math = {
        clamp: function (value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        mod: function (dividend, divisor) {
            // Mod function, with result that has same sign as the divisor
            return ((dividend%divisor)+divisor)%divisor;
        },
        _part1by1: function(n) {
            n = new goog.math.Long(n, 0);
            n = n.and(part1by1_masks[0]);
            n = n.or(n.shiftLeft(16)).and(part1by1_masks[1]);
            n = n.or(n.shiftLeft(8)).and(part1by1_masks[2]);
            n = n.or(n.shiftLeft(4)).and(part1by1_masks[3]);
            n = n.or(n.shiftLeft(2)).and(part1by1_masks[4]);
            n = n.or(n.shiftLeft(1)).and(part1by1_masks[5]);
            return n;
        },

        _unpart1by1: function(n) {
            n = n.and(part1by1_masks[5]);
            n = n.xor(n.shiftRightUnsigned(1)).and(part1by1_masks[4]);
            n = n.xor(n.shiftRightUnsigned(2)).and(part1by1_masks[3]);
            n = n.xor(n.shiftRightUnsigned(4)).and(part1by1_masks[2]);
            n = n.xor(n.shiftRightUnsigned(8)).and(part1by1_masks[1]);
            n = n.xor(n.shiftRightUnsigned(16)).and(part1by1_masks[0]);
            return n.toInt();
        },
        
        interleave2: function(x, y) {
            return math._part1by1(x).or(math._part1by1(y).shiftLeft(1)).toString();
        },
    
        deinterleave2: function(n) {
            n = goog.math.Long.fromString(n);
            return [math._unpart1by1(n), math._unpart1by1(n.shiftRightUnsigned(1))];
        }
    }
    
    function LonLat(lon, lat){
        this.lon = lon;
        this.lat = lat;
    }
    
    LonLat.prototype.toString = function (){
        return "LonLat(lon=" + this.lon + ", lat=" + this.lat + ")";
    }
    
    LonLat.prototype.toGoogLatLng = function() {
        return new google.maps.LatLng(this.lat, this.lon);        
    }
    
    LonLat.fromGoogLatLng = function(googLatLng) {
        return new LonLat(googLatLng.lng(), googLatLng.lat()); 
    }
    
    var MinLatitude = -85.05112878;
    var MaxLatitude = 85.05112878;
    var MinLongitude = -180;
    var MaxLongitude = 180;
    
    function PixelXY(x, y){
        this.x = x;
        this.y = y;
    }
    
    PixelXY.prototype.toString = function (){
        return "PixelXY(x=" + this.x + ", y=" + this.y + ")";
    }
    
    PixelXY.fromLonLat = function(lonlat) {
        var zoom = 23;   
        var latitude = math.clamp(lonlat.lat, MinLatitude, MaxLatitude);
        var longitude = math.clamp(lonlat.lon, MinLongitude, MaxLongitude);
        
        var x = (longitude + 180.0) / 360.0; 
        var sinLatitude = Math.sin(latitude * Math.PI / 180.0);
        var y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);
    
        var mapSize = PixelXY.getMapSize(zoom);
        var pixelX = math.clamp(x * mapSize + .5, 0, mapSize - 1) | 0;
        var pixelY = math.clamp(y * mapSize + .5, 0, mapSize - 1) | 0;
        pixelX = Math.floor(pixelX);
        pixelY = Math.floor(pixelY);
        return new PixelXY(pixelX, pixelY);
    }
    
    
    PixelXY.getMapSize = function(levelOfDetail) {
        return 256 << levelOfDetail >>> 0;
    } 
  
    PixelXY.prototype.toLonLat = function() {
        point = this;
        var zoom = 23;   
        var mapSize = PixelXY.getMapSize(zoom);
        var pixelx = math.mod(point.x, mapSize + 1);
        var x = (pixelx / mapSize) - 0.5;
        var y = 0.5 - (point.y / mapSize);
        
        latitude = 90.0 - 360.0 * Math.atan(Math.exp(-y * 2.0 * Math.PI)) / Math.PI;
        longitude = 360.0 * x;
        return new LonLat(longitude, latitude);
    }
    
    PixelXY.prototype.toGoogLatLng = function() {
        return this.toLonLat().toGoogLatLng();     
    }
    
    PixelXY.fromGoogLatLng = function(googLatLng) {
        return PixelXY.fromLonLat(LonLat.fromGoogLatLng(googLatLng));
    }
    
    maxPixelX = (1 << 31 >>> 0) - 1;
    maxPixelY = (1 << 31 >>> 0) - 1;
    
    
    

    //For perfect hexagons, narrow_width = hex_width * ¾ ; height = hex_width * ½ * √3.
    // hex_width = hex_height * .5 * sqrt(3)
    // height = centerToEdge/sqrt(3)
    
    // Table of accuracies: http://msdn.microsoft.com/en-us/library/bb259689.aspx
    var hexLevelOfDetail = 9;
    var hex_width = 1 << (23 - hexLevelOfDetail) >>> 0; // radius to edge * 2, 31 bits to store accuracy, 8 bits are implicit in every zoom level, so the width of the tile in pixels is max accuracy zoom level (23) - the accuracy of tile we want (every ___). 
    var centerToEdge = hex_width / 2.0;  // center to edge distance
    var centerToCorner = 2.0 *centerToEdge / Math.sqrt(3.0);  // center to corner distance
    
    var maxHexX = ((1 << 31 >>> 0) / hex_width) - 1;
    //centerToEdge = 2.0;
    //centerToCorner = 2.0*centerToEdge/Math.sqrt(3.0);
    var T = centerToCorner / 2.0;
    
    var X = [
      [0.0, centerToEdge], 
      [-centerToCorner, centerToCorner/2.0]
    ];
    var XM = [
      [1.0/(2.0*centerToEdge),  -1.0/centerToCorner],
      [1.0/centerToEdge,        0.0  ]
    ];
    
    var Y = [
      [centerToEdge,    -centerToEdge],
      [centerToCorner/2.0,  centerToCorner/2.0]
    ];
    var YM = [
      [ 1.0/(2.0*centerToEdge), 1.0/centerToCorner],
      [-1.0/(2.0*centerToEdge), 1.0/centerToCorner]
    ];
    
    vmath = {
        multiply: function (v, value){
            return new google.maps.Point(v.x * value, v.y * value);
        },    
        divide: function (v, value){
            return new google.maps.Point(v.x / value, v.y / value);
        },
        floorDot: function (v, mtx) {
            var j = Math.floor(mtx[0][0]*v.x + mtx[0][1]*v.y);
            var k = Math.floor(mtx[1][0]*v.x + mtx[1][1]*v.y);
            return new google.maps.Point(j, k)
        } 
    }
    
    function Hex(x, y){
        this.x = x;
        this.y = y;
    }
    
    Hex.prototype.toString = function (){
        return "Hex(x=" + this.x + ", y=" + this.y + ")";
    }
    
    Hex.prototype.toPixelXY = function (){
        var v = this.y;
        var u = this.x - Math.floor(v  / 2);
        var p = new PixelXY(math.mod(u*(2*centerToEdge) + v*centerToEdge, maxPixelX + 1), v*(centerToCorner+T));
        //p = vmultiply(p, SCALE)
        p.x = Math.floor(p.x) | 0;
        p.y = Math.floor(p.y) | 0;
        return p;
    }
    Hex.fromPixelXY = function (pixelxy){
        var pixelxy = new PixelXY(pixelxy.x, pixelxy.y);
        //var pointa = vdivide(pointa, SCALE)
        var Mi = vmath.floorDot(pixelxy, XM);
        var i = Math.floor((Mi.x+Mi.y+2.0)/3.0);
        
        var Mj = vmath.floorDot(pixelxy, YM);
        var j = Math.floor((Mj.x+Mj.y+2.0)/3.0);
         
        return new Hex(math.mod(i + Math.floor(j  / 2), maxHexX + 1) | 0, j | 0);
    }
    Hex.prototype.getPixelXYPolygon = function(){
        center = this.toPixelXY();
        return [
            (new PixelXY(center.x, center.y + centerToCorner)),
            (new PixelXY(center.x + centerToEdge, center.y + (centerToCorner/2))),
            (new PixelXY(center.x + centerToEdge, center.y - (centerToCorner/2))),
            (new PixelXY(center.x, center.y - centerToCorner)),
            (new PixelXY(center.x - centerToEdge, center.y - (centerToCorner/2))),
            (new PixelXY(center.x - centerToEdge, center.y + (centerToCorner/2)))
        ];        
    }
    Hex.prototype.getGoogLatLngPolygon = function(){
        return this.getPixelXYPolygon().map(function(value, index, array1){
                return value.toGoogLatLng();
            });
    }
    Hex.prototype.toHexId = function(){        
        return math.interleave2(this.x, this.y);
    }
    Hex.fromHexId = function(hexId){     
        parts = math.deinterleave2(hexId);
        return new Hex(parts[0], parts[1]);
    }
    Hex.width = hex_width;
    Hex.centerToEdge = centerToEdge;
    Hex.centerToCorner = centerToEdge;
    
    helpers = {        
        lonLatToHex: function (lonLat){
            return Hex.fromPixelXY(PixelXY.fromLonLat(lonLat));
        },        
        googLatLngToHex: function (googLatLng){
            return helpers.lonLatToHex(LonLat.fromGoogLatLng(googLatLng));
        },        
        lonLatToHexId: function (lonLat){
            return helpers.lonLatToHex(lonLat).toHexId();
        },        
        googLatLngToHexId: function (googLatLng){
            return helpers.googLatLngToHex(googLatLng).toHexId();
        }
    }
    
    return {
        LonLat: LonLat,
        PixelXY: PixelXY,
        Hex: Hex,
        math: math,
        maxHexX: maxHexX,
        helpers: helpers        
    }
})