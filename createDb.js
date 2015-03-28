var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.insert([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
    });
};

var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://drcrowley:ajnjijgth11@ds041671.mongolab.com:41671/sprite';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if (err) {
        throw err;
    }
    console.log("Connected correctly to server");

    insertDocuments(db, function() {
        db.close();
    });
});


