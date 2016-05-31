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
                <a href="#" class="closebtn-left"> <span class="glyphicon glyphicon-remove" ></span></a>            
                <div class="sidenav-heading-title">
                    <h4>Layers</h4>  
                </div>            
            </div>
        </ul>    
            <div id="layer-sidenav" class="sidenav rmv-obj">


                            
				<!-- begin sidebar nav -->
				<ul class="nav">

					<li class="has-sub active">
						<a href="javascript:;">
						    <b class="caret pull-right"></b>
						    <i class="fa fa-laptop"></i>
						    <span>Dashboard</span>
					    </a>
						<ul class="sub-menu">
						    <li><a href="index.html">Dashboard v1</a></li>
						    <li class="active"><a href="index_v2.html">Dashboard v2</a></li>
						</ul>
					</li>
					<li class="has-sub">
						<a href="javascript:;">
							<span class="badge pull-right">10</span>
							<i class="fa fa-inbox"></i> 
							<span>Email</span>
						</a>
						<ul class="sub-menu">
						    <li><a href="email_inbox.html">Inbox v1</a></li>
						    <li><a href="email_inbox_v2.html">Inbox v2</a></li>
						    <li><a href="email_compose.html">Compose</a></li>
						    <li><a href="email_detail.html">Detail</a></li>
						</ul>
					</li>
					<li class="has-sub">
						<a href="javascript:;">
						    <b class="caret pull-right"></b>
						    <i class="fa fa-suitcase"></i>
						    <span>UI Elements</span> 
						</a>
						<ul class="sub-menu">
							<li><a href="ui_general.html">General</a></li>
							<li><a href="ui_typography.html">Typography</a></li>
							<li><a href="ui_tabs_accordions.html">Tabs & Accordions</a></li>
							<li><a href="ui_unlimited_tabs.html">Unlimited Nav Tabs</a></li>
							<li><a href="ui_modal_notification.html">Modal & Notification</a></li>
							<li><a href="ui_widget_boxes.html">Widget Boxes</a></li>
							<li><a href="ui_media_object.html">Media Object</a></li>
							<li><a href="ui_buttons.html">Buttons</a></li>
							<li><a href="ui_icons.html">Icons</a></li>
							<li><a href="ui_simple_line_icons.html">Simple Line Icons</a></li>
							<li><a href="ui_ionicons.html">Ionicons</a></li>
							<li><a href="ui_tree.html">Tree View</a></li>
							<li><a href="ui_language_bar_icon.html">Language Bar & Icon</a></li>
						</ul>
					</li>
					<li class="has-sub">
						<a href="javascript:;">
						    <b class="caret pull-right"></b>
						    <i class="fa fa-align-left"></i> 
						    <span>Menu Level</span>
						</a>
						<ul class="sub-menu">
							<li class="has-sub">
								<a href="javascript:;">
						            <b class="caret pull-right"></b>
						            Menu 1.1
						        </a>
								<ul class="sub-menu">
									<li class="has-sub">
										<a href="javascript:;">
										    <b class="caret pull-right"></b>
										    Menu 2.1
										</a>
										<ul class="sub-menu">
											<li><a href="javascript:;">Menu 3.1</a></li>
											<li><a href="javascript:;">Menu 3.2</a></li>
										</ul>
									</li>
									<li><a href="javascript:;">Menu 2.2</a></li>
									<li><a href="javascript:;">Menu 2.3</a></li>
								</ul>
							</li>
							<li><a href="javascript:;">Menu 1.2</a></li>
							<li><a href="javascript:;">Menu 1.3</a></li>
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
            <a class="icon-active" href="#" data-toggle="tooltip" data-placement="right" title="Layers"><i class="glyphicon glyphicon-globe layer-icon"></i></a>
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
        
  









  
        <div class="offcanvas offcanvas-right">
        
            <div class="sidenav-heading rmv-obj-right">
               <span class="glyphicon glyphicon-remove closebtn-right" ></span>
               <h4>Technology</h4>                  
            </div>        
        
        
        
            <div id="mySidenav" class="sidenav rmv-obj-right">

                <p> <input type="radio" name="opttech" value="LTE" onclick="secDraw();" checked> LTE </p>

                 <p> <input type="radio" name="opttech" value="UMTS" onclick="secDraw();"> UMTS</p>

                 <p> <input type="radio" name="opttech" value="GSM" onclick="secDraw();"> GSM</p>
                              
            </div> 
            
            
      
            
            
        </div> 
        
        <div class="icon-bar icon-bar-right">
            <a class="icon-active" href="#"  data-toggle="tooltip" data-placement="left" title="Technology"><i class="glyphicon glyphicon-signal home2"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="Sector"><i class="glyphicon glyphicon-tower"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="KPIs"><i class="glyphicon glyphicon-stats"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="Alarms"><i class="glyphicon glyphicon-bell"></i></a> 
            <a href="#" data-toggle="tooltip" data-placement="left" title="TT"><i class="glyphicon glyphicon-fire"></i></a>
            <a href="#" data-toggle="tooltip" data-placement="left" title="WO"><i class="glyphicon glyphicon-wrench"></i></a>           
            <a href="#" data-toggle="tooltip" data-placement="left" title="Default"><i class="glyphicon glyphicon-refresh"></i></a> 
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
    
    
    

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"
    integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>    
    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug 
    <script src="../../assets/js/ie10-viewport-bug-workaround.js"></script>-->
    
  

    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCDjB5G0Fod2mUs0u9a-B4cF3xyqQa5uAs&sensor=false"></script>
    <script type="text/javascript" src="js/markerclusterer.min.js"></script>
    <script type="text/javascript" src="js/maplabel.js"></script> 
    <script src="https://www.google.com/jsapi"></script>    
  
    <script type="text/javascript" src="js/chance.min.js"></script>
    <script type="text/javascript" src="js/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.sparkline.js"></script>
    <script type="text/javascript" src="js/bootstrap.js"></script>
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
    <script type="text/javascript" src="js/map.js"></script>     
 
   
    <script type="text/javascript">
    
        $(".closebtn-left").click(function(){
            $(".icon-bar-left").animate({left: '0px'});
            $(".offcanvas-left").animate({width: '0px'});
            $(".offcanvas-left").css({'padding-left': '0px', 'padding-right': '0px'});
            $(".rmv-obj-left").css({'display':'none'}); 

        });


        $(".layer-icon").click(function(){
            $(".icon-bar-left").animate({left: '200px'});
            $(".offcanvas-left").animate({width: '200px'});
            $(".offcanvas-left").css({'padding-left': '0px', 'padding-right': '0px'});
            $(".rmv-obj-left").css({'display':'block'}); 
        }); 

        $(".closebtn-right").click(function(){
            $(".icon-bar-right").animate({right: '0px'});
            $(".offcanvas-right").animate({width: '0px'});
            $(".offcanvas-right").css({'padding-left': '0px', 'padding-right': '0px'});
            $(".rmv-obj-right").css({'display':'none'}); 

        });


        $(".home2").click(function(){
            $(".icon-bar-right").animate({right: '200px'});
            $(".offcanvas-right").animate({width: '200px'});
            $(".offcanvas-right").css({'padding-left': '8px', 'padding-right': '5px'});
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
    
  </body>
</html>
