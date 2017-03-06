<?php

session_start();
 $fb = new Facebook\Facebook([
  'app_id' => '1817429491842129',
  'app_secret' => '7176bc285dd5a7b4b7097c25751ce725',
  'default_graph_version' => 'v2.8',
  ]);

$helper = $fb->getRedirectLoginHelper();

$permissions = ['email']; // Optional permissions
$self_path = $_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'];
$path  = pathinfo($self_path);
$target = 'http://'.$path['dirname'].'/fb-callback.php';

$loginUrl = $helper->getLoginUrl($target, $permissions);
?>