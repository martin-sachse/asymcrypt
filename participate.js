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

function randomRowName(dbVotes) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 4;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	/*try {
	  dbVotes[randomstring];
	} catch(err) {
	  randomstring = randomRowName(dbVotes);
	}*/
	
	return randomstring;
}

function encrypt(keyId, publicKey, text) { 
  encryption = 0; // 0-> RSA, 1->Algamal
  return doEncrypt(keyId, encryption, publicKey, text); 
}

/**
* saves the encrypted data to the asymcrypt_data.yaml
*/
function savePollData(participant, keyId, publicKey, pollData, dbVotes) {

	var saveData = new Array();
	saveData[0] = participant;
	
	for (var index in pollData) {
		var encryptionData = pollData[index].split('_');
		encryptionInfo = encryptionData[encryptionData.length-2];
		encryptionAnswer = encryptionData[encryptionData.length-1]; 
		save = new Array(encryptionInfo, encryptionAnswer);
		saveData[parseInt(index)+1] = save;
	}
	saveData = encrypt(keyId, publicKey, JSON.stringify(saveData));
	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
		"&service=" + "storeRow" +
		"&row=" + JSON.stringify(saveData).replace(/\++/g, '%2B') +
		"&rowname=" + randomRowName(),
		method:"get"
	});
}

/**
*
*/
function getEncryptedRow(id, content) {
  return row = '<tr id="' + id + '"><td colspan="'+$('#separator_top td').attr('colspan')+'" style="text-align:center;background-color:lightblue; width:'+$('#separator_top td').attr('width')+'">' + content + '</td></tr>';
}
  

$(document).ready(function() {
	
	//does not become activ, when in any other view than the actual poll or the db cannot be called
	if(window.location.search == "") {	
    $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
      "&service=" + "getDB",
      method:"get",
      success:function(r){
		var db = JSON.parse(r);
		var keyId = db.keyId;
		var publicKey = db.key.replace(/\s+/g, '+');
		$('#summary').hide();
		$('.sortsymb').hide();
		if(JSON.stringify(db.votes) != '{}') {
			$(getEncryptedRow('encryptedData', 'Encrypted Polldata')).click( function() {
				var encryptedRows = "";
				var i = 0;
				for (participant in db.votes) {
					encryptedRows += getEncryptedRow(i++, '<textarea rows="1" cols="1" style="width: 95%; margin-top:5px">' + JSON.parse(db.votes[participant]) + '</textarea>');
				}
				$('#encryptedData').replaceWith(encryptedRows);
			}).insertBefore('#add_participant');
		}
    
		//catches the submit event, so the data will not be saved in the normal data.yaml, but in the asymcrypt_data.yaml
		$('#polltable form').submit( function() {
			
			var participant = $('#add_participant_input').val();			
			var pollData = evaluateTable();
			savePollData(participant, keyId, publicKey, pollData, db.votes);
			
			//shows the vote encrypted message
			$(getEncryptedRow("", 'Your vote is encrypted and saved.')).insertBefore($('#add_participant'));
			$('#add_participant, #encryptedData').hide();
			return false;
  		}); 
  	  }
    });
  }
});
