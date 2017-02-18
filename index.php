<?php
include 'common.php';
initialize_roots();

function getViewerHTML($sketch_id){
    //this method should calculate all the divs are return them
    $under_const_msg = html_div('This is under construction, please visit after some time','message');
    
    //adding the root sketches to the page
    $root_ids = $GLOBALS['root_ids'];
    $thumbs = "";
    for($i = 0; $i < count($root_ids); $i++){
        $root_sk = getSketchObject($root_ids[$i]);
        $img = html_img($root_sk['thumbnail'], $root_sk['uid'], 'thumb');
        
        $img_href = 'index.php?uid='.$root_sk['uid'];
        $img_link = html_a($img, $img_href, $root_sk['uid'], 'thumb');

        $thumb_div = html_div($img_link, $root_sk['uid'], 'thumb');
        $thumbs .= $thumb_div;
    }
    $pane = html_div($thumbs, 'pane_0', 'pane');

    // return $under_const_msg;
    return $pane;
}

$homePageURL = $_SERVER['REQUEST_URI'];
if(isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] == $homePageURL && issset($_GET['skID'])){
    $sketchID = $_GET['skID'];
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
    </head>
    <body>
        <div id="wrapper">
            <div id="page_header">
            </div>
            <div id="page_content">
END;

//pring main content here
print getViewerHTML('no sketch to show');

print<<<END
            <div>
        </div>
    </body>
</html>
END;

?>
