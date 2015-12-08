<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection
    $query="SELECT `PERIOD_START_TIME` AS `date`,`WCEL_NAME` AS `CellName`,`VOICE_TRAFFIC`,`VOICE_ACC_FAIL_RATE`,`VOICE_DROP_RATE`,`VOICE_DROPS`,`DLR99DATATRAFFIC`,`HSDPATRAFFICVOLUME`,`PS_ACC_FAIL_RATE`,`PS_DROP_RATE`,`SOFT_HANDOVER_FAILURE_RATE`,`VOICE_TRAFFIC_SEV`,`VOICE_DROPS_RAW_SEV`,
    `FEEDBACK` AS `DIAGNOSTIC` FROM `umts_raw_kpi` WHERE `period_start_time` >= DATE_SUB(CURDATE(),INTERVAL 30 DAY)  AND `WCEL_NAME`='".$lncel."' ORDER BY `period_start_time` ASC";
    //echo $query;
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success
        $json = array();
        while($row = $result->fetch_array(MYSQL_ASSOC)) {
            $json[] = $row;
        }
        mysqli_free_result($result); //  frees the memory       
        mysqli_close($db_name); //close DB
        echo json_encode($json, JSON_NUMERIC_CHECK);        
    } else {
        
        echo "It failed";
    }
    
    
    
    
?>