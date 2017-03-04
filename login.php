<?php
session_start();
 $fb = new Facebook\Facebook([
  'app_id' => '1817429491842129',
  'app_secret' => '7176bc285dd5a7b4b7097c25751ce725',
  'default_graph_version' => 'v2.8',
  ]);

$helper = $fb->getRedirectLoginHelper();

$permissions = ['email']; // Optional permissions
$loginUrl = $helper->getLoginUrl('http://students.washington.edu/arroyv/arch482/BriansSketchingApp/fb-callback.php', $permissions);

?>
