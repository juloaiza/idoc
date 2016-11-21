<?php
    //Module to get Cell information
    $secSQL=$_POST['secSQL'];
    $style=$_POST['style'];   //kpi,parameter,value 
    $date=$_POST['date'];
    $i = $_POST['query'];
    $TECH= $_POST['tech'];
    include("connection.php");  //get db connection

    
    
    switch ($i) {
        case 0:
            $query = "SELECT `CellName`, CASE WHEN ('".$TECH."' = 'GSM') THEN 'gsm' ELSE concat(left(`CellName`,1), right(`CellName`,1)) END as style FROM `physical_info_all` WHERE `CellName` in (".$secSQL.")";
            break;
        case 1:
            $query = "SELECT `WCEL_NAME` as CellName, `".$style."` AS style FROM `umts_raw_kpi` WHERE `period_start_time` = '".$date."' AND `WCEL_NAME` in (".$secSQL.")";
            break;
        case 2:
            $query = "SELECT CellName, `".$style."` AS style FROM `Nokia_WCEL` WHERE `CellName` in (".$secSQL.")";
            break;
        case 3:
            $query = "SELECT `CellName`, `existingelectilt` as style FROM `physical_info_all` WHERE `CellName` in (".$secSQL.")"; //replace emp_info with your table name
            break;
        case 4:
            $query = "SELECT `CellID` as CellName ,'yellow' as style FROM `GSMCellRef` WHERE `CellID` in (".$secSQL.") AND `BCCH` = ".($style-1)."
                      UNION
                      SELECT `CellID` as CellName,'red' as style FROM `GSMCellRef` WHERE `CellID` in (".$secSQL.") AND `BCCH` = ".$style."
                      UNION
                      SELECT `CellID` as CellName,'orange' as style FROM `GSMCellRef` WHERE `CellID` in (".$secSQL.") AND `BCCH` = ".($style+1)." ";
            
            break;           
         case 5:
            $query = "SELECT `neighbors`as CellName,'red' as style FROM `GSMCellRef` WHERE `CellID` = '".$secSQL."' LIMIT 1";
           
            break;            
            
            
    }    
    
   //echo $query;
    $json = array();    
    
    $result = mysqli_query($link, $query);
    if(mysqli_num_rows($result)){
        while($row= mysqli_fetch_assoc($result)){

            if ($i == 5) { //Neighbors Defined
                $nbr = explode(";", $row['CellName']);
                foreach ($nbr as $CellName) {
                    $json[$CellName] = "red";
                }
                $json[$secSQL] = "blue";                
  
            } else {
                $json[$row['CellName']] = $row['style'];   
            }
        
        }
    }
 //   mysqli_close($db_name);
    echo json_encode($json, JSON_NUMERIC_CHECK);
// please refer to our PHP JSON encode function tutorial for learning json_encode function in detail
?>


