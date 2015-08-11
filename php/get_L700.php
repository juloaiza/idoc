<?php
    // Module to get L700 layer (planning sites)

    include("connection.php");  //get db connection
    
    $query = "SELECT `SiteID`,`SiteName`,`Cluster`,`Site_Lat` AS lat,`Site_Long` AS log FROM `L700` "; //replace emp_info with your table name
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
            $json['L700'][]=array(
            'SiteID'=>$row['SiteID'],
            'SiteName'=>$row['SiteName'],
            'Cluster'=>$row['Cluster'],
            'Lat'=>$row['lat'],
            'Log'=>$row['log']
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>