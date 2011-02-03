<?php

  $func = $_GET["function"];
  $func();

  function people() {
    $name = str_replace(" ", "+", $_GET["name"]);
    $page = fopen ("http://pgp.zdv.uni-mainz.de:11371/pks/lookup?op=index&search=".$name, "r");
    $contents = "";
    while (!feof($page)) {
      $contents .= fread($page, 8192);
    }
    $contents = explode('pub', strip_tags(substr($contents, strpos($contents, 'pub'), strrpos($contents, '</a>'))));
    echo json_encode($contents);
  }
  
  function pubKey() {
    $name = str_replace(" ", "+", $_GET["name"]);
    $page = fopen ("http://pgp.zdv.uni-mainz.de:11371/pks/lookup?op=index&search=".$name, "r");
    $contents = "";
    while (!feof($page)) {
      $contents .= fread($page, 8192);
    }
    $contents = explode('pub', substr($contents, strpos($contents, 'pub'), strrpos($contents, '</a>')));
    foreach($contents as $content) {
      if(strpos($content, $_GET["keyId"]) != -1) {
        $start = strpos($content, '<a href="') + 9;
        $end = strpos($content, '">') - $start;
        $link = substr($content, $start, $end);
        $link = "http://pgp.zdv.uni-mainz.de:11371"."".$link;
        $pubKeyPage = fopen ($link, "r");
        $pubKey = "";
        while (!feof($pubKeyPage)) {
          $pubKey .= fread($pubKeyPage, 8192);
        }
        $start = strpos($pubKey, '<pre>') + 5;
        $end = strpos($pubKey, '</pre>') - $start;
        $pubKey = substr($pubKey, $start, $end);
      }  
    }
    
    echo $pubKey;
  }
 
?>