/**
*  read all checked radio boxes from the table and returns the id which contains the poll item and the decision
*/
function evaluateTable()  {
	
	var pollData = new Array();
	var checkedRadio = $('#polltable  input:radio').filter(':checked').each( function(index) {
		pollData[index] = $(this).attr('id'); 
	});

	return pollData;
}

/**
*  gets the decrypted json-database, builds and insert the table rows, adds the result even with undecrypted votes
*/
function showParsedTable(dbVotes) {
	var voteTR = $('#add_participant');
	var possibilities = new Array();
	
	//reads the characters that symbolize yes, maybe, no, so they are synchronous on the whole page
	possibilities['ayes'] = $('.input-ayes:first label').text();
	possibilities['cno'] = $('.input-cno:first label').text();
	possibilities['bmaybe'] = $('.input-bmaybe:first label').text();
  
  //hides the voting part of the table
  voteTR.hide();
  
  //parses the votes of each participant into an array with the construction participants[participant0-participantX][vote0-voteY]
	var participants = new Array();	
	for (participant in dbVotes) {
		participants[participant] = new Array();
		var votes = JSON.parse(dbVotes[participant]);
		for (vote in votes) {
			participants[participant][participants[participant].length] = JSON.parse(votes[vote]);
		}
   }
  
  //reads the latest dates/poll-items (@todo rename dates to something more neutral), so changes in the poll will not affect earlier votes
	var dates = new Array();
	var yesVotes = new Array();
	var checkedRadio = $('#polltable input:radio').filter(':checked').each( function(index) {
		dates[dates.length] = ($(this).attr('id').split('_'))[3]; 
		yesVotes[dates[dates.length-1]] = 0;
	});
	
	

  //builds the table row for every encrypted participant, counts the yes votes and insert it between the separator_top and the now hidden voting part
	var participantTRs = new Array();
	for(participant in participants) {
		var tr = '<tr class="participantrow"><td colspan="2" class="name"><span id="' + participant + '">' + participant + '</span></td>';
		for(pollDate in dates) {
			var dateExists = false;
			for(vote in participants[participant]) {
				if(dates[pollDate] == participants[participant][vote][0]) {
					var decision = participants[participant][vote][1];
					if(decision == 'ayes') {
					  yesVotes[dates[pollDate]]++;
					}
					tr += '<td class="' + decision + '" title="' + participant + ': ' + dates[pollDate].replace(".", " ") + '">' + possibilities[decision] + '</td>';//maybe date when entered 
					dateExists = true;
				}
			}
			if(!dateExists) {
				tr += '<td class="undecided" title="' + participant + ': ' + dates[pollDate].replace(".", " ") + '">&ndash;</td>';
			}
		}
		tr += '<td class="date" style="text-align:center">encrypted</td></tr>';
		$(tr).insertBefore(voteTR);
	}
	
	//updates the summary row, colors and gives the title like in the original
	var numberParticipants = $('td.name').length-1
	for(pollDate in dates) {
	  var pollItemSummary = $('#summary > td:eq('+(1+parseInt(pollDate))+')');
	  var pollItemSum = parseInt(pollItemSummary.html())+yesVotes[dates[pollDate]];
	  
	  pollItemSummary.html(pollItemSum).css('width', '44px');
	  
	  if(numberParticipants == pollItemSum && numberParticipants != 0) {
	    pollItemSummary.css({'background-color' : 'rgb(0,0,0)', 'color' : 'rgb(255,255,255)'}).attr('title', '100%');

	  } else {
	    pollItemSummary.css({'background-color' : 'rgb(100,100,100)', 'color' : 'rgb(155,155,155)'}).attr('title', '0%-100%');
	  }
	}
	$('#summary').show();
}

/**
* @todo someday there may be an encryption
*/
var keytyp = 0;      // 0=RSA, 1=Elgamal
var keyid = '3EB51513';
var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK-----'+
'Version: GnuPG/MacGPG2 v2.0.17 (Darwin)'+

