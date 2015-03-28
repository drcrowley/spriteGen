var mongoose = require('mongoose');

mongoose.connect('mongodb://drcrowley:ajnjijgth11@ds041671.mongolab.com:41671/sprite');
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");

    //test request
    ArticleModel.find( { title:  "Заголовок1" }, function(err, article) {
        if (err) throw err;
        console.log(article);
    });

});



var Schema = mongoose.Schema;

// Schemas
var Images = new Schema({
    kind: {
        type: String,
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true }
});

var Article = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    images: [Images],
    modified: { type: Date, default: Date.now }
});

var ArticleModel = mongoose.model('Article', Article);



module.exports.ArticleModel = ArticleModel;