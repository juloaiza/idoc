<?php

    $site=$_GET['SiteID'];

    $contents=file_get_contents("http://natweb.eng.t-mobile.com/sites/NetworkElements/Interfaces/NetXAlerts.aspx?Manager=&SiteID=".$site);
    
    echo $contents;
    
?>
