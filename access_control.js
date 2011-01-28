$(document).ready(function(){

	/**
	* if access_control.cgi is in the view where the admin password is set, asynchronous encryption will be an option
	*/
	if ($('#ac_admin #password0').length == 1) {
		var keytext = _("Activate asymetric encryption")
		$('<tr><td></td><td><input type="checkbox" id="asymcrypt" name="asymcrypt" /><label for="asymcrypt">'+keytext+'</label></td></tr>').insertBefore($('#ac_admin tr:last'));
	}
	
	/**
	* if the checkbox becomes activ, an input for the pgp key will be shown
	*/
	$('#asymcrypt').click( function() {
		if($('#asymcrypt:checked').length == 1 && $('#asymID').length == 0) {
			var question = _("Whats your public key?");
			$('<tr><td></td><td><label for="asymID">'+question+'</label><br/><input id="asymID" name="asymID" /></td></tr>').insertBefore($('#ac_admin tr:last'));
		} else if ($('#asymcrypt:checked').length == 0 && $('#asymID').length == 1) {
			$('#asymID').parents('tr').remove();
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
    	    success:function(r){
      	    if($('#asymID').length != 0) {
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
      	    	                	"&row=" + r +
      	    	            	    "&rowname=" + 'publicKey',
      	    	            	    method:"get",
      	    	            	    success:function() {
      	    	            	      $('#ac_admin').unbind().submit();
      	    	            	    }
      	    	            });
      	    	          }
      	    	      });
      	    	    }
      	      });
      	      
      	    }
      	  }
      	});
  		}
  		return false;	 
  	});
  }
  return false;
});
