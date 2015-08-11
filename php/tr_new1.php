<?php
    
    include("connection.php");  //get db connection
    
    if($_POST['submit'] =="submit") {
    

  //storing file in filename variable
    $fileName = $_FILES['file']['name'];
    //destination dir
    $to="/var/www/html/uploads/".$fileName;

    move_uploaded_file($_FILES['file']['tmp_name'],$to);
    print_r($_FILES);
    echo $_FILES['file']['tmp_name']."</br>";
    echo $_FILES['file']['type']."</br>";
    echo $to;
    }
?>