<?php

    include("connection.php");  //get db connection
    
    $query = "SELECT `Technology`,`SR_Created_Date`, `Issue_Type`,`Issue_Description`,`Mobile_Number`,`Latitude`,`Longitude` FROM `SRs`"; //replace emp_info with your table name
    $result = mysqli_query($link, $query);
    $json = array();
    
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){

            $json['srs'][]=array(
            'Technology'=>$row['Technology'],
            'SR_Created_Date'=>$row['SR_Created_Date'],
            'Issue_Type'=> (strpos($row['Issue_Type'],'(')>0 ? substr($row['Issue_Type'],0,strpos($row['Issue_Type'],'(')-1) : $row['Issue_Type']),
            'Issue_Description'=>$row['Issue_Description'],
            'Mobile_Number'=>$row['Mobile_Number'],            
            'Lat'=>$row['Latitude'],
            'Log'=>$row['Longitude'],
       
            );
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>