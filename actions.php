<?php

include 'common.php';
initialize_roots();

// print_r($root_ids);
//this is the data packet that will be sent to the client
function newDataPacket(){
    $data_packet = array("sketch"=>"",
                        "sketch_name"=>"",
                        "debug"=>"",
                        "message"=>"",
                        "data"=>"",
                        "error" => ""
                        );
    return $data_packet;
}

//This function adds the 
function addToRoots($skObj){
    if(!in_array($skObj['uid'], $GLOBALS['root_ids'])){
        array_push($GLOBALS['root_ids'], $skObj['uid']);
        update_roots($GLOBALS['root_ids']);
    }
}

//this function adds the $child_id to the child list of the parent
function addChild($parent_id, $child_id){
    $parent = getSketchObject($parent_id);
    if(!in_array($child_id, $parent['child'])){
        array_push($parent['child'], $child_id);
    }

    saveSketch($parent);
}

//this saves the sketch object in the relative path - $directory
function saveSketch($sketch){
    $path = $GLOBALS['sketch_dir'].$sketch['uid'].'.json';
    $fp = fopen($path, 'w');
    fwrite($fp, json_encode($sketch));
    fclose($fp);

    if($sketch['parent'] == 'None'){
        addToRoots($sketch);
    }else{
        //add this to the child list of the parent sketch
        addChild($sketch['parent'], $sketch['uid']);
    }

    //now saving the thumbnail of the sketch to the thumbs folder - pending

    return $path;
}

//this reads the file in filepath and returns the json as a string
function getJsonStr($filePath){
    $json_str = file_get_contents($filePath);
    return $json_str;
}

//this function checks the referers and returns if they are one of our pages
function checkRef(){
    $self_path = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    $path  = pathinfo($self_path);
    $app_files = array('scribble.php', 'scribble.html');
    for($i = 0; $i < count($app_files); $i++){
        $req_path = substr($_SERVER['HTTP_REFERER'], 0, strpos($_SERVER['HTTP_REFERER'], '?'));
        $app_path = 'http://'.$path['dirname'].'/'.$app_files[$i];
        if($req_path == $app_path){
            return TRUE;
        }
    }

    // $dp = newDataPacket();
    // $dp['debug'] = substr($_SERVER['HTTP_REFERER'], 0, strpos($_SERVER['HTTP_REFERER'], '?'));
    // $dp['debug'] .= ' and ';
    // $dp['debug'] .= 'http://'.$path['dirname'].'/'.$app_files[0].'?';

    // echo json_encode($dp);

    return FALSE;
}

if(isset($_POST['action']) && checkRef()){
    if($_POST['action'] == 'save'){
        //second param true does any needed conversions on input objects
        $sketch = json_decode($_POST['sketch'], true);
        $save_path = saveSketch($sketch);
        //building the data_packet to send
        $data_packet = newDataPacket();
        $data_packet['message'] = "succesfully saved ";
        $data_packet['sketch_name'] = $sketch['name'];
        echo json_encode($data_packet);

    }elseif($_POST['action'] == 'load'){
        $filePath = $sketch_dir.$_POST['sketch_id'].'.json';
        $sketch_obj = getSketchObject($_POST['sketch_id']);

        //building the data packet to send
        $data_packet = newDataPacket();
        $data_packet['sketch_name'] = $sketch_obj['name'];
        $data_packet['message'] = 'Succesfully loaded ';
        $data_packet['sketch'] = getJsonStr($filePath);
        //adding debug message if needed
        $data_packet['debug'] = json_encode($GLOBALS['root_ids']);
        echo json_encode($data_packet);
    }
}else{//the ajax request is coming from a wrong path
    $data_packet = newDataPacket();
    $data_packet['error'] = "I don't know you: ".$_SERVER['HTTP_REFERER'];
    echo json_encode($data_packet);
}
?>