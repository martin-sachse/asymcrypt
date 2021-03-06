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

/**
* creates asymcrypt_data.yaml and writes keyId and publicKey into it
*/
function saveData(publicKey, keyOwner) {
	var pKey = new getPublicKey(publicKey);
	var keyId = pKey.keyid;
	var publicKey = pKey.pkey.replace(/\n/g,'');
	var fingerprint = pKey.fp;
	if(pKey.type == "RSA") {
	  var encryption = 0;
	} else if(pKey.type == "ELGAMAL") {
	  var encryption = 1;
	}
	
	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
  	"&service=" + "storeDB" +
    "&db=" + "asym",
    method:"get",
    success:function() {
      $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
        "&service=" + "storePublicKey" +
        "&encryption=" + encryption +
        "&keyId=" + keyId +
        "&key=" + publicKey +
        "&fingerprint=" + fingerprint +
        "&keyOwner=" + keyOwner,
    	  method:"get",
    	  success:function() {
    	    //not possible under success, where function is called, because page change would be faster than script
    	    $('#ac_admin').unbind().submit();
    	  }
      });
	  }
  });
}

$(document).ready(function(){

	/**
	* if access_control.cgi is in the view where the admin password is set, asynchronous encryption will be an option
	*/
	if ($('#ac_admin #password0').length == 1) {
		var keytext = _("Activate asymetric encryption");
		$('<tr><td></td><td><input type="checkbox" id="asymcrypt" name="asymcrypt" /><label for="asymcrypt">'+keytext+'</label></td></tr>').insertBefore($('#ac_admin tr:last'));
	}
	
	/**
	* if the checkbox becomes activ, an input for the pgp key will be shown
	*/
	$('#asymcrypt').click( function() {
		if($('#asymcrypt:checked').length == 1 && $('#asymID').length == 0) {
			var question = _("Whats your PGP name?");
			$('<tr><td></td><td><label for="asymID">'+question+'</label><br/><input id="asymID" name="asymID" /></td></tr>').insertBefore($('#ac_admin tr:last'));
			var btext = _("Search");
		    $('#ac_admin :submit').val(btext);
		} else if ($('#asymcrypt:checked').length == 0 && $('#asymID').length == 1) {
			$('#asymID').parents('tr').remove();
			var btext = _("Save");
		    $('#ac_admin :submit').val(btext);
		}
	});
	
	/**
	* on submit, the value of the input will be send to the asymcrypt_data.yaml, after that the submit event will be executed
	*/
 	$('#ac_admin').submit( function() {
 	  if ($('#ac_admin #password0').length == 1 && $('#asymcrypt:checked').length == 1) {
     	if($('#publicKey').length == 0 || $('#publicKey').val() == "" ) {
     	  $.ajax({url: '../extensions/asymcrypt/getPubKey.php?function=people&name=' + $('#asymID').val(),
     	    method:"get",
     	    timeout: (10 * 1000),
     	    error:function(r, strError){
     		  if($('#error').length == 0) {
     			var error = _("The name could not be found<br />or the request was to inexplicit.") 
     			$('<p id="error" style="color:red">'+error+'</p>').insertBefore('#ac_admin :submit');
     		  }
     	  	},
     	    success:function(r){
     	      var possiblePublicKeys = JSON.parse(r);
     	      if(possiblePublicKeys.length > 0) {
     	        if($('#publicKey').length == 0) {
       	        var select = '<tr><td></td><td><select name="publicKey" id="publicKey" size="1" style="width:300px">';
       	        for (var index in possiblePublicKeys) {
       	          if(possiblePublicKeys[index] != null) select += '<option>' + possiblePublicKeys[index] + '</option>';
       	        }
       	        select += '</select></td></tr>';
       	        $(select).insertBefore($('#ac_admin tr:last'));
       	        var btext = _("Save");
              $('#ac_admin :submit').val(btext);
              $('#error').remove();
     	        } else {
     	          var select = '<select name="publicKey" id="publicKey" size="1" style="width:300px">';
     	          for (var index in possiblePublicKeys) {
     	            if(possiblePublicKeys[index] != null) select += '<option>' + possiblePublicKeys[index] + '</option>';
     	          }
     	          select += '</select>';
     	          $('#publicKey').replaceWith(select);
     	        }
     	      }
     	    }
     	  });
         return false;
     	} else {
     	  var person = $('#publicKey').val().split(" ");
     	  var keyOwner = person[2] + " " + person[3];
     	  var keyId = person[0].split("/")[1];
     	  $.ajax({url: '../extensions/asymcrypt/getPubKey.php?function=pubKey&name='+ keyOwner + '&keyid=' + keyId,
     	    method:"get",
     	    success:function(r) {
     	      saveData(r, keyOwner);
     	    }
     	  });
   		}
    return false;
 	  } 			 
 	});
});