'mQENBE1CC/IBCAC8HgzhN207NG0vxkycPi4fKDQJywQ9WhOceTNWXWvNN0VmCKXe'+
'S/NIpkNpfGhvEw46Tt5H0xo08YFeGtapiTAEbaRk2FHC1YLaF51yfb+5IYMgZCex'+
'wt64bX9svMGyNTNrae8Q4lYNaDdjlwD201Sf3nQNAQ9Oa2K4ztHHiA5GvaaHNYe9'+
'/RjS9nK2x9GKR04gugq/4m555DSKy752QBdpzW735gDboG/YC4KbYaxOa5+KrkHw'+
'z1UgfyL6nfcgese24CUravOjYnjAlqaSb0TPpj/MZkGh7DdP2uQkQQEWuQGYjWql'+
'0ATtNvNQrO+MIKBlCpW83VDSkTaUKAeFWJptABEBAAG0J01hcnRpbiBTYWNoc2Ug'+
'PG1hcnRpbi5zYWNoc2VAZ21haWwuY29tPokBOAQTAQIAIgUCTUIL8gIbLwYLCQgH'+
'AwIGFQgCCQoLBBYCAwECHgECF4AACgkQUukSBxTxr+88sQf+M4Z1Ei0XhthCuUMV'+
'zB9br/uMg/QDpZn4RElfEsMJfJsQNE5vKZqvfoHyNd3jI5c7jBHJftWo2qFDaaDd'+
'OVAe7a2OBPdvEztUpmtZ7PswxL/vl9GE15/loOotx/0P1GyP8JGh34wbbqkb0EKT'+
'NLRYaNH/IwURsS5E0/jRraYxsAvdMOWexAJABoNxrVqEeZtAy9zeeQKH5YwbDKMK'+
'z0eEPAhc+4IIBp4dl2VnnSnAuMBfHR6Oe0FgfoK5syi4RtYkIU41d0jow78Xgqtt'+
'trS72a9li+k8Ur6KBSA6q7iUvku597emROP9ed1DS5WL1h1nD/9TVN15rQRS1Yv4'+
'vFYohLkBDQRNQgvyAQgA3lfLObggu3D+7zU+49o6JwoHFUI/SRzbHk2NCoHrvo1J'+
'0C7Y+BEM3JiYCWYdJYFWuIC7U8KEV9yxXHjFQeOABiLkAMGgFjcL68c/9Vohjo3n'+
'EGXRc9YPSnfMOCpqTYSUxGCj+9waqBDCknIdMCfhdRHzO0o3hFVhGqVywqko0sMM'+
'noouuBjkr7X4T7syRR0kHfnxwYif7i9QjsR3WiGCu2cV9A6hiIok1T3mDzzR35kI'+
'DPGLQFqr0qPxIVLiuHLBQdQLoy8YwU7c871QUjHANQrcPS8USoOdlPfrbwlc/ITj'+
'QSgPXrifW1uLqdFalSsGNRUt46wUz5K1ZW9eIUO1RwARAQABiQI+BBgBAgAJBQJN'+
'QgvyAhsuASkJEFLpEgcU8a/vwF0gBBkBAgAGBQJNQgvyAAoJENPXxHu6v6HTXakI'+
'ANi7c/4z3MX6RTyTyyD1a65qEvEzlO2zsV2mTcnVvXrpoA/Yy/dWop7HmNKtZ+Wx'+
'MZvc0QhF8mMGW5lQ1/qy6l2T7mUtpmbzBZRBLMN1BrK3bY5GwHQO7+W3s9Ip9YHZ'+
'aSX8GGoJdzgkh2XeLV3dEJWBT6S70HSerNc5kVcqStQcUJpHe1asipMrbrIWSHdV'+
'VwugMfItfAszXTXfhL6GvT4xDhYrLTOcPlpVProbS8+dKfJSIsp7oSrdSmZqMKW5'+
'Fot9mKUcIeNd+DJm5/1lN/3J/Z2sulG9tB8cU6NYG69zsxszsjmMdED6BTujtT9J'+
'ogqL2dp6p4TGV6TosdLdKIQ2/QgAqtBoNFBTPmcVrMMJwGVz+JY89oFJKwTK4iJp'+
'M7D7HDz/fcIlNA0g9/QfonDZnkM6cGMoPwojUghVp3GtMLQ6nblEStaPL2L26TQL'+
'legQIxbZMkuqOTflhR09sJ4fe2zKPk0Ew72mGqLj63w5N6a0AE0/p9BR9zQa1jKb'+
'UZyPXts700J+9DMu5WvgqFuQJrocj9C181AyqPQRSkFGKkyKTfbjgM1XRhVNzNG+'+
'KwxsdirDVpiQ3ftxFPVTj6toWT2OBnmCTwUYYXS3k8zuiBC74gY1r9UYKt9hB8ll'+
'oCwCGeX6QHUCEQpNgUpqZiJwUNHIwui78icF+CdRRM/xw9JtDw=='+
'=aixo'+
'-----END PGP PUBLIC KEY BLOCK-----';

