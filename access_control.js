/**
* creates asymcrypt_data.yaml and writes keyId and publicKey into it
*/
function saveData(publicKey) {
	var pKey = new getPublicKey(publicKey);
	var keyId = pKey.keyid;
	var publicKey = pKey.pkey.replace(/\n/g,'');
	
	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
  	"&service=" + "storeDB" +
    "&db=" + "asym",
    method:"get",
    success:function() {
      $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
        "&service=" + "storeKeyId" +
      	"&row=" + keyId +
        "&rowname=" + 'keyId',
        method:"get",
        success:function() {
          $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
            "&service=" + "storeKey" +
            "&row=" + publicKey +
            "&rowname=" + 'publicKey',
        	  method:"get",
        	  success:function() {
        	    //not possible under success, where function is called, because page change would be faster than script
        	    $('#ac_admin').unbind().submit();
        	  }
          });
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
	if ($('#ac_admin #password0').length == 1) {
  	$('#ac_admin').submit( function() {
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
    	  var name = person[2] + " " + person[3];
    	  var keyId = person[0].split("/")[1];
    	  $.ajax({url: '../extensions/asymcrypt/getPubKey.php?function=pubKey&name='+ name + '&keyid=' + keyId,
    	    method:"get",
    	    success:function(r) {
    	      saveData(r);
    	    }
    	  });
  		}
  		return false;	 
  	});
  }
  return false;
});
