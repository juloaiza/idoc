<?php

      $site=$_GET['SiteID'];

    $contents=file_get_contents("http://natweb.eng.t-mobile.com/sites/Reporting/Reports/Homer/TTWOINCHistoryReport.aspx?SiteID=".$site);
    

    preg_match('/id="ctl00_ReportBody_gdvHomerWOHistory"(.*?)<\/table>/s',$contents,$matches);
    $inTable = substr($matches[1], strpos($matches[1],'<tr'), strlen($matches[1]));
    $wo = '<table class="table table-condensed table-striped">'.$inTable.'</table>';
    
    echo $wo;
  
?>


