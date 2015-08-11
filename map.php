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
    <link href="css/bootstrap.css" rel="stylesheet">

    <!-- Add custom CSS here -->
    <link href="css/general.css" rel="stylesheet">
    <!-- context-menu -->
    <link  href="css/contextmenu.css" rel="stylesheet">

    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCDjB5G0Fod2mUs0u9a-B4cF3xyqQa5uAs&sensor=false"></script>
    <script type="text/javascript" src="js/markerclusterer.js"></script>
    <script src="https://www.google.com/jsapi"></script>
</head>
<body>
<!-- begin template -->
<div class="navbar navbar-custom navbar-fixed-top">
    <div class="navbar-header"><a class="navbar-brand" href="#"><strong>IdocTool</strong></a>
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

<div id="test" >


    <div id="map-canvas"></div>
    <div id="nav-menu">

        <ul class="nav nav-pills">
            <li role="presentation"  >
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Market <span class="caret"></span>
                </a>

                <ul class="dropdown-menu">
                    <li onclick="mkt_kpi('Seattle')"><a href="#">Seattle</a></li>
                    <li onclick="mkt_kpi('Spokane')"><a href="#">Spokane</a></li>
                    <li onclick="mkt_kpi('Portland')"><a href="#">Portland</a></li>
                    <li onclick="mkt_kpi('Phoenix')"><a href="#">Phoenix</a></li>
                </ul>




            </li>

            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Cluster <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio1" value="option1" onclick="showFeature(cluster,'KPI_1');" > <!--Please check map.js check Global Scope-->
                            Leakage (%)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio2" value="option2" onclick="showFeature(cluster,'KPI_2');" >
                            LTE Drops (#)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio3" value="option3" onclick="clearMap();" >
                            None
                        </label>
                    </div>
                </ul>
            </li>

            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Subcluster <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio4" value="option4" onclick="showFeature(subcluster,'KPI_1');" >
                            Leakage (%)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio5" value="option5" onclick="showFeature(subcluster,'KPI_2');">
                            LTE Drops (#)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsRadios" id="radio6" value="option6" onclick="clearMap();" >
                            None
                        </label>
                    </div>
                </ul>
            </li>




            <li role="presentation" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                    Site <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsBTS" id="radio1" value="option5" onclick="sites('KPI_1');">
                            Leakage (%)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsBTS" id="radio2" value="option6" onclick="sites('KPI_2');">
                            LTE Drops (#)
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="optionsBTS" id="radio3" value="option7" onclick="sites('No');">
                            None
                        </label>
                    </div>
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
                                <input type="radio" name="optionsMaps" id="radio1" value="option1" onclick="truecall('rsrp');" >
                                RSRP (TrueCall)
                            </label>
                        </div>
                    </li>

                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio2" value="option2" onclick="truecall('rsrq');">
                                RSRQ (TrueCall)
                            </label>
                        </div>
                    </li>

                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio3" value="option3" onclick="truecall('pci');">
                                PCI (TrueCall)
                            </label>
                        </div>
                    </li>

                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio4" value="option4" onclick="truecall('traffic');">
                                Traffic (TrueCall)
                            </label>
                        </div>
                    </li>

                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio5" value="option5" onclick="pcc('TMo_TechLTE_Map');">
                                PCC
                            </label>
                        </div>
                    </li>

                    <li>
                        <div class="radio">
                            <label>
                                <input type="radio" name="optionsMaps" id="radio6" value="option6" onclick="pcc('TMo_Verified_Map');">
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
                                <input type="checkbox" name="checkMaps" id="check0" value="" onclick="srs();" >
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
                                <input type="checkbox" name="checkMaps2" id="check2" value="" onclick="L700();" >
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
                                </button>
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

        <div class="col-xs-10"><!--map-canvas will be postioned here--></div>

        <div class="col-xs-2" id="rightside">




            <h3>KPI</h3>
            <hr>

            <div class="infoCell">
                <p><!--LSE01001T - 04/15/15--></p>
            </div>


            <div id="kpi">
                <!-- Div pending to add -->
                <div class="row">

                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Quality</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Bad CQI</td>
                                    <td id="ltekpi0" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">SINR Pusch</td>
                                    <td id="ltekpi1" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Ave CQI</td>
                                    <td id="ltekpi2" style="text-align:left"></td>
                                </tr>

                            </table>
                        </div>
                    </div>
                </div>


                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Coverage</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">UE Pwr Hdrm</td>
                                    <td id="ltekpi6" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Usage MIMO</td>
                                    <td id="ltekpi4" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Usage AGG2</td>
                                    <td id="ltekpi5" style="text-align:left"></td>
                                </tr>

                            </table>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Throughput</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Ave PDCP DL</td>
                                    <td id="ltekpi12" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Max PDCP DL</td>
                                    <td id="ltekpi13" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Ave DL Latency</td>
                                    <td id="ltekpi14" style="text-align:left"></td>
                                </tr>

                            </table>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">Capacity</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">DL Vol(MB)</td>
                                    <td id="ltekpi7" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Ave Act UE</td>
                                    <td id="ltekpi9" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Max Act UE</td>
                                    <td id="ltekpi10" style="text-align:left"></td>
                                </tr>

                            </table>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">VoLTE 1</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">VoLTE Calls</td>
                                    <td id="ltekpi15" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">VoLTE Afr</td>
                                    <td id="ltekpi17" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">VoLTE Dcr</td>
                                    <td id="ltekpi18" style="text-align:left"></td>
                                </tr>

                            </table>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">VoLTE 2</h3>
                            </div>
                            <table class="table table-condensed">
                                <tr>
                                    <td style="text-align:right;font-weight: bold">SRVCC Att</td>
                                    <td id="ltekpi20" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">VoLTE Drops</td>
                                    <td id="ltekpi19" style="text-align:left"></td>
                                </tr>
                                <tr>
                                    <td style="text-align:right;font-weight: bold">Rach/RRC Att</td>
                                    <td id="ltekpi22" style="text-align:left"></td>
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
<script type="text/javascript" src="js/map.js"></script>
<script type="text/javascript" src="js/v3_epoly.js"></script>
<script type="text/javascript" src="js/sectors.js"></script>
<script type="text/javascript" src="js/contextmenu.js"></script>
<script type="text/javascript" src="js/elevation.js"></script>

<script type="text/javascript">

    $('#collapseBottom').on('show.bs.collapse', function () {
        $('#btnArrow').removeClass();
        $('#btnArrow').toggleClass("glyphicon glyphicon-chevron-down");
    })

    $('#collapseBottom').on('hide.bs.collapse', function () {
        $('#btnArrow').removeClass();
        $('#btnArrow').toggleClass("glyphicon glyphicon-chevron-up");
        //   $("#accordion").css("height","2.6%");
    })

    $('#btnRight').click(function () {
        var width = $("#map-canvas").width();
        var parentWidth = $("#map-canvas").offsetParent().width();
        var widthper = 100*width/parentWidth;

        if (widthper==100) {

            $( "#map-canvas" ).animate({ "width": "82.6333%" }, "slow" );
            $( "#accordion" ).animate({ "width": "82.6333%" }, "slow" );

            $('#btnArrowLeft').removeClass();
            $('#btnArrowLeft').toggleClass("glyphicon glyphicon-chevron-right");

        } else {

            $( "#map-canvas" ).animate({ "width": "100%" }, "slow" );
            $( "#accordion" ).animate({ "width": "100%" }, "slow" );
            $('#btnArrowLeft').removeClass();
            $('#btnArrowLeft').toggleClass("glyphicon glyphicon-chevron-left");
        }
        $.sparkline_display_visible();

    })

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var str = $(e.target).html(); // The 'event.target' part is jQuery object, not a string so this way you wrapped.
        var n = str.search("KPI");

        if (n > -1) {
            // actually render any undrawn sparklines that are now visible in the DOM
            $.sparkline_display_visible();
        }

    })

    function blinker() {
        $('.blink_txt').fadeOut(500);
        $('.blink_txt').fadeIn(500);
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