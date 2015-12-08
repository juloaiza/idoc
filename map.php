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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>IdocTool</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!-- Add custom CSS here -->
    <link href="css/general.css" rel="stylesheet">
    <!-- context-menu -->
    <link  href="css/contextmenu.css" rel="stylesheet">
    
        <link rel="icon" href="favicon.ico" />
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCDjB5G0Fod2mUs0u9a-B4cF3xyqQa5uAs&sensor=false"></script>
    <script type="text/javascript" src="js/markerclusterer.js"></script>
    <script src="https://www.google.com/jsapi"></script>
    <style type="text/css">
        html{
            min-height:100%;
            position:relative
        }
        body{
            height:100%
        }
        .thingCoverer{
            position:absolute;
            visibility: visible;
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            z-index: 200;
            background-color: white;
        }
        .overlayTitle{
            text-align: center;
            margin-top: 250px
        }
        .progressThing{
            position:fixed;
            bottom:0;
            width: 100%;
        }
        .textPlot{
            display:block;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
            min-height:300px;
        }

    </style>
</head>
<body>
<div class="thingCoverer" id="thingCover">
    <div class="overlayTitle">
        <h1 id="loadingText">Loading...</h1>
    </div>
    <div class="progressThing">
        <div align="center">
             <h3>Loading...</h3>
             <!--<img src="images/preloader.gif">-->
        </div>
        <div style="height: 64px;"></div>
    </div>
</div>
<div class="thingCoverer" id="textPlotCover" style="visibility: hidden;">
    <div style="margin-top:75px;margin-left:10px;">
        <h1>Custom Plot:</h1>
        <p>Paste Tab Delimited text with first row headers:</p>
        <p>"latitude" and "longitude" for coords (required)</p>
        <p>"color", "dimension", or "date" for manual or automatic coloring (optional, date in US format)</p>
        <p>"info" for popup window info (optional)</p>
    </div>
    <label for="textToPlot"></label><textarea id="textToPlot" class="textPlot"></textarea>
    <div align="right" style="margin-right: 10%; margin-top: 10px;">
        <button type="button" class="btn btn-default btn-lg" onclick="plotCSV()">
            Plot
        </button>
    </div>
