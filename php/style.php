<?php
    //Module to get Cell information
    $secSQL=$_POST['secSQL'];
    include("connection.php");  //get db connection
     $query = "SELECT `CellName`, `existingelectilt` as edt FROM `physical_info_all` WHERE `CellName` in (".$secSQL.")"; //replace emp_info with your table name
   //echo $query;
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){
           $json[$row['CellName']] = $row['edt'];   
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>


