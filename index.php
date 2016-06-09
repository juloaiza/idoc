<?php
require_once("php/login.php");
?>
<!doctype html>
<html>
<head>
    <title>Idoc</title>
    <link rel="icon" href="favicon.ico">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!-- Add custom CSS here -->
    <link href="css/general.css" rel="stylesheet">
    <!-- Javascript -->
    <script type='text/javascript' src="js/css3-mediaqueries.js"></script>
    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script type='text/javascript' src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <script type='text/javascript' src="//cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.js"></script>
    <![endif]-->
    <style>
        html, body {
            height:100%; /*required to expand picture on the page */
        }
        #bodyContainer {
            background-image:url("images/old_book.jpg");
            width:100%;
            height:100%;
            background-size:cover; /*only one picture */
            background-position:center; /*center the picture all the time */
            padding-top:100px;
        }
        .center{ /*center title and text */
            text-align:center;
        }
        p {
            padding-top:15px;
            padding-bottom:15px;
        }
        .white  {
            color:white;
        }
        #topRow h1 {
            font-size:300%;
        }
        .bold {
            font-weight:bold;
        }
        .navbar-brand { /*change font to nav bar*/
            font-size:1.8em;
        }
        .signform {
            width:60%;
            margin-top:10%;
        }
        .html5placeholder {
            color: #aaa;
        }
        
        
        .btn {
            background-color: #E20074;
            color:white;
        }
        .btn:hover {
            background-color: #A10053;
            color:white;
        } 
        
    </style>
</head><body>
<div class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#"><img alt="Brand" src="images/iDocIcon.png" style="height:20px;margin-top:-4px;">&nbsp;<strong>Idoc</strong></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <form class="navbar-form navbar-right" method="POST">
                <div class="form-group">
                    <!--<label class="white" for="loginemail">Email</label>-->
                    <input type="email" name="loginemail" id="loginemail" class="form-control" placeholder="Email" value="<?php echo addslashes(strtolower($_POST['loginemail'])); ?>" style="text-transform: lowercase;"/> <!--addslashes avoid issue with especial chars (escapes)-->
                </div>
                <div class="form-group">
                    <!--<label class="white" for="loginpassword">Password</label>-->
                    <input type="password" name="loginpassword" class="form-control" placeholder="Password" value="<?php echo addslashes($_POST['loginpassword']); ?>" />
                </div>
                <input type="submit" name="submit" class="btn" value="Log In" />
                <!--<button type="submit" class="btn btn-success">Sign in</button> -->
            </form>
        </div><!--/.navbar-collapse -->
    </div>
</div>
<div class="container" id="bodyContainer"> <!--1-->
    <div class="row" id="topRow"> <!--2-->
        <div class="col-md-4 col-md-offset-5 center"> <!--3--> <!--col-md-offset-? help to move the column horizontal-->
            <div class="signform">
                <h1 class="bold center white">Idoc</h1>
                <!--      <p class="center white"></p> -->
                <p class="lead center white">First Time? Sign up Below! </p>
                <?php
                if($error) {
                    echo '<div class="alert alert-danger">'.addslashes($error).'</div>';
                }
                if($message) {
                    echo '<div class="alert alert-success">'.addslashes($message).'</div>';
                }
                ?>
                <form method="POST">
                    <div class="form-group">
                        <!-- <label class="white" for="fname">Full Name</label>-->
                        <input type="text" name="fname" id="fname" class="form-control" placeholder="Name" value="<?php echo addslashes($_POST['fname']); ?>" /> <!--addslashes avoid issue with especial chars (escapes)-->
                    </div>
                    <div class="form-group">
                        <!-- <label class="white" for="email">Email</label> -->
                        <input type="email" name="email" id="email" class="form-control" placeholder="Email" value="<?php echo addslashes(strtolower($_POST['email'])); ?>" style="text-transform: lowercase;"/> <!--addslashes avoid issue with especial chars (escapes)-->
                    </div>
                    <div class="form-group">
                        <!-- <label class="white" for="password">Password</label>-->
                        <input type="password" name="password" class="form-control" placeholder="Create a password" value="<?php echo addslashes($_POST['password']); ?>" />
                    </div>
                    <div class="form-group">
                        <select class="form-control" name="market" >
                            <option value="" disabled selected style='display:none;'>Choose your Market</option>
                            <option value="Seattle">Seattle</option>
                            <option value="Spokane">Spokane</option>
                            <option value="Portland">Portland</option>
                            <option value="Phoenix">Phoenix</option>
                        </select>
                    </div>
                    <input type="submit" name="submit" class="btn btn-lg" value="Sign Up" />
                </form>
            </div>
        </div>
    </div>
</div>
<!--JavaScript-->
<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
<!-- PlaceHolder for IE<=9 -->
<script type="text/javascript" src="js/jquery.placeholder.min.js"></script>
<script type="text/javascript">
    // Invoke the plugin
    $('input, textarea').placeholder({customClass:'html5placeholder'});
</script>
</body>
</html>
