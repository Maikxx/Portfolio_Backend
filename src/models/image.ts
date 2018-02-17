import * as mongoose from 'mongoose';

// Something that is required: name: { type: String, required: true }
const imageScheme = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: {
        type: String,
        required: true,
    },
    name: String,
    description: String,
    location: String,
});

module.exports = mongoose.model('Image', imageScheme);
