<?php

$dirPath = "sketches/";

function getSketchObject($sketch_id){
    $dirPath = $_GLOBALS['dirPath'];
    $filePath = $dirPath.$sketch_id.".json";
    
    $sketch = json_decode(file_get_contents($filePath), true);
    return $sketch;
}

//this function gets the root sketch - oldest ancestor of any given sketch by doing recursion
function getRoot($sketch){
    if($sketch['uid'] == 'none'){
        return $sketch['uid'];
    }else if{
        $parentSketch = getSketchObject($sketch['parent']);
        return getRoot($parentSketch);
    }
}

function getViewerHTML($sketch_id){
    //this method should calculate all the divs are return them
    
    $sketch = getSketchObject($sketch_id);
    //$sketch['parent'] is the id of the parent sketch
    //$sketch['child'] is a list of id's of children of this sketch
}

$homePageURL = "index.php";
if(isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] == $homePageURL && issset($_GET['skID'])){}
    $sketchID = $_GET['skID'];
    print getViewerHTML($sketchID);
?>
