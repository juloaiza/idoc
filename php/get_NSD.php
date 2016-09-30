<?php
    // Module to get L700 layer (planning sites)

    include("connection.php");  //get db connection
    
    $query = "SELECT `Site_Ranking` as SiteID,`Lat`,`Long`,`Total_POPs` as POPs,`City` FROM `NSD` "; //replace emp_info with your table name
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
            $json['NSD'][]=array(
            'SiteID'=>$row['SiteID'],
            'Total_POPs'=>$row['POPs'],
            'City'=>$row['City'],
            'Lat'=>$row['Lat'],
            'Log'=>$row['Long']
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>