//global variable needet for encrypted input change
var inputContent;

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
function parseRow(rowId, decodedText) {
  var possibilities = new Array();
  //reads the characters that symbolize yes, maybe, no, so they are synchronous on the whole page
  possibilities['ayes'] = $('.input-ayes:first label').text();
  possibilities['cno'] = $('.input-cno:first label').text();
  possibilities['bmaybe'] = $('.input-bmaybe:first label').text();
  
  //hides the voting part of the table
  $('#add_participant').hide();
  $('#hint').hide();
  
  //reads the latest dates/poll-items (@todo rename dates to something more neutral), so changes in the poll will not affect earlier votes
  var dates = new Array();
  var yesVotes = new Array();
  var checkedRadio = $('#polltable input:radio').filter(':checked').each( function(index) {
	dates[dates.length] = ($(this).attr('id').split('_'))[3];
	yesVotes[dates.length-1] = 0;
  });
  
  var decoded = JSON.parse(decodedText);
  var decryptedRow = '<tr><td class="name" colspan="2">' + decoded[0] + '</td>';
  for(pollDate in dates) {
    var dateExists = false;
  	for(var i = 1; i < decoded.length; i++) {
  	  if(dates[pollDate] == decoded[i][0]) {
  	    if(decoded[i][1] == 'ayes') {
  	      yesVotes[pollDate] = 1;
  	    }
          decryptedRow += '<td class="' + decoded[i][1] + '" title="' + decoded[i][0] + ': ' + dates[pollDate].replace(".", " ") + '">' + possibilities[decoded[i][1]] + '</td>';//maybe date when entered 
          dateExists = true;
  	  }
  	}
  	if(!dateExists) {
        decryptedRow += '<td class="undecided" title="' + participant + ': ' + dates[pollDate].replace(".", " ") + '">&ndash;</td>';
  	}
  }
  decryptedRow += '<td class="date" style="text-align:center">decrypted</td></tr>';
 
  $('#'+rowId).replaceWith(decryptedRow);
		
  //updates the summary row, colors and gives the title like in the original
  var numberParticipants = $('td.name').length-1;
  for(pollDate in dates) {
    var pollItemSummary = $('#summary > td:eq('+(1+parseInt(pollDate))+')');
	var pollItemSum = parseInt(pollItemSummary.html())+yesVotes[pollDate];
	  
	pollItemSummary.html(pollItemSum).css('width', '44px');
	if(numberParticipants == pollItemSum && numberParticipants != 0) {
	  pollItemSummary.css({'background-color' : 'rgb(0,0,0)', 'color' : 'rgb(255,255,255)'}).attr('title', '100%');
	} else {
	  pollItemSummary.css({'background-color' : 'rgb(100,100,100)', 'color' : 'rgb(155,155,155)'}).attr('title', '0%-100%');
	}
  }
}

function randomRowName() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 4;
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

/**
* saves the encrypted data to the asymcrypt_data.yaml
*/
function savePollData(participant, encryption, keyId, publicKey, pollData) {

	var saveData = new Array();
	saveData[0] = participant;
	
	for (var index in pollData) {
		var encryptionData = pollData[index].split('_');
		encryptionInfo = encryptionData[encryptionData.length-2];
		encryptionAnswer = encryptionData[encryptionData.length-1]; 
		save = new Array(encryptionInfo, encryptionAnswer);
		saveData[parseInt(index)+1] = save;
	}
	saveData = encrypt(encryption, keyId, publicKey, JSON.stringify(saveData));
	$.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
		"&service=" + "storeRow" +
		"&row=" + encodeURIComponent(JSON.stringify(saveData)) +
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


/**
* formats the fingerprint
*/
function toFingerprint(fingerprint) {
  fingerprint = fingerprint.toUpperCase();
  var to = fingerprint.length;
  var niceFingerprint = "";
  for (var i = 0; i < to; i++) {
    niceFingerprint += fingerprint[i];
    if((i+1)%4 == 0 && (i+1) != to) {
      niceFingerprint += ' : ';
    }
  }
  return niceFingerprint;
}  

$(document).ready(function() {
	
	//does not become activ, when in any other view than the actual poll or the db cannot be called
	if(window.location.search == "") {	
    $.ajax({url: extDir + "/pollserver.cgi?pollID=" + pollID + 
      "&service=" + "getDB",
      method:"get",
      success:function(r){
		var db = JSON.parse(r);
		var encryption = parseInt(db.encryption);
		var keyId = db.keyId;
		var publicKey = db.key.replace(/\s+/g, '+');
  	var fingerprint = db.fingerprint;
		var keyOwner = db.keyOwner;
		$('.sortsymb').hide();
		var messageTo = _('Your vote will be encrypted to');
		var messageWith = _('with the Fingerprint');
		$('<tr id="hint"><td colspan="4" class="hint">'+messageTo+'<br />'+keyOwner+' '+messageWith+'<br /><span style="font-size: 9px;">'+toFingerprint(fingerprint)+'</span></td></tr>').insertBefore('#add_participant');
        
		if(JSON.stringify(db.votes) != '{}') {
          var messageRow = _('Encrypted Polldata');
          $(getEncryptedRow('encryptedData', messageRow)).click( function() {
            var encryptedRows = "";
            var i = 0;

            for (participant in db.votes) {
             encryptedRows += getEncryptedRow('encRow' + i++, '<textarea rows="1" cols="1" style="width: 95%; margin-top:5px">' + JSON.parse(db.votes[participant]) + '</textarea>');
            }
            $('#encryptedData').replaceWith(encryptedRows);
          }).insertBefore('#hint');
        }

        //catches the submit event, so the data will not be saved in the normal data.yaml, but in the asymcrypt_data.yaml
        $('#polltable form').submit( function() {

          var participant = $('#add_participant_input').val();			
          var pollData = evaluateTable();
          savePollData(participant, encryption, keyId, publicKey, pollData);

          //shows the vote encrypted message
          var messageEncrypted = _('Your vote is encrypted and saved.');
          $(getEncryptedRow("", messageEncrypted)).insertBefore($('#add_participant'));
          $('#add_participant, #encryptedData').hide();
          return false;
        });
        
        $('tr[id^="encRow"] textarea').live('focusin', function() {
          inputContent = $(this).val();
          $(this).select();
        }).live('focusout', function() {
          if($(this).val() != inputContent) {  
            var rowId = $(this).parent().parent().attr('id');
            var decodedText = $(this).val();
            parseRow(rowId, decodedText);
          }
  	    });
      }
    });
  }
});