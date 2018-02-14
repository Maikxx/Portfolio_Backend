import * as express from 'express';
import * as mongoose from 'mongoose';

const Image = require('../models/image');

const router = express.Router();

function setErrorJSON (error) {
    return {
        error: error,
    };
}

// Create a new image with the name, description and location that are passed in via the request.
router.post('/', (req, res, next) => {
    const image = new Image({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
    });

    image.save()
        .then(result => {
            console.log(result);

            res.status(201).json({
                message: `Handling image POST request, with name: ${result.name}, to /api/images.`,
                storedImage: image,
            });
        })
        .catch(error => {
            console.log(error);

            res.status(500).json(setErrorJSON(error));
        });
});

// Get all the Images from the database.
router.get('/', (req, res, next) => {
    Image.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json(setErrorJSON(error));
        });
});

// Get the Image by passing the id into the URL.
router.get('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    Image.findById(imageId)
        .exec()
        .then(doc => {
            console.log(doc);

            // If there is a valid document found return that, else return a not found entry.
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: 'No valid entry found for the provided ID',
                });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json(setErrorJSON(error));
        });
});

// Update a single image handling route.
router.patch('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;
    const updateOps = {};

    for (const ops of req.params.imageId) {
        updateOps[ops.propName] = ops.value;
    }

    Image.update({ _id: imageId }, { $set: updateOps })
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error,
        });
    });
});

// Delete all database logs of type Image.
router.delete('/', (req, res, next) => {
    Image.remove({})
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            console.log(error);

            res.status(500).json(setErrorJSON(error));
        });
});

// Delete only the Image with the id passed in to the URL.
router.delete('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    Image.remove({
        _id: imageId,
    })
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json(setErrorJSON(error));
        });
});

export default router;
