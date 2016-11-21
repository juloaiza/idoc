<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection

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