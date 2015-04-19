var mongoose = require('mongoose');


var SettingsSchema = new mongoose.Schema({
    user: {
        type: String,
        unique: true
    },
    padding: {
        type: String
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);