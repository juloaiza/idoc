<?php

      $site=$_GET['SiteID'];

    $contents=file_get_contents("http://natweb.eng.t-mobile.com/sites/Reporting/Reports/Homer/TTWOINCHistoryReport.aspx?SiteID=".$site);
    
    echo $contents;
    
?>
