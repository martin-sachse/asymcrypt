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

function randomText(string_length) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	
	return randomstring;
}

function encrypt(encryption, keyId, publicKey, text) { 
  return doEncrypt(keyId, encryption, publicKey, text); // encryption 0-> RSA, 1->Algamal 
}

$(document).ready(function() {
	
  $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
    "&service=" + "getDB",
    method:"get",
    success:function(r){
      var db = JSON.parse(r);
      var encryption = parseInt(db.encryption);
      var keyId = db.keyId;
      var publicKey = db.key.replace(/\s+/g, '+');
      $('.sortsymb').hide();
      $('<div id="test"></div>').insertBefore('#polltable');
  	
    	var error = 0;
    	var i = 0;
    	
    	function testp() {
    	  var testtext = randomText(50);
      	saveData = encrypt(encryption, keyId, publicKey, JSON.stringify(testtext));
      	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
      		"&service=" + "storeRow" +
      		"&row=" + encodeURIComponent(JSON.stringify(saveData)) +
      		"&rowname=" + 'test',
      		method:"get",
      		success:function(r){
      		  $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
              "&service=" + "getDB",
              method:"get",
              success:function(r){
                var db = JSON.parse(r);
                var testajax = JSON.parse(db.votes['test']);
                if(saveData != testajax) {
                  alert('Fehler');
                  error = 1;
                  $('<div style="width: 500px;">'+saveData+'</div><div style="width: 500px;">'+testajax+'</div>').appendTo('#test');
                }
                if(!error && i < 100) testp();
                $('#add_participant_input').val(i++);
              }
      	    });
      		}
      	});
    	}  
    	testp();
    }
  });
});
