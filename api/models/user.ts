import * as mongoose from 'mongoose'

// Set the mongoose schema for the userEntity that gets stored to the database.
// Unique tells mongoose to optimize a field for searching, but it does not do any logic.
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // tslint:disable-next-line:ter-max-len
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('User', userSchema)
