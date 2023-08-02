const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var wordSchema = new mongoose.Schema({
    word_content: { type: String },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: 'words'
});

//Export the model
const WordModel = mongoose.model('Word', wordSchema);
module.exports = WordModel;