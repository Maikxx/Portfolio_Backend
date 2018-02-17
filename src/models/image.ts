import * as mongoose from 'mongoose';

// Something that is required: name: { type: String, required: true }
const imageScheme = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: {
        type: Object,
        required: true,

        originalname: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
    },
    name: String,
    description: String,
    location: String,
});

module.exports = mongoose.model('Image', imageScheme);
