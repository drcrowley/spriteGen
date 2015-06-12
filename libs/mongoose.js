var mongoose = require('mongoose');
var config = require('../config');


module.exports = function() {
	mongoose.connect(config.get('db'));
	var db = mongoose.connection;

	db.on('error', function (err) {
		console.log('connection error:', err.message);
	});

	db.once('open', function callback () {
		console.log("Connected to DB!");
	});

}





