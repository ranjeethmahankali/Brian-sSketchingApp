<?php
include 'common.php';

function getViewerHTML($sketch_id){
    //this method should calculate all the divs are return them
    
    $sketch = getSketchObject($sketch_id);
    //$sketch['parent'] is the id of the parent sketch
    //$sketch['child'] is a list of id's of children of this sketch
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
</body>
</html>
END;

?>