</div>
<!-- begin template -->
<div class="navbar navbar-custom navbar-fixed-top">
    <div class="navbar-header"><a class="navbar-brand" href="#"><img alt="Brand" src="images/iDocIcon.png" style="height:20px;margin-top:-4px;">&nbsp;<strong>IdocTool</strong></a>
        <a class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </a>
    </div>
    <div class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
            <li class="active"><a href="#">Home</a></li>
            <li><a href="http://tpimwest.t-mobile.com/tpimportal/TPIMLogin.jsp#" target="_blank">Tpim</a></li>
            <li><a href="#" data-toggle="modal" data-target="#smallModal">Contact</a></li>
            <li>&nbsp;</li>
        </ul>
        <p class="navbar-text navbar-right"> <span class="market"><?php echo $market; ?></span> / <?php echo $user; ?> </a></p>
    </div>
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
<div id="test">
    <div id="map-canvas"></div>
    <div id="nav-menu">
        <ul class="nav nav-pills">
            <li role="presentation"  >
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Market <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="#" id="mktSea">Seattle</a></li>
                    <li><a href="#" id="mktSpo">Spokane</a></li>
                    <li><a href="#" id="mktPdx">Portland</a></li>
                    <li><a href="#" id="mktPhx">Phoenix</a></li>
                </ul>
            </li>
            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Cluster <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio1" value="option1" onclick="showFeature(cluster,'KPI_1');" > <!--Please check map.js check Global Scope-->
                                Leakage (%)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio2" value="option2" onclick="showFeature(cluster,'KPI_2');" >
                                LTE Drops (#)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio3" value="option3" onclick="clearMap();" >
                                None
                            </label>
                        </div>
                    </li>
                </ul>
            </li>
            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Subcluster <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio4" value="option4" onclick="showFeature(subcluster,'KPI_1');" >
                                Leakage (%)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio5" value="option5" onclick="showFeature(subcluster,'KPI_2');">
                                LTE Drops (#)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsRadios" id="radio6" value="option6" onclick="clearMap();" >
                                None
                            </label>
                        </div>
                    </li>
                </ul>
            </li>
            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Site <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsBTS" id="radio1" value="option5" onclick="sites('KPI_1');">
                                Leakage (%)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsBTS" id="radio2" value="option6" onclick="sites('KPI_2');">
                                LTE Drops (#)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsBTS" id="radio3" value="option7" onclick="sites('No');">
                                None
                            </label>
                        </div>
                    </li>
                </ul>
            </li>
            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Sector <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <li><a href="#" id="def_">Default</a></li>
                    <li class ="divider"></li>
                    <li class="dropdown-submenu">
                        <a tabindex="-1" href="#">Parameter</a>
                        <ul class="dropdown-menu message-dropdown">
                            <li><a href="#" id="Par_0">PtxPrimaryCPICH</a></li>
                            <li><a href="#" id="Par_1">PriScrCode</a></li>
                            <li><a href="#" id="Par_2">RtFmcsIdentifier</a></li>
                            <li><a href="#" id="Par_3">LAC</a></li>
                        </ul>
                    </li>                    
                    <li class ="divider"></li>
                    <li class="dropdown-submenu">
                        <a tabindex="-1" href="#">Kpi</a>
                        <ul class="dropdown-menu message-dropdown">
                            <li><a href="#" id="MKPI_0">FeedBack</a></li>
                            <li><a href="#" id="MKPI_1">Voice Drops Raw Severity</a></li>
                            <li><a href="#" id="MKPI_2">Poor EcNo Severity</a></li>
                            <li><a href="#" id="MKPI_3">High TX Power Usage Severity</a></li>
                        </ul>
                    </li>
                 
                    
                </ul>
            </li>            
            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Maps <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio1" value="option1" onclick="tiledLayer('rsrp','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/rsrp/{z}/{x}/{y}.png',0,0.5);" >
                                RSRP (TrueCall)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio2" value="option2" onclick="tiledLayer('rsrq','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/rsrq/{z}/{x}/{y}.png',0,0.5);">
                                RSRQ (TrueCall)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio3" value="option3" onclick="tiledLayer('pci','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/pci/{z}/{x}/{y}.png',0,0.5);">
                                PCI (TrueCall)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio4" value="option4" onclick="tiledLayer('traffic','http://serfopt/webcontent/maps/'+$('.market').html().toLowerCase()+'/traffic/{z}/{x}/{y}.png',0,0.5);">
                                Traffic (TrueCall)
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio5" value="option5" onclick="tiledLayer('TMo_TechLTE_Map','http://maps.t-mobile.com/TMo_TechLTE_Map/{z}/{x}:{y}/tile.png',1,0.8);">
                                PCC
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio6" value="option6" onclick="tiledLayer('TMo_Verified_Map','http://maps.t-mobile.com/TMo_Verified_Map/{z}/{x}:{y}/tile.png',1,0.8);">
                                Verified coverage
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio0" value="option0" onclick="cleanlayer();" >
                                None
                            </label>
                        </div>
                    </li>
                    <li class="divider"></li>
                    <li>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="checkMaps" id="check0" value="" onclick="lowBandAndSR('srs');" >
                                SRs
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="checkMaps1" id="check1" value="" onclick="showBans();" >
                                BANs
                            </label>
                        </div>
                    </li>
                    <li>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="checkMaps2" id="check2" value="" onclick="lowBandAndSR('L700');" >
                                L700
                            </label>
                        </div>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
    
    <div id="nav-sear">
        <div class="input-group">
            <input class="form-control" placeholder="Site, Address, Zip" type="text" id="seartxt" >
                <span class="input-group-btn">
                   <!-- <span class="glyphicon glyphicon-search"></span> -->
                    <button type="button" class="btn btn-default" onclick="moveCenter()" id="searbtn">
                        <span class="glyphicon glyphicon-search"></span>
                    </button></span>
        </div>
    </div>

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
    
    
    <!--  <div id="legend-container"><h3>Legend</h3></div> -->
    <div id="btnsl">
        <button class="btn btn-primary" type="button" id="btnRight" >
            <span class="glyphicon glyphicon-chevron-left" id="btnArrowLeft" ></span>
        </button>
    </div>
</div>
<div class="container-fluid" id="main">
    <div class="row">
        <div class="col-xs-10"><!--map-canvas will be positioned here--></div>
        <div class="col-xs-2" id="rightside">
            <h2 style="text-align:center"> <strong>KPIs</strong></h2>
            <div id="kpi">
                <!-- Div pending to add -->
                <div class="row">
                    <div class="col-sm-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h4 class="panel-title"> <div class="infoCell"></div></h4>
                            </div>
                            <table class="table table-condensed">
                                <tr>

                                    <td id="ltekpi11" style="text-align:left"></td>
                                </tr>                              
                            </table>
                        </div>
                    </div>
                </div>                
                <div class="row">
                    <div class="col-sm-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Voices</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    
                                    <td id="ltekpi0" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi1" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi2" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi3" style="text-align:left"></td>
                                </tr>                                
                            </table>
                        </div>
                    </div>
                </div>
               <div class="row">
                    <div class="col-sm-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Data</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>

                                    <td id="ltekpi4" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi5" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi6" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi7" style="text-align:left"></td>
                                </tr>                                
                            </table>
                        </div>
                    </div>
               </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Extra</h3>
                            </div>
                            <table class="table table-condensed">

                                <tr>

                                    <td id="ltekpi8" style="text-align:left"></td>
                                </tr>

                                <tr>

                                    <td id="ltekpi9" style="text-align:left"></td>
                                </tr>
                                <tr>

                                    <td id="ltekpi10" style="text-align:left"></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row"> <!--Nesting accordion to look below map-->
            <div class="col-xs-1">
                <div id="accordion" class="centerElement">
                    <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseBottom" aria-expanded="false" aria-controls="collapseBottom" id="btnDown">
                        <span class="glyphicon glyphicon-chevron-up" id="btnArrow" ></span>
                    </button>
                    <div class="collapse" id="collapseBottom">
                        <div class="well" >
                            <div role="tabpanel">
                                <!-- Nav tabs -->
                                <ul class="nav nav-tabs" role="tablist">
                                    <li role="presentation" class="active"><a href="#alarm" aria-controls="alarm" role="tab" data-toggle="tab">Alarms</a></li>
                                    <li role="presentation"><a href="#tt" aria-controls="tt" role="tab" data-toggle="tab">TT</a></li>
                                    <li role="presentation"><a href="#elevation" aria-controls="elevation" role="tab" data-toggle="tab">Elevation</a></li>
                                </ul>
                                <div class="infoSite">
                                    <p><!--LSE01001T--></p>
                                </div>
                                <!-- Tab panes -->
                                <div class="tab-content">
                                    <div role="tabpanel" class="tab-pane active" id="alarm">
                                        <div class="iframe" id="iframe_alarm" ></div>
                                    </div>
                                    <div role="tabpanel" class="tab-pane" id="tt">
                                        <div class="iframe" id="iframett" ></div>
                                    </div>
                                    <div role="tabpanel" class="tab-pane" id="elevation">
                                        <div class="iframe" id="elevation_chart"></div>
                                            <!-- DatePicker-->                    

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- end template -->
<!-- JavaScript -->
<script type="text/javascript" src="js/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="js/jquery.sparkline.js"></script>
<script type="text/javascript" src="js/bootstrap.js"></script>
<script type="text/javascript" src="js/GeoJSON.js"></script>
<script type="text/javascript" src="js/moment.min.js"></script>
<script type="text/javascript" src="js/bootstrap-datetimepicker.js"></script>
<script type="text/javascript" src="js/map.js"></script>
<script type="text/javascript" src="js/v3_epoly.js"></script>
<script type="text/javascript" src="js/sectors.js"></script>
<script type="text/javascript" src="js/contextmenu.js"></script>
<script type="text/javascript" src="js/elevation.js"></script>
<script type="text/javascript" src="js/neighbors.js"></script>
<script type="text/javascript" src="js/temporaryStorage.js"></script>
<script type="text/javascript" src="js/colors.js"></script>
<script type="text/javascript" src="js/CSVPlotter.js"></script>
<!--<script type="text/javascript" src="js/CanvasLayer.js"></script>
<script type="text/javascript" src="js/ShaderProgram.js"></script>
<script type="text/javascript" src="js/libtess.cat.js"></script>
<script type="text/javascript" src="js/WebGLLayer.js"></script>-->
<script type="text/javascript">//Local JS
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
                
    var collapseBottom = $('#collapseBottom');
    var btnArrow =  $('#btnArrow');
    collapseBottom.on('show.bs.collapse', function () {
        btnArrow.removeClass();
        btnArrow.toggleClass("glyphicon glyphicon-chevron-down");
    });
    collapseBottom.on('hide.bs.collapse', function () {
        btnArrow.removeClass();
        btnArrow.toggleClass("glyphicon glyphicon-chevron-up");
        //   $("#accordion").css("height","2.6%");
    });
    $('#btnRight').click(function () {
        var mapCanvas = $("#map-canvas");
        var width = mapCanvas.width();
        var parentWidth = mapCanvas.offsetParent().width();
        var widthper = 100*width/parentWidth;
        var btnArrowLeft = $('#btnArrowLeft');
        var accordion = $( "#accordion" );
        
        if (widthper==100) {
            mapCanvas.animate({ "width": (width - 325)+"px" }, "slow" );
            accordion.animate({ "width": (width - 325)+"px" }, "slow" );
            btnArrowLeft.removeClass();
            btnArrowLeft.toggleClass("glyphicon glyphicon-chevron-right");
        } else {
            mapCanvas.animate({ "width": "100%" }, "slow" );
            accordion.animate({ "width": "100%" }, "slow" );
            btnArrowLeft.removeClass();
            btnArrowLeft.toggleClass("glyphicon glyphicon-chevron-left");
        }
        $.sparkline_display_visible();
    });
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var str = $(e.target).html(); // The 'event.target' part is jQuery object, not a string so this way you wrapped.
        var n = str.search("KPI");
        if (n > -1) {
            // actually render any undrawn sparklines that are now visible in the DOM
            $.sparkline_display_visible();
        }
    });
    function blinker() {
        var blinkTxt = $('.blink_txt');
        blinkTxt.fadeOut(500);
        blinkTxt.fadeIn(500);
    }
    setInterval(blinker, 1000);
    $(document).ready(function(){
        $('#seartxt').keypress(function(e){
            if(e.keyCode==13){
                $('#searbtn').click();
                return false; // Avoid Refresh page after run function. This line kill everything
            }
        });
    });
    $(window).ready(function(){
        $("#test").css("display","block");
    });
</script>
</body>
</html>