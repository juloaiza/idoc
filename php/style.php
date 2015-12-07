<?php
    //Module to get Cell information
    $secSQL=$_POST['secSQL'];
    $style=$_POST['style'];   //kpi,parameter,value 
    $date=$_POST['date'];
    include("connection.php");  //get db connection
    //$query = "SELECT `CellName`, `existingelectilt` as style FROM `physical_info_all` WHERE `CellName` in (".$secSQL.")"; //replace emp_info with your table name
    $query = "SELECT `WCEL_NAME` as CellName, `".$style."` AS style FROM `umts_raw_kpi` WHERE `period_start_time` = '".$date."' AND `WCEL_NAME` in (".$secSQL.")";
   //echo $query;
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
           $json[$row['CellName']] = $row['style'];   
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>


