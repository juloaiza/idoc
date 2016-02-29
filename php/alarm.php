<?php

    $site=$_GET['SiteID'];
    $username = 'jloaiza1';
    $password = 'Welcome#1';
    $curl =  curl_init("http://natweb.eng.t-mobile.com/sites/NetworkElements/Interfaces/NetXAlerts.aspx?Manager=&SiteID=".$site);

#http://stackoverflow.com/questions/12094535/why-doesnt-curl-work-with-windows-authentication-on-iis7  
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_NTLM);
    curl_setopt($curl, CURLOPT_USERPWD, "jloaiza1:Welcome##" );
#    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
#    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);  
    
    $contents = curl_exec($curl); 
    curl_close ($curl); 
     
    if (strpos($contents,'Unauthorized:') == false) {
        echo $contents;
     } else {
        echo "</br>Sorry... data not available";
     }

    
    
?>
