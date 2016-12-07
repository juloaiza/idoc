<?php
session_start();
// if session variable not set, redirect to login page
if (!isset($_SESSION['id'])) {
    if (!isset($_GET['id']))  {
        header('Location:index.php');
        exit;
    }
}
include("php/connection.php");
$query = "SELECT `name`, `market` FROM `users` WHERE id=".$_SESSION['id']." LIMIT 1";
$result = mysqli_query($link, $query);
$row = mysqli_fetch_array($result);
$user = $row['name'];
$market = $row['market'];

$aws = "10.2.4.212"//"ec2-54-69-137-192.us-west-2.compute.amazonaws.com"
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="favicon.ico">

    <title>Idoc</title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" 
    integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
  

    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug 
    <link href="../../assets/css/ie10-viewport-bug-workaround.css" rel="stylesheet">-->

    <!-- Custom styles for this template -->
    <link href="starter-template.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <nav class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#"><span><img alt="Brand" src="images/iDocIcon.png" style="height:20px;margin-top:-4px;"></span><strong> Idoc</strong></a>
            </div>
            <div id="navbar" class="collapse navbar-collapse">
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="#"><span class="glyphicon glyphicon-signal"></span> <span id="nav-tech"> LTE </span> </a></li> 
                    <li><a href="#"><span class="glyphicon glyphicon-user"></span> <?php echo $user; ?>/<span class="market"><?php echo $market; ?></span> </a></li>                    
                </ul>
                <form class="navbar-form" id="nav-sear" role="search">  
                    <div class="input-group" >
                        <input class="form-control"  id="seartxt" style="width:350px;" placeholder="Site, Address, Zip" type="text">
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="moveCenter()" id="searbtn">
                                <span class="glyphicon glyphicon-search"></span>
                            </button>
                        </span>
                    </div>         
                </form> 
            </div><!--/.nav-collapse -->
        </div>
    </nav><!--/navbar-fixed-top -->

    <div class="overlay-sidebar">
        <div class="offcanvas offcanvas-left">
            <ul class="nav">
                <div class="sidenav-heading rmv-obj-left">
                    <a href="#" class="closebtn"> <span class="glyphicon glyphicon-remove" ></span></a>            
                    <div class="sidenav-heading-title">
                        <h4>Layers</h4>  
                    </div>            
                </div>
            </ul>    
            <div id="layer-sidenav" class="sidenav rmv-obj-left">
				<!-- begin sidebar nav -->
				<ul class="nav">
					<li class="has-sub">
						<a href="#" onclick="cleanlayer();">
                            Remove Layer
						</a>
					</li>
 					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>T-mobile</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio5" value="option5" onclick="tiledLayer('TMo_Tech_Map','http://maps.t-mobile.com/TMo_TechLTE_Map/{z}/{x}:{y}/tile.png',1,0.5);"> PCC</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio6" value="option6" onclick="tiledLayer('TMo_Verified_Map','http://maps.t-mobile.com/TMo_Verified_Map/{z}/{x}:{y}/tile.png',1,0.8);"> Verified coverage</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps" id="check0" value="" onclick="lowBandAndSR('srs');" > SRs</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps1" id="check1" value="" onclick="showBans();" > BANs</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps2" id="check2" value="" onclick="lowBandAndSR('L700');" > L700</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps3" id="check3" value="" onclick="lowBandAndSR('NSD');" > NSD</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps4" id="check4" value="" onclick="tiledLayer('Cluster','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=cluster:SE_SubCL&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);" > SubCluster</a></li>                            
                        </ul>
					</li>                   
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Asset</span>
					    </a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio21" value="option21" onclick="tiledLayer('L700_Asset','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=NSD:pop_m&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);"> POPs UCV L700</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio22" value="option22" onclick="tiledLayer('L700_Asset','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=NSD:NSD_L700_INDOOR_3R&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);"> POPs+L700_3 </a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio23" value="option23" onclick="tiledLayer('L700_Asset','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=NSD:NSD_L700_INDOOR&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);"> POPs+L700_A</a></li>
                        </ul>
					</li>

					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Others Towers</span>
					    </a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="checkbox" name="checkMaps5" id="check5" value="" onclick="tiledLayer('Towers','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=miscellaneous:verizon&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);" > Verizon</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps6" id="check6" value="" onclick="tiledLayer('Towers','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=miscellaneous:ATT&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);"  > AT&T</a></li>
						    <li><a href="#"><input type="checkbox" name="checkMaps7" id="check7" value="" onclick="tiledLayer('Towers','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=miscellaneous:owner&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);"  > Owners</a></li> 
                        </ul>
					</li>                    


					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>King County Projects</span>
					    </a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="checkbox" name="checkMaps4" id="check4" value="" onclick="tiledLayer('Status','http://<?php echo $aws; ?>:8080/geoserver/gwc/service/gmaps?layers=miscellaneous:downtown&zoom={z}&x={x}&y={y}&format=image/png8',0,0.85);" > Downtown Seattle</a></li>  
                        </ul>
					</li>                     


                    
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>TrueCall</span>
					    </a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio1" value="option1" onclick="tiledLayer('L700_Asset','http://10.2.4.212:8080/geoserver/gwc/service/gmaps?layers=truecall:rsrp&zoom={z}&x={x}&y={y}&format=image/png8',0,0.5);" > RSRP</a></li>

                           <!-- <li><a href="#"><input type="radio" name="optionsMaps" id="radio1" value="option1" onclick="geosrv('rsrp','truecall','rsrp','RSRP_TIF',0.5);" > RSRP</a></li> -->
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio2" value="option2" onclick="geosrv('rsrq','truecall','rsrq','RSRQ_TIF',0.5);"> RSRQ</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio3" value="option3" onclick="geosrv('pci','truecall','pci','PCI_TIF',0.5);"> PCI</a></li>
                            <!-- <li><a href="#"><input type="radio" name="optionsMaps" id="radio1" value="option1" onclick="tiledLayer('rsrp','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/rsrp/{z}/{x}/{y}.png',0,0.5);" > RSRP</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio2" value="option2" onclick="tiledLayer('rsrq','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/rsrq/{z}/{x}/{y}.png',0,0.5);"> RSRQ</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio3" value="option3" onclick="tiledLayer('pci','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/pci/{z}/{x}/{y}.png',0,0.5);"> PCI</a></li>-->
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio4" value="option4" onclick="tiledLayer('traffic','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/traffic/{z}/{x}/{y}.png',0,0.5);"> Traffic</a></li>


                        </ul>
					</li>
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
							<span>TrueCall LSR</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio7" value="option7" onclick="geosrv('rsrp','truecall','seattle','rsrp',0.85);"> RSRP</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio8" value="option8" onclick="geosrv('rsrq','truecall','seattle','rsrq',0.85);"> RSRQ</a></li>
						</ul>
					</li>
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
							<span>LTE Coverage (MyAccount)</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio17" value="option7" onclick="geosrv('LAll','myaccount','LAll','rsrp',0.85);"> All Band</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio18" value="option7" onclick="geosrv('L2100','myaccount','L2100','rsrp',0.85);"> 2100 Band</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio19" value="option7" onclick="geosrv('L1900','myaccount','L1900','rsrp',0.85);"> 1900 Band</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio20" value="option7" onclick="geosrv('L700','myaccount','L700','rsrp',0.85);"> 700 Band</a></li>                            
						</ul>
					</li>                    
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>RootMetrics (Coverage)</span> 
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio9" value="option9" onclick="tiledLayer('RootMetrics_Map','http://png4.tilesgridv2.rootmetrics.com/tilesgrid/api/v2/tile/{z}/{x}/{y}/png/sig/1',0,0.8);"> AT&T</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio10" value="option10" onclick="tiledLayer('RootMetrics_Map','http://png1.tilesgridv2.rootmetrics.com/tilesgrid/api/v2/tile/{z}/{x}/{y}/png/sig/2',0,0.8);"> Sprint</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio11" value="option11" onclick="tiledLayer('RootMetrics_Map','http://png4.tilesgridv2.rootmetrics.com/tilesgrid/api/v2/tile/{z}/{x}/{y}/png/sig/3',0,0.8);"> T-mobile</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio12" value="option12" onclick="tiledLayer('RootMetrics_Map','http://png4.tilesgridv2.rootmetrics.com/tilesgrid/api/v2/tile/{z}/{x}/{y}/png/sig/4',0,0.8);"> Verizon</a></li>
						</ul>
					</li>
					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Echo Locate</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio13" value="option9" onclick="tiledLayer('EchoLocate_Drop','http://prdasngis048:8080/rest/Spatial/MapTilingService/EchoLocate_Drop/{z}/{x}:{y}/tile.png',1,0.8);"> Drops</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio14" value="option10" onclick="tiledLayer('EchoLocate_AccessFailure','http://prdasngis048:8080/rest/Spatial/MapTilingService/EchoLocate_AccessFailure/{z}/{x}:{y}/tile.png',1,0.8);"> Access Failures</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio15" value="option11" onclick="tiledLayer('EchoLocate_AudioIssue','http://prdasngis048:8080/rest/Spatial/MapTilingService/EchoLocate_AudioIssue/{z}/{x}:{y}/tile.png',1,0.8);"> Audio Issues</a></li>
						    <li><a href="#"><input type="radio" name="optionsMaps" id="radio16" value="option12" onclick="tiledLayer('EchoLocate_SRVCC','http://prdasngis048:8080/rest/Spatial/MapTilingService/EchoLocate_SRVCC_Ratio/{z}/{x}:{y}/tile.png',1,0.8);"> SRVCC ratio</a></li>
						</ul>
					</li>



                    
                </ul>
				<!-- end sidebar nav -->


            </div>          
         
          
        </div><!--/.offcanvas-left -->

        
        <div class="icon-bar icon-bar-left">
            <a href="#" data-toggle="tooltip" data-placement="right" title="Home"><i class="glyphicon glyphicon-home"></i></a> 
            <a href="http://tpimwest.t-mobile.com/tpimportal/TPIMLogin.jsp#" target="_blank" data-toggle="tooltip" data-placement="right" title="Tpim"><i class="glyphicon glyphicon-dashboard"></i></a> 
            <span data-toggle="modal" data-target="#smallModal"><a href="#" data-toggle="tooltip" data-placement="right" title="Contact"><i class="glyphicon glyphicon-envelope"></i></a></span>
            <a class="icon-active layer-icon" href="#" data-toggle="tooltip" data-placement="right" title="Layers"><i class="glyphicon glyphicon-globe"></i></a>
        </div>            
        
        
        <div class="legend-left">

        </div>
        
        
         <div class="legend-right">

        </div>       
        
        
        
        <div class="modal fade" id="smallModal" tabindex="-1" role="dialog" aria-labelledby="smallModal" aria-hidden="true">
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title" id="myModalLabel">Julian Loaiza</h4>
                    </div>
                    <div class="modal-body">
                        <p>  <span class="glyphicon glyphicon-earphone" aria-hidden="true"></span> <strong> Phone : </strong> 571-9181126 </p>
                        <p>  <span class="glyphicon glyphicon-envelope" aria-hidden="true"></span> <strong> Email : </strong> <a href="mailto:julian.loaiza1@t-mobile.com">julian.loaiza1@t-mobile.com</a> </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>        
        
  
        <!--/Right Canvas -->  
        <div class="offcanvas offcanvas-right">
             <ul class="nav">
                <div class="sidenav-heading rmv-obj-right">
                    <a href="#" class="closebtn"> <span class="glyphicon glyphicon-remove" ></span></a>            
                    <div class="sidenav-heading-title">
                        <h4>Technology</h4>  
                    </div>            
                </div>
            </ul>           
        

            <div id="ui-technology" class="sidenav rmv-obj-right" style="display:none;">
				<!-- begin sidebar nav -->
				<ul class="nav">
					<li class="has-sub">
						<a href="#">
                            <input type="radio" name="opttech" value="LTE" onclick="secDraw();" checked> LTE
						</a>
					</li>
 					<li class="has-sub">
						<a href="#">
                            <input type="radio" name="opttech" value="UMTS" onclick="secDraw();"> UMTS
						</a>
					</li>
					<li class="has-sub">
						<a href="#">
                            <input type="radio" name="opttech" value="GSM" onclick="secDraw();"> GSM
						</a>
					</li>                    
                </ul>
            </div>  <!--template -->  


            
            <div id="ui-market" class="sidenav rmv-obj-right">
				<!-- begin sidebar nav -->
				<ul class="nav">
  					<li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Central</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="market" id="mktDal" value="Dallas"> Dallas</a></li>                              
                         </ul>
					</li> 

                    <li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>West</span>
						</a>
						<ul class="sub-menu">
 						    <li><a href="#"><input type="radio" name="market" id="mktSea" value="Seattle"> Seattle</a></li>
						    <li><a href="#"><input type="radio" name="market" id="mktSpo" value="Spokane"> Spokane</a></li>
						    <li><a href="#"><input type="radio" name="market" id="mktPdx" value="Portland"> Portland</a></li>
						    <li><a href="#"><input type="radio" name="market" id="mktPhx" value="Phoenix"> Phoenix</a></li>                            
                         </ul>
					</li>                   
                </ul>
            </div>  <!--template -->              
      
            <div id="ui-sector" class="sidenav rmv-obj-right">
				<!-- begin sidebar nav -->
				<ul class="nav">
					<li class="has-sub">
						<a href="#" onclick="initialSector();">
                            Default
						</a>
					</li>
                    <li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Parameter</span>
						</a>
						<ul class="sub-menu">
 						    <li><a href="#"><input type="radio" name="options3G" id="Par_0" value="PtxPrimaryCPICH"> 3G-PtxPrimaryCPICH</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="Par_1" value="PriScrCode"> 3G-PriScrCode</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="Par_2" value="RtFmcsIdentifier"> 3G-RtFmcsIdentifier</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="Par_4" value="RtFmcgIdentifier"> 3G-RtFmcgIdentifier</a></li>  
						    <li><a href="#"><input type="radio" name="options3G" id="Par_5" value="UARFCN"> 3G-UARFCN</a></li>                              
						    <li><a href="#"><input type="radio" name="options3G" id="Par_3" value="LAC"> 3G-LAC</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="Par_7" value="bsTxPwrMax1x00"> 2G-bsTxPwrMax1x00</a></li>

						    <li><a href="#"><input type="radio" name="options3G" id="Par_6" value="SC"> 2G-BCCH/SC/PCI</a>  <input type="text" style="width:50px; position: relative; left:80px;" class="form-control" id="channel" placeholder="Val"></li>                            
						    <li><a href="#"><input type="radio" name="options3G" id="Par_10" value="NBRs"> 2G-Neighbors</a> </br> <input type="text" style="width:150px; position: relative; left:10px;" class="form-control" id="relation" placeholder="NBR"></li>                            

                            
                            
                        </ul>
					</li>
                    <li class="has-sub">
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>KPI</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="#"><input type="radio" name="options3G" id="MKPI_0" value="FeedBack"> FeedBack</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="MKPI_1" value="Voice_Drops_Raw"> Voice Drops Raw</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="MKPI_2" value="Poor_EcNo"> Poor EcNo</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="MKPI_3" value="High_TX_Pwr_Usage"> High TX Power Usage</a></li>
						    <li><a href="#"><input type="radio" name="options3G" id="MKPI_4" value="Poor_RTWP"> Poor RTWP</a></li>
                         </ul>
					</li>
                    <li class="has-sub" >
						<a href="#">
						    <b class="caret pull-right"></b>
						    <span>Selection</span>
						</a>
						<ul class="sub-menu" id="list-selection">
                            <div class="col-xs-14">
                            
                                <div>
                                    <button class="btn btn-default" onclick="clearSelection();" id="delete-button">Delete</button>
                                </div>                        
                                                
                               
                                <div class="form-group">
                                    <label for="info_sector">Sectors:</label>
                                    <textarea class="form-control" rows="25" id="info_sector"></textarea>
                                </div>                            
                            
                            <div>
                            

        
                         </ul>
					</li>                    
                    
                    
                    
                    
                    
                    
                    
                </ul>
            </div>  <!--template -->   

        <div id="ui-kpis" class="rmv-obj-right">
        <!-- Div pending to add -->
            <div class="col-sm-12">  
                <h4> <div class="infoCell"></div></h4>
         <!-- Adding sparkline -->                        
            </div>                      
        </div>


      
            
        </div> 
        
        <div class="icon-bar icon-bar-right">
            <a href="#" data-toggle="tooltip" data-placement="left" title="Technology"><i class="glyphicon glyphicon-signal"></i></a>
            <a href="#" data-toggle="tooltip" data-placement="left" title="Market"><i class="glyphicon glyphicon-map-marker"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="Sector" id="icon-sector"><i class="glyphicon glyphicon-tower"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="KPIs" id="icon-kpi"><i class="glyphicon glyphicon-stats"></i></a> 
      <!--      <a href="#" data-toggle="tooltip" data-placement="left" title="Alarms"><i class="glyphicon glyphicon-bell"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="TT"><i class="glyphicon glyphicon-fire"></i></a>
            <a href="#" data-toggle="tooltip" data-placement="left" title="WO"><i class="glyphicon glyphicon-wrench"></i></a>           
            <a href="#" data-toggle="tooltip" data-placement="left" title="Default"><i class="glyphicon glyphicon-refresh"></i></a> -->
        </div>            
        
        
        
        
        
    </div>
    
    
    <div id="map"></div>

    
    <div id="nav-dpicker">
        <div class="input-group">
            <span class="input-group-btn">
                <button class="btn btn-default" type="button" onclick="btnpicker('d')">  <span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>
            </span>
                        
                <input type='text' class="form-control" id='dpicker' >

            <span class="input-group-btn">
                <button class="btn btn-default" type="button" onclick="btnpicker('u')">  <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>
            </span>                   
                        
        </div>
    </div>        
    
<!--    
  <div id="logo">
      <img src="images/JAL.png" style="height:60px; position: fixed; bottom: 10px; right:30px;">
  </div>
 -->
    

    

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>  
    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug 
    <script src="../../assets/js/ie10-viewport-bug-workaround.js"></script>-->
  
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCDjB5G0Fod2mUs0u9a-B4cF3xyqQa5uAs&sensor=false&libraries=drawing"></script>
    <script type="text/javascript" src="js/markerclusterer.min.js"></script>
    <script type="text/javascript" src="js/maplabel.js"></script> 
    <script src="https://www.google.com/jsapi"></script>    

    
    <script type="text/javascript" src="js/chance.min.js"></script>
    <script type="text/javascript" src="js/jquery.sparkline.js"></script>
    <script type="text/javascript" src="js/GeoJSON.js"></script>
    <script type="text/javascript" src="js/moment.min.js"></script>
    <script type="text/javascript" src="js/bootstrap-datetimepicker.js"></script>
    <script type="text/javascript" src="js/goog.long.js"></script>
    <script type="text/javascript" src="js/require.js"></script>
    <script type="text/javascript" src="js/proj.js"></script>

    <script type="text/javascript" src="js/v3_epoly.js"></script>
    <script type="text/javascript" src="js/sectors.js"></script>
    <script type="text/javascript" src="js/contextmenu.js"></script>
    <script type="text/javascript" src="js/elevation.js"></script>
    <script type="text/javascript" src="js/neighbors.js"></script>
    <script type="text/javascript" src="js/temporaryStorage.js"></script>
    <script type="text/javascript" src="js/colors.js"></script>
    <script type="text/javascript" src="js/CSVPlotter.js"></script> 
    <script type="text/javascript" src="js/kpi.js"></script>     
    <script type="text/javascript" src="js/map.js"></script>     
    <script src="//cdn.jsdelivr.net/bluebird/3.4.0/bluebird.min.js"></script>
   
    <script type="text/javascript">
    
        $(".rmv-obj-left > .closebtn").click(function(){
            $(".icon-bar-left").animate({left: '0px'});
            if ($(".legend-left").css( "left" ) == '200px' ) {$(".legend-left").animate({'left': '0px', 'bottom':'60px','top': 'auto'});}           
            $(".offcanvas-left").animate({width: '0px'});
            $(".rmv-obj-left").css({'display':'none'}); 

        });


        $(".layer-icon").click(function(){
            $(".icon-bar-left").animate({left: '200px'});
            if ($(".legend-left").css( "left" ) == '0px' ) {$(".legend-left").animate({'left': '200px', 'bottom':'60px','top': 'auto'});}                
            $(".offcanvas-left").animate({width: '200px'});
            $(".rmv-obj-left").css({'display':'block'}); 
        }); 

        $(".rmv-obj-right > .closebtn").click(function(){
            $(".icon-bar-right").animate({right: '0px'});
            $(".offcanvas-right").animate({width: '0px'});
            if ($(".legend-right").css( "right" ) == '200px' || $(".legend-right").css( "right" ) == '400px' ) {$(".legend-right").animate({'right': '0px', 'bottom':'60px','top': 'auto'});}  
            $(".rmv-obj-right").css({'display':'none'}); 

        });

//old way fucntion per icon clean this part X rmv-obj-X
        $(".home2_old").click(function(){
            $(".icon-bar-right").animate({right: '200px'});
            $(".offcanvas-right").animate({width: '200px'});
         //   $(".offcanvas-right").css({'padding-left': '8px', 'padding-right': '5px'});
            $(".rmv-obj-right").css({'display':'block'}); 
        }); 


       
    </script>

    <script type="text/javascript">
        $(document).ready(function(){
            $('#seartxt').keypress(function(e){
                if(e.keyCode==13){
                    $('#searbtn').click();
                    return false; // Avoid Refresh page after run function. This line kill everything
                }
            });
        });  
    </script>
    
    
    
    <script type="text/javascript">  <!-- DatePicker -->
        $('#dpicker').datetimepicker({
                        defaultDate: moment().add(-1, 'days'),
                        format: 'MM/DD/YY',
                        maxDate: moment()
                    });   
        $("#dpicker").on("dp.change", function (e) {
            var new_day = moment($('#dpicker').data("DateTimePicker").date().format('YYYY-MM-DD'));
            days_ = new_day.diff(old_day,'days');
            CurrentDate = $('#dpicker').data("DateTimePicker").date().format('YYYY-MM-DD');
            //Verify style
            changeSectorStyle(secSQL.toString(),sectorPolygons,style_,CurrentDate,query_)    
        });                

    </script>    

    <script type="text/javascript">
        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();
        });
    </script>   

    <script type="text/javascript"> <!--offcanvas subment-->
        $(".nav > .has-sub > a").click(function() {
            var e = $(this).next(".sub-menu")
              , a = ".sidebar .nav > li.has-sub > .sub-menu";
              
            ($(a).not(e).slideUp(250, function() {
                $(this).closest("li").removeClass("expand")
            }),
            
            $(e).slideToggle(250, function() {
                var e = $(this).closest("li");
                $(e).hasClass("expand") ? $(e).removeClass("expand") : $(e).addClass("expand")
            }));
        });
        //Open sub-menu
        $(".nav > .has-sub .sub-menu li.has-sub > a").click(function() {
            var e = $(this).next(".sub-menu");
            $(e).slideToggle(250)
        });
    </script>
 

    <script type="text/javascript"> <!--icon-bar-->
        $(".icon-bar-right > a").click(function() {

            $(".icon-bar-right").animate({right: '200px'});
            $(".offcanvas-right").animate({width: '200px'});
            $(".rmv-obj-right").css({'display':'none'});                        
            if ($(".legend-right").css( "right" ) == '0px' ) {$(".legend-right").animate({'right': '200px', 'bottom':'60px','top': 'auto'});}  
            
            $(".icon-bar-right > a").removeClass("icon-active");
            var e = $(this);
            var iconHtml = e[0]['outerHTML'];
            $(e).addClass("icon-active");

            $(".sidenav-heading").css({'display':'block'});     
            switch(true) {
                case (iconHtml.indexOf("Technology")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("Technology");
                    $("#ui-technology").css({'display':'block'}); 
                    if ($(".legend-right").css( "right" ) == '400px' ) {$(".legend-right").animate({'right': '200px', 'bottom':'60px','top': 'auto'});}                      
                    
                    break;
                case (iconHtml.indexOf("Market")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("Market");
                    $("#ui-market").css({'display':'block'});
                    if ($(".legend-right").css( "right" ) == '400px' ) {$(".legend-right").animate({'right': '200px', 'bottom':'60px','top': 'auto'});}                     
                    break;
                case (iconHtml.indexOf("Sector")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("Sector");
                    $("#ui-sector").css({'display':'block'});
                    if ($(".legend-right").css( "right" ) == '400px' ) {$(".legend-right").animate({'right': '200px', 'bottom':'60px','top': 'auto'});}                     
                    break;              
                case (iconHtml.indexOf("KPIs")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("KPIs");
                    $("#ui-kpis").css({'display':'block'}); 
                    $(".icon-bar-right").animate({right: '400px'});
                    $(".offcanvas-right").animate({width: '400px'});
                    if ($(".legend-right").css( "right" ) == '0px' || $(".legend-right").css( "right" ) == '200px' ) {$(".legend-right").animate({'right': '400px', 'bottom':'60px','top': 'auto'});}                      
                    $.sparkline_display_visible();
                     
                    break;                    
                case (iconHtml.indexOf("Alarms")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("Alarms");
                    break;                    
                case (iconHtml.indexOf("TT")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("TT");
                    break;                    
                case (iconHtml.indexOf("WO")>0):
                    $(".rmv-obj-right > .sidenav-heading-title > h4").html("WO");
                    break;  
                case (iconHtml.indexOf("Default")>0):
                    console.log(8);
                    break;  

            }
            
            
        });
    </script>

    <script type="text/javascript">           
        $(function() {
            $( ".legend-left" ).draggable();
            $( ".legend-right" ).draggable();
        });
    </script>
     
  </body>
</html>
