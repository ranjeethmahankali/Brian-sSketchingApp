<?php
$sketch_dir = 'sketches/';
$roots_file = 'root_sketches.json';

$root_ids = array();
//checking of the rootfile exists, if not creating it
function initialize_roots(){
    $sketch_dir = $GLOBALS['sketch_dir'];
    $roots_file = $GLOBALS['roots_file'];
    if(file_exists($sketch_dir.$roots_file)){
        $GLOBALS['root_ids'] = load_roots();
    }else{
        $GLOBALS['root_ids'] = empty_roots_file();
    }
}

//this function empties the root sketch list and saves it in a file
//don't use it unless resetting the entire app, it messes up all data
function empty_roots_file(){
    $sketch_dir = $GLOBALS['sketch_dir'];
    $roots_file = $GLOBALS['roots_file'];
    $roots = array();
    $fp = fopen($sketch_dir.$roots_file, 'w');
    fwrite($fp, json_encode($roots));
    fclose($fp);
    return $roots;
}

function load_roots(){
    $sketch_dir = $GLOBALS['sketch_dir'];
    $roots_file = $GLOBALS['roots_file'];
    $json_str = file_get_contents($sketch_dir.$roots_file);
    $roots = json_decode($json_str);
    return $roots;
}

function update_roots($roots_var){
    $sketch_dir = $GLOBALS['sketch_dir'];
    $roots_file = $GLOBALS['roots_file'];
    $fp = fopen($sketch_dir.$roots_file, 'w');
    fwrite($fp, json_encode($roots_var));
    fclose($fp);
}

function getSketchObject($sketch_id){
    $dirPath = $GLOBALS['sketch_dir'];
    $filePath = $dirPath.$sketch_id.".json";
    
    $sketch = json_decode(file_get_contents($filePath), true);
    return $sketch;
}

//this function gets the root sketch - oldest ancestor of any given sketch by doing recursion
function getRoot($sketch){
    if($sketch['uid'] == 'none'){
        return $sketch['uid'];
    }else{
        $parentSketch = getSketchObject($sketch['parent']);
        return getRoot($parentSketch);
    }
}
?>