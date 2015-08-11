<?php
    
    $lncel=$_GET['lncel'];
    include("connection.php");  //get db connection
    $query = "SELECT `period_start_time`, `lncel_name`, `cellavailabilityrate`, `bad_cqi`, `ave_sinr_pusch`, `averagecqi`, `averagerssiforpusch`, `usage_mimo`, `usage_agg2`, `uepowerheadroom`, `dl_traffic_volume_mb`, `ul_traffic_volume_mb`, 
    `cell_load_act_ue_avg`, `cell_load_act_ue_max`, `averageprbusageperdltti`, `ave_pdcp_dl_thr`, `dlmaxcellthroughputkbps`, `averagedllatency`, `voltecalls`, `volteerlangs`, `volteaccessfailrate`, `voltedroprate`, `totalvoltedrops`, 
    `srvccattempts_perc`, `voltecallsgoingto3gor2g`, `rachtorrcattemptratio`, `ltedatacallsgoingto3gor2g`, `lte_afr`, `lte_dcr` FROM `lte_kpi` WHERE `lncel_name`='".$lncel."' ORDER BY `period_start_time` DESC  LIMIT 0, 10" ; 
    //echo $query;
    if ($result = mysqli_query($link,$query)) {  //mysql_query() check if the query was success
        
        while ($row= mysqli_fetch_array($result)) {
            echo('<tr class="">');
            
            echo('<td>'.date("m/d/y",strtotime($row[0])).'</td>');
            for ($i = 1; $i <= 28; $i++) {
                
                
                if ($i >1) {
                
                    echo('<td>'.round($row[$i],2).'</td>');
                } else {
                
                    echo('<td>'.$row[$i].'</td>');
                }

                
                
                
                
            }
            
            echo('</tr>');
        };
        
    } else {
        
        echo "It failed";
    }
    
    
    
    
?>