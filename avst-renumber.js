// AVST Mailbox Renumber v0.5.0
// GPLv3
// Raymond Rizzo

var renumberArray = [];
var fullMailboxList = [];
var fs = require('fs');
var numberOfProcesses = 0;

// First thing is firs. Get the directory listing of maiboxes.
getMBlist();

// load CSV file if selected.
if(process.argv[2] === '--csv'){
	fs.readFile(process.argv[3], 'utf8', (err, file) => {
		if(err){
			console.log(err);
		}
		else{
			var counter = 0;
			renumberArray = splitCsv(file);
			while(counter < renumberArray.length){
				changeBoxes(renumberArray[counter][0],renumberArray[counter][1]);
				counter++;
			}
		}
	});
} else if(process.argv[2] === '--help'){
	console.log('\n\n\nCSV file input:\n\tTo bulk renuber boxes based off of a .CSV file, run: avst-renumber.js --csv {filename.csv}\n\n\n');
} else if(process.argv[2] === '--test'){
	// Debug section
	
}

else {
	console.log('\n\n\nInvalid Input\nRun "avst-renumber.js --help" for more information.\n\n\n');
}


// Split file into something usable
function splitCsv(fileIn){
		fileIn = fileIn.replace(/\r/g, '');
		var csvArray = fileIn.split('\n');
		if(csvArray[csvArray.length-1] === ''){
			csvArray.splice(-1);
		}
		var counter = 0;
		while(counter < csvArray.length){
			csvArray[counter] = csvArray[counter].split(',');
			counter++;
		}
		return csvArray;
}

// Find MB files.
function getMBlist(){
		fs.readdir('./', (err, files) => {
		if(err){
			console.log(err);
		} else {
			var fileList = files;
			var matchIt = new RegExp('MB\\d\{1,10\}.XML');
			fileList.forEach(function(fileName){
				if(fileName.match(matchIt)){
						fullMailboxList.push(fileName);
						}
			});
		}
	});	
}


// Change MBID and ID in file.
function changeBoxes(fromBox, toBox){
		fs.readFile('./MB' + fromBox + '.XML', 'utf8', (err, file) => {
			if(err){
				// Show error for missing files.
				console.log('ERROR READING: ' + fromBox);
			} else {
				// Find 6xxxx extension to renumber mailbox to. 
					var fileBuffer = file.toString('utf8');
					var findOldMBID = new RegExp('<MBID>' + fromBox + '<\/MBID>','gi');
					var findOldID = new RegExp('<ID>' + fromBox + '<\/ID>','gi');
					// Only process if this has the fromBox MBID.
					if(fileBuffer.match(findOldMBID)){
						numberOfProcesses++;
						// Make replacements.
						var fileBuffer = fileBuffer.replace(findOldMBID, '<MBID>' + toBox + '<\/MBID>');
						var fileBuffer = fileBuffer.replace(findOldID, '<ID>' + toBox + '<\/ID>');
						// Write file with new name.
						fs.writeFile('./new/MB' + toBox + '.xml', fileBuffer, function(err) {
							if(err) {
								return console.log('FAILED TO WRITE: ./new/MB' + toBox + '.xml');
							}
							console.log('/new/MB'+toBox+'.xml written');
							numberOfProcesses--;
							// If renumbring is complete, run the remainder of functions.
							if(numberOfProcesses === 0){
								changeList();
								changeDistribution();
								changeCallProcessor();
							}
						});
					} else {

					}					
			}
		});
}

// Change the index file to the new values.
function changeList(){
	fs.readFile('./MBLIST.xml', 'utf8', (err, file) => {
		if(err){
			// Show error for missing files.
		} else {
			var counter = 0;
			var mailboxList = file.toString('utf8');
			while(counter < renumberArray.length){
				var oldId = new RegExp('<MBID>' + renumberArray[counter][0] + '<\/MBID>','gi');
				var oldFileName = new RegExp('<MBFileName>MB' + renumberArray[counter][0] + '.XML<\/MBFileName>','gi');
				mailboxList = mailboxList.replace(oldId, '<MBID>' + renumberArray[counter][1] + '</MBID>');
				mailboxList = mailboxList.replace(oldFileName, '<MBFileName>MB' + renumberArray[counter][1] + '.XML</MBFileName>');
				counter++;
			}
			fs.writeFile('./new/MBLIST.xml', mailboxList, function(err) {
				if(err) {
					return console.log('FAILED TO WRITE: ./new/MBLIST.xml');
				} else {
					console.log('/new/MBLIST.xml written');
				}
			});
		}
	});
}

// Change any reference to renumbered mailboxes in distribution groups.
function changeDistribution(){
	fullMailboxList.forEach(function(mailboxFileName){
		fs.readFile(mailboxFileName, 'utf8', (err, file) => {
		if(err){
			// Show error for missing files.
		} else {
			var thisFile = file.toString('utf8');
			//Check if this is a distribution list
			if(thisFile.match('<MBType>D</MBType>')){
				var counter = 0;
				while(counter < renumberArray.length){
					var oldMemberMBID = new RegExp('<MemberMBID>' + renumberArray[counter][0] + '<\/MemberMBID>','gi');
					//console.log(thisFile.match(oldMemberMBID));
					thisFile = thisFile.replace(oldMemberMBID, '<MemberMBID>' + renumberArray[counter][1] + '</MemberMBID>');
					counter++;
				}
				fs.writeFile('./new/' + mailboxFileName, thisFile, function(err) {
					if(err) {
						return console.log('FAILED TO WRITE: ./new/' + mailboxFileName);
					} else {
						console.log('/new/' + mailboxFileName + ' written');
					}
				});	
			}
		}
		});
	});
}

// Change any reference to renumbered mailboxes in call processors.
function changeCallProcessor(){
	fullMailboxList.forEach(function(mailboxFileName){
		fs.readFile(mailboxFileName, 'utf8', (err, file) => {
		if(err){
			// Show error for missing files.
		} else {
			var thisFile = file.toString('utf8');
			//Check if this is a call processor
			if(thisFile.match('<MBType>3</MBType>')){
				var counter = 0;
				while(counter < renumberArray.length){
					var oldTemplate = new RegExp('<Template>' + renumberArray[counter][0] + '<\/Template>','gi');
					thisFile = thisFile.replace(oldTemplate, '<Template>' + renumberArray[counter][1] + '</Template>');
					counter++;
				}
				fs.writeFile('./new/' + mailboxFileName, thisFile, function(err) {
					if(err) {
						return console.log('FAILED TO WRITE: ./new/' + mailboxFileName);
					} else {
						console.log('/new/' + mailboxFileName + ' written');
					}
				});	
			}
		}
		});
	});
}



