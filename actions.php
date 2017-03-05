<?php
require_once __DIR__ . '/src/Facebook/autoload.php';
include 'common.php';
include 'login.php';

$fb->setDefaultAccessToken($_SESSION['facebook_access_token']);
$response = $fb->get('/me?fields=email,name');
$userNode = $response->getGraphUser();

$username = $userNode->getName();
$userEmail = $userNode->getField('email');

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
        $req_path = $_SERVER['HTTP_REFERER'];
        if(strpos($_SERVER['HTTP_REFERER'], '?') !== FALSE){
            $req_path = substr($_SERVER['HTTP_REFERER'], 0, strpos($_SERVER['HTTP_REFERER'], '?'));
        }
        $app_path = 'http://'.$path['dirname'].'/'.$app_files[$i];
        if($req_path == $app_path){
            return TRUE;
        }
    }

    return FALSE;
}

if(isset($_POST['action']) && checkRef()){
    if($_POST['action'] == 'save'){
        //second param true does any needed conversions on input objects
        $sketch = json_decode($_POST['sketch'], true);
        $sketch['author'] = $username;
        $sketch['email'] = $userEmail;

        $save_path = saveSketch($sketch);
        //building the data_packet to send
        $data_packet = newDataPacket();
        $data_packet['message'] = "succesfully saved ";
        $data_packet['sketch_name'] = $sketch['name'];
        echo json_encode($data_packet);

    }elseif($_POST['action'] == 'load'){
        $filePath = $sketch_dir.$_POST['sketch_id'].'.json';
        if(file_exists($filePath)){
            $sketch_obj = getSketchObject($_POST['sketch_id']);
            $sketch_obj['author'] = $username;
            $sketch_obj['email'] = $userEmail;
            //building the data packet to send
            $data_packet = newDataPacket();
            $data_packet['sketch_name'] = $sketch_obj['name'];
            $data_packet['message'] = 'Succesfully loaded ';
            $data_packet['sketch'] = getJsonStr($filePath);
            //adding debug message if needed
            $data_packet['debug'] = json_encode($GLOBALS['root_ids']);
            echo json_encode($data_packet);
        }else{
            $data_packet = newDataPacket();
            $data_packet['error'] = 'Could not find that sketch file !';
            echo $data_packet;
        }
    }
}else{//the ajax request is coming from a wrong path
    $data_packet = newDataPacket();
    $data_packet['error'] = "I don't know you: ".$_SERVER['HTTP_REFERER'];
    echo json_encode($data_packet);
}
?>