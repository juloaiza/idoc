<?php
/**
* Title:   MySQL to GeoJSON
* Notes:   Query a MySQL table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
* Author:  Bryan R. McBride, GISP
* Contact: bryanmcbride.com
* GitHub:  https://github.com/bmcbride/PHP-Database-GeoJSON
*/

//Module to get Cell information
$N=$_GET['N'];
$E=$_GET['E'];    
$S=$_GET['S'];   
$W=$_GET['W'];  
$TECH=$_GET['TECH'];
include("connection.php");  //get db connection
 $query = "SELECT `siteid` AS site_name, concat(left(`CellName`,1), `siteid`) AS lnbts_name, `CellName` AS lncel_name, `lat`, `log`, `azimuth`, concat(left(`CellName`,1), right(`CellName`,1)) as layer FROM `physical_info_all` WHERE `technology` = '".$TECH."' AND `lat` BETWEEN ".$S." AND ".$N." AND `log` BETWEEN ".$W." AND ".$E." ORDER BY `layer` ASC, lncel_name"; //replace emp_info with your table name
//echo $query;
$result = mysqli_query($link, $query);

# Build GeoJSON feature collection array
$geojson = array(
    'type'      => 'FeatureCollection',
    'features'  => array()
);

# Loop through rows to build feature arrays
while($row= mysqli_fetch_assoc($result)){
    $properties = $row;
    $feature = array(
         'type' => 'Feature',
         'geometry' => '',
         'properties' => $properties
    );
    # Add feature arrays to feature collection array
    array_push($geojson['features'], $feature);        

}


header('Content-type: application/json');
echo json_encode($geojson, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>


