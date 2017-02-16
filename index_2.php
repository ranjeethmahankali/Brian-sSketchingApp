<?php
function getViewerHTML($sketch_id){
    //this method should calculate all the divs are return them
}

$homePageURL = "index.php";
if(isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] == $homePageURL && issset($_GET['skID'])){}
    $sketchID = $_GET['skID'];
    print getViewerHTML($sketchID);
?>
