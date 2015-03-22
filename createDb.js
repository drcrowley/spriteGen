var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.insert([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        console.log(result);
    });
};

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://drcrowley:ajnjijgth11@ds041671.mongolab.com:41671/sprite';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    insertDocuments(db, function() {
        db.close();
    });
});


