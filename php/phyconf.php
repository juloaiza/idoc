<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection
  
    $field = array("Sector","Technology","Azimuth", "Antenna Type", "Height","ElectTilt", "MechTilt"); 
    $sector = substr($lncel,1,9);
    echo $sector;
    $query = "SELECT * FROM (SELECT `CellName`,`technology`,`azimuth`,`antennaname`,`antennaheight_m`,`existingelectilt`,`existingmechtilt` FROM `physical_info_all` WHERE `CellName` = '".$lncel."') a UNION ALL Select * FROM (SELECT `CellName`, `technology`, `azimuth`,`antennaname`,`antennaheight_m`,`existingelectilt`,`existingmechtilt` FROM `physical_info_all` WHERE `CellName` like  '%".$sector."%' AND `CellName` NOT IN ('".$lncel."') order by `technology`,`CellName`) b";
    
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success
                
        $rows=array();
        
        $i=0;         
        while($info = mysqli_fetch_assoc($result)){
            foreach($info as $key=>$val){
               
                if ($i == 0) {
                    $rows[$key][] ='<td class="info"><b>'.$val.'</b></td>'; 
                } else {
                    $rows[$key][]='<td>'.$val.'</td>';                     
                }
                
            }
            $i++;
        }
        //print_r($rows);
        $i = 0;
        foreach($rows as $row){
            
            echo '<tr><td>'.$field[$i].'</td>';
            foreach($row as $cell){
                echo $cell;
            }
            echo '</tr>';
            $i++;
        }


    } else {
        
        echo "It failed";
    }
  
  
  

  
  
  
  
  
  
    
?>