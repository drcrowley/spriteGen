var mongoose = require('mongoose');


var SpritesSchema = new mongoose.Schema({
    title: {
        type: String
    }
});

module.exports = mongoose.model('Sprites', SpritesSchema);
