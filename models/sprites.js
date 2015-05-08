var mongoose = require('mongoose');


var SpritesSchema = new mongoose.Schema({
    user: {
        type: String
    },	
    title: {
        type: String
    },
    img: {
        type: String
    },
});

module.exports = mongoose.model('Sprites', SpritesSchema);
