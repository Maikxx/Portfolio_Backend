import * as express from 'express';
import * as mongoose from 'mongoose';

const Image = require('../models/image');

const router = express.Router();

function onError (response, error) {
    console.log(error);

    response.status(500).json({
        error: error,
    });
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
            res.status(201).json({
                storedImage: {
                    _id: result._id,
                    name: result.name,
                    description: result.description,
                    location: result.location,
                    requestUsed: 'POST',
                    requestThis: {
                        type: 'GET',
                        description: 'Get the last saved image via this request.',
                        url: `${process.env.URL}${process.env.PORT}/images/${result._id}`,
                    },
                },
            });
        })
        .catch(error => onError(res, error));
});

// Get all the Images from the database.
// Select does what it describes, it selects items to return in the response of the find.
router.get('/', (req, res, next) => {
    Image.find()
        .select('name description location')
        .exec()
        .then(results => {
            const response = {
                count: results.length,
                images: results.map(result => {
                    return {
                        _id: result._id,
                        name: result.name,
                        description: result.description,
                        location: result.location,
                        requestUsed: {
                            type: 'GET',
                            url: `${process.env.URL}${process.env.PORT}/images/${result._id}`,
                        },
                    };
                }),
            };

            res.status(200).json(response);
        })
        .catch(error => onError(res, error));
});

// Get a single Image by passing the id into the URL.
router.get('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    Image.findById(imageId)
        .exec()
        .then(result => {
            if (!result) {
                res.status(404).json({
                    message: 'No valid entry found for the provided ID',
                });
            } else {
                res.status(200).json({
                    storedImage: {
                        _id: result._id,
                        name: result.name,
                        description: result.description,
                        location: result.location,
                        requestUsed: {
                            type: 'GET',
                            url: `${process.env.URL}${process.env.PORT}/images/${result._id}`,
                        },
                    },
                });
            }
        })
        .catch(error => onError(res, error));
});

// Update a single image handling route.
// If you want to access this, set a body of a request, with an array of objects.
// Each object should have a propName assigned to the corresponding propName that you want to update, and a "value".
// The value you set here is the new value for the property.
router.patch('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;
    const updateOps = {};

    for (const ops of req.params.imageId) {
        updateOps[ops.propName] = ops.value;
    }

    Image.update({ _id: imageId }, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            patchedImage: {
                _id: result._id,
                name: result.name,
                description: result.description,
                location: result.location,
                requestUsed: {
                    type: 'PATCH',
                    url: `${process.env.URL}${process.env.PORT}/images/${result._id}`,
                },
                requestThis: {
                    type: 'GET',
                    description: 'Get the patched (changed) image via this request.',
                    url: `${process.env.URL}${process.env.PORT}/images/${result._id}`,
                },
            },
        });
    })
    .catch(error => onError(res, error));
});

// Delete all database logs of type Image.
router.delete('/', (req, res, next) => {
    Image.remove({})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Success: Deleted all items!',
            });
        })
        .catch(error => onError(res, error));
});

// Delete only the Image with the id passed in to the URL.
router.delete('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    Image.remove({
        _id: imageId,
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Success: Deleted one item!',
            });
        })
        .catch(error => onError(res, error));
});

export default router;
