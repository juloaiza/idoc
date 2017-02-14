<?php

    session_start();
    
    if($_GET["logout"]==1 AND $_SESSION['id']) { //Only will be log out when there any session
        
        session_destroy();
        $message="You have been logged out. Have a nice day";
    
    }
    
    include("php/connection.php");  //get db connection
    
    if($_POST['submit'] =="Sign Up") {
        
        if (!$_POST['fname']) $error.="<br />Please enter your email"; 

        if (!strtolower($_POST['email'])) $error.="<br />Please enter your email"; //No {} because only a line
            else if (!filter_var(strtolower($_POST['email']), FILTER_VALIDATE_EMAIL)) $error.="<br />Please enter a valid email address";
            
        if (!$_POST['password']) $error.="<br />Please enter your password";  //check if password was defined
            else {
                
                //Password Validation
                if (strlen($_POST['password'])<4) $error.="<br />Please enter a password with at least 8 characters";
               // if (!preg_match('`[A-Z]`', $_POST['password'])) $error.="<br />Please include at least one capital letter in your password";               
                              
                
            }

        if (!$_POST['market']) $error.="<br />Please enter your market";             
            
        if ($error) $error = "There were error(s) in your signup details:".$error;
        else {
            

            
            $query = "SELECT * FROM users WHERE email='".mysqli_real_escape_string($link,strtolower($_POST['email']))."'"; //avoide sql injection I have to use .mysqli_real_escape_strung($link,
            
            $result = mysqli_query($link, $query);
            
            $results = mysqli_num_rows($result);
            
            if ($results) $error = "That email address is already registered. Do you want to log in?";
            else {
                
                $query="INSERT INTO `users` (`name`,`email`, `password`,`market`) VALUES('".mysqli_real_escape_string($link,$_POST['fname'])."','".mysqli_real_escape_string($link,strtolower($_POST['email']))."','".md5(md5(strtolower($_POST['email'])).$_POST['password'])."','".mysqli_real_escape_string($link,$_POST['market'])."')";
                
                mysqli_query($link, $query);
                
                echo "You've been signed up!";
                
                //Create a user session to remind active for loging
                $_SESSION['id'] = mysqli_insert_id($link);//SESSION ARRAY using id was inserted on db
                
                //print_r($_SESSION);
                
                // Redirect to logged in page
                
                //User_Tracking
                $query="INSERT INTO `users_tracking` (`name`,`logging`) VALUES('".mysqli_real_escape_string($link,$_POST['fname'])."',NOW())";
                
                mysqli_query($link, $query);                

                header("Location:map.php");
                exit();
                
            }
            
            
        }
        
        
    }
    
    
    if ($_POST['submit'] == "Log In") {

        $query = "SELECT * FROM users WHERE email='".mysqli_real_escape_string($link,strtolower($_POST['loginemail']))."' AND password='".md5(md5(strtolower($_POST['loginemail'])).$_POST['loginpassword'])."' LIMIT 1"; 

        $result = mysqli_query($link, $query);
        
        $row = mysqli_fetch_array($result);
        
        if ($row) {
            
            $_SESSION['id'] = $row['id'];//get id
 
            //User_Tracking
            $query="INSERT INTO `users_tracking` (`name`,`logging`) VALUES('".$row['name']."',NOW())";
            mysqli_query($link, $query);               
            
           header("Location:map.php");
           exit();
        } else {
            
            $error = "We could not find a user with that email and password.Please try again or <a href='url'>reset here</a>";
            
        }
        
    }
    
  
?>