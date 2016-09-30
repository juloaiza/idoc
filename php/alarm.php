<?php

    $site=$_GET['SiteID'];
    $username = 'jloaiza1';
    $password = 'Welcome@$';
    $curl =  curl_init("http://natweb.eng.t-mobile.com/sites/NetworkElements/Interfaces/NetXAlerts.aspx?Manager=&SiteID=".$site);

#http://stackoverflow.com/questions/12094535/why-doesnt-curl-work-with-windows-authentication-on-iis7  
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_NTLM);
    curl_setopt($curl, CURLOPT_USERPWD, $username.':'.$password );
#    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);  #Avoid automatic display
    
    $contents = curl_exec($curl); 
    curl_close ($curl); 

    if (strpos($contents,'Unauthorized:') == false) {
        #echo $contents;
        preg_match('/id="ctl00_ContentPlaceHolderMain_gdvAlerts"(.*?)<\/table>/s',$contents,$matches);
        $inTable = substr($matches[1], strpos($matches[1],'<tr'), strlen($matches[1]));
        echo '<table class="table table-condensed table-striped">'.$inTable.'</table>';
     } else {
        echo "</br>Sorry... data not available";
     }

    
?>
