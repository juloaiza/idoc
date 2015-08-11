<?php
    $host="localhost"; //replace with your hostname
    $username="jloaiza"; //replace with your username
    $password="14052750"; //replace with your password
    $db_name="doctool"; //replace with your database
    
    $link = mysqli_connect("$host", "$username", "$password","$db_name") or die("Error " . mysqli_error($link)); 
    
?>