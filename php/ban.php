<?php

    $N=$_GET['N'];
    $E=$_GET['E'];    
    $S=$_GET['S'];    
    $W=$_GET['W'];   
    
    include("connection.php");  //get db connection
    
    $query = "SELECT `lat`, `lng` FROM `ban`  WHERE `lat` BETWEEN ".$S." AND ".$N." AND `lng`BETWEEN ".$W." AND ".$E." GROUP BY `lat`, `lng`"; //replace emp_info with your table name
//echo $query;   
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
            $json['ban'][]=array(
            'lat'=>$row['lat'],
            'lng'=>$row['lng']
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>