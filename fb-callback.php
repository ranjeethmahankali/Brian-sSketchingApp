<?php
session_start();
require_once __DIR__ . '/src/Facebook/autoload.php';
include "common.php";
//ob_start();

$fb = new Facebook\Facebook([
  'app_id' => '1817429491842129',
  'app_secret' => '7176bc285dd5a7b4b7097c25751ce725',
  'default_graph_version' => 'v2.8',
  ]);

  $helper = $fb->getRedirectLoginHelper();
  try {
    $accessToken = $helper->getAccessToken();
  } catch(Facebook\Exceptions\FacebookResponseException $e) {
    // When Graph returns an error
    echo 'Graph returned an error: ' . $e->getMessage();
    exit;
  } catch(Facebook\Exceptions\FacebookSDKException $e) {
    // When validation fails or other local issues
    echo 'Facebook SDK returned an error: ' . $e->getMessage();
    exit;
  }

  $self_path = __FILE__;
  $path  = pathinfo($self_path);
  $target = 'http://'.$path['dirname'].'/index.php';

  if (isset($accessToken)) {
    // Logged in!
    $_SESSION['facebook_access_token'] = (string) $accessToken;

    // Now you can redirect to another page and use the
    // access token from $_SESSION['facebook_access_token']
    $self_path = $_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'];
    $path  = pathinfo($self_path);
    $homePageURL = 'http://'.$path['dirname'].'/index.php';
    //sending to homePage or this following target - which is the address of
    //whatever page the user logged in from
    $target = $_SESSION['currentURL'];
    //alert($target);
    header("Location: $homePageURL");
  }

?>
