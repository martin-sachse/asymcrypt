$(document).ready(function(){

	/*
	* wenn sich access_control.cgi bei Adminpasswortvergabe befindet, wird asynchrone Verschlüsselung angeboten
	*/
	if ($('#ac_admin #password0').length == 1) {
		var keytext = _("Activate asymetric encryption")
		$('<tr><td></td><td><input type="checkbox" id="asymcrypt" name="asymcrypt" /><label for="asymcrypt">'+keytext+'</label></td></tr>').insertBefore($('#ac_admin tr:last'));
	}
	
	/*
	* wird die Checkbox asynchrone Verschlüsselung aktiviert, wird ein Eingabefeld eingeblendet
	*/
	$('#asymcrypt').click( function() {
		if($('#asymcrypt:checked').length == 1 && $('#asymID').length == 0) {
			var question = _("Whats your public key?");
			$('<tr><td></td><td><label for="asymID">'+question+'</label><br/><input id="asymID" name="asymID" /></td></tr>').insertBefore($('#ac_admin tr:last'));
		} else if ($('#asymcrypt:checked').length == 0 && $('#asymID').length == 1) {
			$('#asymID').parents('tr').remove();
		}
	});
	
	/*
	* das Eingabefeld sendet bei jeder Änderung seine Daten an die Yaml
	*/
	$('#ac_admin').submit( function() {
		if($('#asymID').val() != "" && $('#asymID').length != 0) {
			$.ajax({
				url: extDir + "/pollserver.cgi?pollID=" + pollID + 
		    	"&service=" + "storeDB" +
			    "&db=" + "asym",
			    method:"get"
		    });
			$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
			    "&service=" + "storeKey" +
		    	"&row=" + $('#asymID').val() +
			    "&rowname=" + 'publicKey',
			    method:"get"
		    });
		}
	});
	
});
