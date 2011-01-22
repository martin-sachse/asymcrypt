function evaluateTable()  {
	
	var pollData = new Array();
	var checkedRadio = $('#polltable  input:radio').filter(':checked').each( function(index) {
		pollData[index] = $(this).attr('id'); 
	});

	return pollData;

}

function showParsedTable(dbVotes) {
	var voteTR = $('#add_participant');
	var possibilities = new Array();
	possibilities['ayes'] = $('.input-ayes:first label').text();
	possibilities['cno'] = $('.input-cno:first label').text();
	possibilities['bmaybe'] = $('.input-bmaybe:first label').text();

	var participants = new Array();	
	for (participant in dbVotes) {
		participants[participant] = new Array();
		var votes = JSON.parse(dbVotes[participant]);
		for (vote in votes) {
			participants[participant][participants[participant].length] = JSON.parse(votes[vote]);
		}
   }
   		
	var dates = new Array();
	var checkedRadio = $('#polltable input:radio').filter(':checked').each( function(index) {
		dates[dates.length] = ($(this).attr('id').split('_'))[3]; 
	});
	
	voteTR.hide();

	var participantTRs = new Array();
	for(participant in participants) {
		var tr = '<tr class="participantrow"><td></td><td class="name">' + participant + '</td>';
		for(pollDate in dates) {
			var dateExists = false;
			for(vote in participants[participant]) {
				if(dates[pollDate] == participants[participant][vote][0]) {
					decision = participants[participant][vote][1]
					tr += '<td class="' + decision + '" title="' + participant + ': ' + dates[pollDate].replace(".", " ") + '">' + possibilities[decision] + '</td>';//maybe date when entered 
					dateExists = true;
				}
			}
			if(!dateExists) {
				tr += '<td class="bmaybe" title="' + participant + ': ' + dates[pollDate].replace(".", " ") + '">' + possibilities['bmaybe'] + '</td>';
			}
		}
		tr += '<td class="date" style="text-align:center">encrypted</td></tr>';
		$(tr).insertBefore(voteTR);
	}
}

function asymEncryption(publicKey,encryptionData) {
//ROBERT 	
}


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
				}).insertAfter('#savebutton');
			}
			$('#separator_top').click( function() {
				$('#polltable').slideUp(1000, function() {
					$('#polltable table').hide();
					$('#polltable form').html('<p>Copy entcrypted text,decrypt and copy back</p><br/><textarea>Schtring</textarea>');
					$('#polltable').slideDown(1000);
				});
			}); 

			$('#polltable form').submit( function() {
				
				var participant = $('#add_participant_input').val();			
				var pollData = evaluateTable();
				//alert(pollData.length);	
				savePollData(db.key,participant,pollData);
 				
				$('<tr><td colspan="'+$('#separator_top td').attr('colspan')+'" style="text-align:center;background-color:lightblue; width:'+$('#separator_top td').attr('width')+'">Your vote is saved and encrypted</td></tr>').insertBefore($('#add_participant_input').parent().parent());
				$('#add_participant').hide(); 	
				return false;
							
			}); 
		}
	});
});
