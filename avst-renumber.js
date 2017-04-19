// AVST Mailbox Renumber
// GPLv3
// Raymond Rizzo

var currentBox = process.argv[2];
var endBox = process.argv[3];

var fs = require('fs');

while(currentBox <= endBox){
	fs.readFile('./MB' + currentBox + '.xml', 'utf8', (err, file) => {
		if(err){
			// Show error for missing files.
			console.log('NOT FOUND: ./MB' + currentBox + '.xml');
		} else {
			// Find 6xxxx extension to renumber mailbox to. 
				var fileBuffer = file.toString('utf8');
				var newBoxNumber = fileBuffer.match(/<DevAddr>(6\d{4})<\/DevAddr>/)[1];

				// Make replacements.
				var fileBuffer = fileBuffer.toString('utf8').replace(/<MBID>1\d{4}<\/MBID>/g, '<MBID>' + newBoxNumber + '<\/MBID>');
				var fileBuffer = fileBuffer.replace(/<ID>1\d{4}<\/ID>/g, '<MBID>' + newBoxNumber + '<\/MBID>');
				
				// Write file with new name.
				fs.writeFile('./new/MB' + newBoxNumber + '.xml', fileBuffer, function(err) {
					if(err) {
						return console.log(err);
					}
					console.log('/new/MB'+newBoxNumber+'.xml written');
				}); 
		}
	});
	currentBox++;
}