import * as mongoose from 'mongoose';

const imageScheme = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    location: String,
});

module.exports = mongoose.model('Image', imageScheme);
