<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection
    $query = "SELECT `CellName`,`market`,`technology`,`azimuth`,`antennaname`,`antennaheight_m`,`existingmechtilt`,`existingelectilt` FROM `physical_info` WHERE `CellName` = '".$lncel."'"; 
    //echo $query;
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success

        $row = mysqli_fetch_array($result);

        $field = array("Azimuth", "Antenna Type", "Height", "MechTilt","ElectTilt"); 
        for ($i = 3; $i <= 7; $i++) {
           echo '<tr> <td>'.$field[$i-3].'</td> <td> '.$row[$i].'</td> </tr>';
        }        

     //   mysqli_close($db_name);
        
    } else {
        
        echo "It failed";
    }
  
    $query = "SELECT `earfcnDL`,`dlChBw`,`ui_value`,`CIR` FROM `aav` WHERE `name` = '".$lncel."'"; 
    //echo $query;
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success

        $row = mysqli_fetch_array($result);

        $field = array("Frequency", "BW", "Mimo Type", "AAV"); 
        for ($i = 0; $i <= 3; $i++) {
           echo '<tr> <td>'.$field[$i].'</td> <td> '.$row[$i].'</td> </tr>';
        }        

        mysqli_close($db_name);
        
    } else {
        
        echo "It failed";
    }



    
?>