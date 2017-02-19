<?php
$sketch_dir = 'sketches/';
$roots_file = 'root_sketches.json';
$thumb_dir = 'thumbs/';

$root_ids = array();
//checking of the rootfile exists if yes then loading it, if not then creating it
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
    if(isset($sketch_id)){
        $dirPath = $GLOBALS['sketch_dir'];
        $filePath = $dirPath.$sketch_id.".json";
        
        $sketch = json_decode(file_get_contents($filePath), true);
        return $sketch;
    }else{
        return "";
    }
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

//this returns the list of sketch ids starting from root travelling down to the $sketch
//this should be useful to display the tree for the user
function getTreeList($sketch_id, $treeList = array()){
    if(!isset($sketch_id)){//return empty array
        return array();
    }
    $sketch = getSketchObject($sketch_id);
    array_push($treeList, $sketch['uid']);
    if($sketch['parent'] == 'None'){
        return array_reverse($treeList);
    }else{
        return getTreeList($sketch['parent'], $treeList);
    }
}

//from here on are functions that return html code for quick page building
//this function just returns a generic division hmtl with given content and id
function html_div($content, $id="none", $class="none", $clickHref="", $dblClickHref=""){
    $div='<div id="'.$id.'" class="'.$class.'" onclick="'.$clickHref.'" ondblclick="'.$dblClickHref.'">';
    $div .= $content;
    $div .= '</div>';

    return $div;
}

//this function just returns a generic image tag with given id and src
function html_img($src, $id="none", $class="none"){
    $img = '<img src="'.$src.'" id = "'.$id.'" class="'.$class.'">';
    return $img;
}

function html_a($content, $href, $id="none", $class="none"){
    $a = '<a href="'.$href.'" id="'.$id.'" class="'.$class.'">'.$content.'</a>';
    return $a;
}
?>