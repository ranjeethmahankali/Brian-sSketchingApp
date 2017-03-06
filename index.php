<?php
require_once __DIR__ . '/src/Facebook/autoload.php';
include 'common.php';
include 'login.php';

initialize_roots();

//this takes a list of ids, puts those thumbnails in a div and returns it
function getPane($id_list, $paneNum, $active_id){
    //active id is the id of the thumbnail that is currently clicked, if any
    $thumbs = "";
    for($i = 0; $i < count($id_list); $i++){
        $skObj = getSketchObject($id_list[$i]);
        $img = html_img($skObj['thumbnail'], $skObj['uid'], 'thumb');

        $label = html_div($skObj['name'], $skObj['uid'].'_label', 'label');
        $imgWithLabel = $img.$label;

        $class = 'thumb';
        if($skObj['uid'] == $active_id){
            $class .= '_active';
        }

        $img_href = 'location.href=\'index.php?uid='.$skObj['uid'].'\'';
        $scribble_href = 'scribble(\''.$skObj['uid'].'\')';
        $thumb_div=html_div($imgWithLabel,$skObj['uid'],$class,$img_href,$scribble_href,$skObj['name']);
        $thumbs .= $thumb_div;
    }
    $pane = html_div($thumbs, 'pane_'.$paneNum, 'pane');

    return $pane;
}

//this method should calculate all the divs are return them
function getViewerHTML($sketch_id){
    //this is the under construction return this and nothing else when u want to use it
    // $under_const_msg = html_div('This is under construction, please visit after some time','message');

    //if the uid is invalid then redirect to the normal main page by ignoring the id
    $filePath = $GLOBALS['sketch_dir'].$sketch_id.'.json';
    if(!file_exists($filePath)){
        unset($sketch_id);
    }

    $treeList = getTreeList($sketch_id);
    //adding the root sketches to the page
    $root_ids = $GLOBALS['root_ids'];
    $root_pane = getPane($root_ids, 0, $treeList[0]);

    $contents = $root_pane;
    for($i = 0; $i < count($treeList); $i++){
        $skObj = getSketchObject($treeList[$i]);
        $activeID = $treeList[($i + 1) % count($treeList)];
        $contents .= getPane($skObj['child'], ($i+1), $activeID);
    }

    $viewer = html_div($contents, 'viewer', 'viewer');
    return $viewer;
}

$homePageURL = $_SERVER['REQUEST_URI'];
if(!isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] != $homePageURL && isset($_GET['uid'])){
    $sketchID = $_GET['uid'];
    //print getViewerHTML($sketchID);
    $self_path = $_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'];
    $path  = pathinfo($self_path);
    $target = 'http://'.$path['dirname'].'/index.php';
    header("Location: $target");
}

//if this session variable is set and equal to YES, then we know that user opened scribble app
//from the home page and not by entering the url manually

print<<<END
<!DOCTYPE html>
<html>
    <head>
       <meta charset="utf-8"/>
        <title>Brians Sketching App</title>
        <link rel="stylesheet" type="text/css" href="style1.css">
        <meta charset="UTF-8">
        </style>
    </head>
    <body>
END;

$topLine  = "<p>Navigate the sketch tree below. If you want to edit one or make your own sketch, ";
$topLine .= "<button onclick=\"location.href='$loginUrl'\">Login with Facebook</button></p>";

$userInfo = "";
if (isset($_SESSION['facebook_access_token'])){
    $topLine = "<p>Navigate the sketch tree and doubleclick a sketch to edit it or create a:";
    $topLine .= "<button onclick='scribble()'>New Sketch</button></p>";

    //print log in user name and fb profile image
    $fb->setDefaultAccessToken($_SESSION['facebook_access_token']);
    $response = $fb->get('/me?fields=email,name');
    $userNode = $response->getGraphUser();

    $username = $userNode->getName();
    //$userEmail = $userNode->getField('email');

    $userInfo = $username.'<br />';
    $image = 'https://graph.facebook.com/'.$userNode->getId().'/picture?height=50';
    $userInfo .= "<img src ='$image' id='profile_pic'/>";
}

print<<<END
        <div id="wrapper">
            <div id="page_header">
                $topLine
                <div id="user_info">
                $userInfo
                </div>
            </div>
            <div id="page_content">
END;
//print main content here
print getViewerHTML($_GET['uid']);

print<<<END
            </div>
            <div id = "page_footer">
            </div>

        </div>
        <script type="text/javascript">
            function scribble(uid){
                if(uid === undefined){
                    var href = 'scribble.php';
                }else{
                    var href = 'scribble.php?uid='+uid;
                }
                scribWindow = window.open(href, 'Scribble', 'width=625,height=670,scrollbars=no');
            }
        </script>
    </body>
</html>
END;

?>
