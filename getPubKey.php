<?php

/**
############################################################################
# Copyright 2011 Benjamin Kellermann, Martin Sachse, Oliver Hoehne, 	     #
# Robert Bachran         				  		                                     #
#                                                                          #
# This file is part of dudle.                                              #
#                                                                          #
# Dudle is free software: you can redistribute it and/or modify it under   #
# the terms of the GNU Affero General Public License as published by       #
# the Free Software Foundation, either version 3 of the License, or        #
# (at your option) any later version.                                      #
#                                                                          #
# Dudle is distributed in the hope that it will be useful, but WITHOUT ANY #
# WARRANTY; without even the implied warranty of MERCHANTABILITY or        #
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public     #
# License for more details.                                                #
#                                                                          #
# You should have received a copy of the GNU Affero General Public License #
# along with dudle.  If not, see <http://www.gnu.org/licenses/>.           #
############################################################################
*/

  $func = $_GET["function"];
  if ($func == "people") {
    people();
  } elseif ($func == "pubKey") {
    pubKey();
  }

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
