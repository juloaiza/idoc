<?php
    //Module to get Cell information
    $N=$_GET['N'];
    $E=$_GET['E'];    
    $S=$_GET['S'];   
    $W=$_GET['W'];  
    $TECH=$_GET['TECH'];
    include("connection.php");  //get db connection
     $query = "SELECT `siteid` AS site_name, concat(left(`CellName`,1), `siteid`) AS lnbts_name, `CellName` AS lncel_name, `lat`, `log`, `azimuth` FROM `physical_info_all` WHERE `technology` = '".$TECH."' AND `lat` BETWEEN ".$S." AND ".$N." AND `log` BETWEEN ".$W." AND ".$E." ORDER BY `CellName` ASC"; //replace emp_info with your table name
   //echo $query;
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
            $json['sector'][]=array(
            'site_name'=>$row['site_name'],
            'lnbts_name'=>$row['lnbts_name'],
            'lncel_name'=>$row['lncel_name'],
            'Lat'=>$row['lat'],
            'Log'=>$row['log'],
            'azimuth'=>$row['azimuth']           
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>


