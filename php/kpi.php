<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection
    $query = "SELECT `period_start_time`, `lncel_name`, `cellavailabilityrate`, `bad_cqi`, `ave_sinr_pusch`, `averagecqi`, `averagerssiforpusch`, `usage_mimo`, `usage_agg2`, `uepowerheadroom`, `dl_traffic_volume_mb`, `ul_traffic_volume_mb`, 
    `cell_load_act_ue_avg`, `cell_load_act_ue_max`, `averageprbusageperdltti`, `ave_pdcp_dl_thr`, `dlmaxcellthroughputkbps`, `averagedllatency`, `voltecalls`, `volteerlangs`, `volteaccessfailrate`, `voltedroprate`, `totalvoltedrops`, 
    `srvccattempts_perc`, `voltecallsgoingto3gor2g`, `rachtorrcattemptratio`, `ltedatacallsgoingto3gor2g`, `lte_afr`, `lte_dcr` FROM `lte_kpi` WHERE `lncel_name`='".$lncel."' AND `period_start_time` >= DATE_SUB(CURDATE(),INTERVAL 30 DAY)  ORDER BY `period_start_time` ASC" ; 
    //echo $query;
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success
        $b = array(array());
        $j = 0;
        while ($row=  mysqli_fetch_array($result)) {

            for ($i = 0; $i < 29; $i++) {
                
                if ($i > 1) {
                    $b[$i-0][$j] = round($row[$i],4);
                } else {
                    $b[$i-0][$j] = $row[$i];
                }
            }
            $j++;
           

        };

           //  echo('<span class="inlinesparkline">'.implode(',',$b).'</span>');
          // print_r($b);
        $json = array();
        for ($i = 0; $i < 29; $i++) {

            $json['kpi'][]=array('value'=>implode(',',$b[$i]));
        
        }
        //print_r($json);
        //     echo(implode(',',$b));               

        mysqli_close($db_name);
        echo json_encode($json, JSON_NUMERIC_CHECK);        
        
        
    } else {
        
        echo "It failed";
    }
    
    
    
    
?>