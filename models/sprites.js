var mongoose = require('mongoose');


var SpritesSchema = new mongoose.Schema({
    user: {
        type: String
    },	
    title: {
        type: String,
        unique: true
    },
    css: {
        type: String
    },
    elements: {
        type: Array
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sprites', SpritesSchema);
