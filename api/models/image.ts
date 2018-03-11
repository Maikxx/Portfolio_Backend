import * as mongoose from 'mongoose'

// Set the mongoose schema for the imageEntity that gets stored to the database.
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
})

module.exports = mongoose.model('Image', imageScheme)
