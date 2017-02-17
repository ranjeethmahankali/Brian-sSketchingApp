<?php

include 'common.php';
initialize_roots();

function addToRoots($skObj){
    array_push($GLOBALS['root_ids'], $skObj['uid']);
    update_roots($GLOBALS['root_ids']);
}

function saveToFile($sketch, $directory){
    $path = $directory.$sketch['uid'].'.json';
    $fp = fopen($path, 'w');
    fwrite($fp, json_encode($sketch));
    fclose($fp);

    if($sketch['parent'] == 'None'){
        addToRoots($sketch);
    }

    return $path;
}

function getJsonStr($filePath){
    $json_str = file_get_contents($filePath);
    return $json_str;
}

$self_path = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$path  = pathinfo($self_path);
$app_file = 'scribble_old.html';
$app_path = 'http://'.$path['dirname'].'/'.$app_file;

if(isset($_POST['action']) && $_SERVER['HTTP_REFERER'] == $app_path){
    if($_POST['action'] == 'save'){
        //second param true does any needed conversions on input objects
        $sketch = json_decode($_POST['sketch'], true);
        $save_path = saveToFile($sketch, $sketch_dir);
        echo "File succesfully saved !";
    }elseif($_POST['action'] == 'load'){
        $filePath = $sketch_dir.$_POST['sketch_id'].'.json';
        echo getJsonStr($filePath);
    }
}
?>