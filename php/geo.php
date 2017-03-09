<?php
    $site=$_GET['site'];
    include("connection.php");  //get db connection
    
    $subquery = "SELECT `siteid` AS site_name, `lat`, `log` FROM `physical_info_all` WHERE  MID(`siteid`,1,7)='".$site."' GROUP BY `siteid`, `lat`, `log` UNION SELECT `Site_Ranking` as site_name,`Lat` as lat,`Long` as log FROM `NSD`  WHERE  Site_Ranking='".$site."' ";
    $query ="SELECT * FROM (".$subquery.") AS geo WHERE `lat` IS NOT NULL"; //replace emp_info with your table name
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
            $json['site'][]=array(
            'site_name'=>$row['site_name'],
            'Lat'=>$row['lat'],
            'Log'=>$row['log'],
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>