function encrypt(text) {

  return doEncrypt(keyid, keytyp, pubkey, text);
}

/**
* saves the encrypted data to the asymcrypt_data.yaml
*/
function savePollData(publicKey,participant,pollData) {

	var saveData = new Array();
	var encryptedName = participant;//muss gecrypted werden
	
	for (var index in pollData) {
		var encryptionData = pollData[index].split('_');
		encryptionInfo = encryptionData[encryptionData.length-2];
		encryptionAnswer = encryptionData[encryptionData.length-1]; 
		saveData[index] = JSON.stringify(new Array(encryptionInfo, encryptionAnswer)); //muss gecrypted werden	
	}
	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
	    	"&service=" + "storeRow" +
	    	"&row=" + JSON.stringify(saveData) +
	    	"&rowname=" + encryptedName,//JSON.stringify(encryptedName),
	    	method:"get"
	});
}

$(document).ready(function() {
	
	//does not become activ, when in any other view than the actual poll or the db cannot be called
	if(window.location.search == "") {	
    $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
      "&service=" + "getDB",
      method:"get",
      success:function(r){
  			db = JSON.parse(r);
  			$('#summary').hide();
  			$('.sortsymb').hide();
  			if(db.votes != 'undefined') {
  				$('</br><input type="button" id="showbutton" value="Show">').click( function() {
  					showParsedTable(db.votes);
  					test = encrypt('Das ist ein erster Test'+'\r\n'); //Encryption Function  
  					alert(test);
  				}).insertAfter('#savebutton');
  			}
  			
  			//shows the encrypted data @todo needs a better place
  			$('#separator_top').click( function() {
  				$('#polltable').slideUp(1000, function() {
  					$('#polltable table').hide();
  					$('#polltable form').html('<p>Copy entcrypted text,decrypt and copy back</p><br/><textarea>Schtring</textarea>');
  					$('#polltable').slideDown(1000);
  				});
  			}); 
        
        //catches the submit event, so the data will not be saved in the normal data.yaml, but in the asymcrypt_data.yaml
  			$('#polltable form').submit( function() {
  				
  				var participant = $('#add_participant_input').val();			
  				var pollData = evaluateTable();
  				savePollData(db.key,participant,pollData);
   				
   				//shows the vote encrypted message
  				$('<tr><td colspan="'+$('#separator_top td').attr('colspan')+'" style="text-align:center;background-color:lightblue; width:'+$('#separator_top td').attr('width')+'">Your vote is saved and encrypted</td></tr>').insertBefore($('#add_participant_input').parent().parent());
  				$('#add_participant').hide(); 	
  				return false;
  						
  		  }); 
  	  }
    });
  }
});
