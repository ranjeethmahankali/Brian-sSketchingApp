<?php
include 'common.php';
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
        $thumb_div = html_div($imgWithLabel, $skObj['uid'], $class, $img_href, $scribble_href);
        $thumbs .= $thumb_div;
    }
    $pane = html_div($thumbs, 'pane_'.$paneNum, 'pane');

    return $pane;
}

//this method should calculate all the divs are return them
function getViewerHTML($sketch_id){
    //this is the under construction return this and nothing else when u want to use it
    $under_const_msg = html_div('This is under construction, please visit after some time','message');
    
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
if(isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] == $homePageURL && issset($_GET['uid'])){
    $sketchID = $_GET['uid'];
    print getViewerHTML($sketchID);
}else{
    //if user manually enters some id, then we redirect him to the main page.
    //header("Location: index.php");
}

print<<<END
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title>Brian's Sketching App</title>
        <link rel="stylesheet" type="text/css" href="../style.css">
        <link rel="stylesheet" type="text/css" href="style1.css">
    </head>
    <body>
        <div id="wrapper">
            <div id="page_header">
            </div>
            <div id="page_content">
END;

//pring main content here
print getViewerHTML($_GET['uid']);

print<<<END
            </div>
            <div id = "page_footer">
                <a href="http://validator.w3.org/check?uri=referer" id = "validation_link" target="_blank">
                    Validate this page
                </a> | 
                <a href = "../a2/index.html">About Me</a> |
                <a href = "../index.html">Home Page</a> |
                <a href = "../contact/index.php">Contact me</a>
            </div>
            
        </div>
        <script type="text/javascript">
            function scribble(uid){
                var href = 'scribble.php?uid='+uid;
                scribWindow = window.open(href, 'Scribble', 'width=630,height=670,scrollbars=no');
            }
        </script>
    </body>
</html>
END;

?>
