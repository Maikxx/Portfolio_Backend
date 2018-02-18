import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

interface ImageType {
    _id: string;
    name: string;
    description: string;
    location: string;
    image: any;
}

const Image = require('../models/image');

export function post (req: any, res: any, next: any) {
    function calculateFileSize(size: number) {
        return size / 1000;
    }

    const image = new Image({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        image: {
            originalname: req.file.originalname,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: `${calculateFileSize(req.file.size)}kb`,
        },
    });

    image.save()
        .then((result: ImageType) => {
            const {
                _id,
                name,
                description,
                location,
                image,
            } = result;

            res.status(201).json({
                storedImage: {
                    _id: _id,
                    name: name,
                    description: description,
                    location: location,
                    image: image,
                    requestUsed: 'POST',
                    requestThisImage: {
                        type: 'GET',
                        description: 'Get the last saved image via this request.',
                        url: getSingleImageUrl(generateServerUrl(req), _id),
                    },
                },
            });
        })
        .catch((error: any) => onError(res, error));
}

export function getAll (req: any, res: any, next: any) {
    Image.find()
        .select('name description location image')
        .exec()
        .then((results: any) => {
            res.status(200).json({
                count: results.length,
                images: results.map((result: ImageType) => {
                    const {
                        _id,
                        name,
                        description,
                        location,
                        image,
                    } = result;

                    return {
                        _id: _id,
                        name: name,
                        description: description,
                        location: location,
                        image: image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(generateServerUrl(req), _id),
                        },
                    };
                }),
            });
        })
        .catch((error: any) => onError(res, error));
}

export function getSpecific (req: any, res: any, next: any) {
    const imageId = req.params.imageId;

    Image.findById(imageId)
        .then((result: ImageType) => {
            const {
                _id,
                name,
                description,
                location,
                image,
            } = result;

            if (!result) {
                res.status(404).json({
                    message: 'No valid entry found for the provided ID',
                });
            } else {
                res.status(200).json({
                    storedImage: {
                        _id: _id,
                        name: name,
                        description: description,
                        location: location,
                        image: image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(generateServerUrl(req), _id),
                        },
                    },
                });
            }
        })
        .catch((error: any) => onError(res, error));
}

export function patch (req: any, res: any, next: any) {
    const imageId = req.params.imageId;
    const updateOps = {};

    for (const ops of req.params.imageId) {
        updateOps[ops.propName] = ops.value;
    }

    Image.update({ _id: imageId }, { $set: updateOps })
        .then((result: ImageType) => {
            const {
                _id,
                name,
                description,
                location,
                image,
            } = result;

            res.status(200).json({
                patchedImage: {
                    _id: _id,
                    name: name,
                    description: description,
                    location: location,
                    image: image,
                    requestUsed: {
                        type: 'PATCH',
                        url: getSingleImageUrl(generateServerUrl(req), _id),
                    },
                    requestThisImage: {
                        type: 'GET',
                        description: 'Get the patched (changed) image via this request',
                        url: getSingleImageUrl(generateServerUrl(req), _id),
                    },
                },
            });
        })
        .catch((error: any) => onError(res, error));
}

export function deleteAll (req: any, res: any, next: any) {
    Image.remove({})
        .exec()
        .then((result: object) => {
            const dirToRemoveFrom = 'uploads';

            fs.readdir(dirToRemoveFrom, (error: any, files: any) => {
                if (error) {
                    return console.error(error);
                }

                for (const file of files) {
                    fs.unlink(path.join(dirToRemoveFrom, file), (error: any) => {
                        if (typeof error !== null) {
                            return console.error(error);
                        }
                    });
                }
            });

            res.status(200).json({
                message: 'Deleted all items',
                requestAllImages: {
                    type: 'GET',
                    description: 'See the empty list of images.',
                    url: getAllImages(generateServerUrl(req)),
                },
            });
        })
        .catch((error: any) => onError(res, error));
}

export function deleteSpecific (req: any, res: any, next: any) {
    const imageId = req.params.imageId;

    Image.remove({ _id: imageId })
        .exec()
        .then((result: object) => {
            res.status(200).json({
                message: 'Deleted one item',
                requestAllImages: {
                    type: 'GET',
                    description: 'See the list of images that remained after this deletion.',
                    url: getAllImages(generateServerUrl(req)),
                },
            });
        })
        .catch((error: any) => onError(res, error));
}

function onError (response: any, error: any) {
    console.error(error);

    response.status(500).json({
        error: error,
    });
}

function getSingleImageUrl (serverURL: string, imageId: string) {
    return `${serverURL}/api/images/${imageId}`;
}

function generateServerUrl (req: any) {
    return `${req.protocol}://${req.get('host')}`;
}

function getAllImages (serverURL: string) {
    return `${serverURL}/api/images/`;
}