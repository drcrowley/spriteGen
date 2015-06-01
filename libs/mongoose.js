var mongoose = require('mongoose');

module.exports = function() {
	mongoose.connect('mongodb://drcrowley:ajnjijgth11@ds041671.mongolab.com:41671/sprite');
	var db = mongoose.connection;

	db.on('error', function (err) {
		console.log('connection error:', err.message);
	});

	db.once('open', function callback () {
		console.log("Connected to DB!");
	});

}





