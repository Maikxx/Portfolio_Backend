import * as express from 'express';
import * as mongoose from 'mongoose';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const checkAuth = require('../auth/check-auth');

interface FileType {
    mimetype: string;
    originalname: string;
    destination: string;
    filename: string;
    path: string;
    size: string;
}

interface ImageType {
    _id: string;
    name: string;
    description: string;
    location: string;
    image: any;
}

const storage = multer.diskStorage({
    destination: (request: object, file: FileType, callback: any) => {
        callback(null, 'uploads/');
    },
    filename: (request: object, file: FileType, callback: any) => {
        const fileNameToSave = file.originalname.replace(/ /g, '_');
        // tslint:disable-next-line:prefer-template
        callback(null, new Date().toISOString() + '_' + fileNameToSave);
    },
});

const fileFilter = (request: object, file: FileType, callback: any) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

const Image = require('../models/image');
const router = express.Router();

// Create a new image with the name, description and location that are passed in via the request.
router.post('/', upload.single('image'), checkAuth, (req: any, res: any, next: any) => {
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
});

// Get all the Images from the database.
// Select does what it describes, it selects items to return in the response of the find.
router.get('/', checkAuth, (req: any, res: any, next: any) => {
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
});

// Get a single Image by passing the id into the URL.
router.get('/:imageId', checkAuth, (req: any, res: any, next: any) => {
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
});

// Update a single image handling route.
// If you want to access this, set a body of a request, with an array of objects.
// Each object should have a propName assigned to the corresponding propName that you want to update, and a "value".
// The value you set here is the new value for the property.
router.patch('/:imageId', checkAuth, (req: any, res: any, next: any) => {
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
});

// Delete all database logs of type Image.
router.delete('/', checkAuth, (req: any, res: any, next: any) => {
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
                            return console.error(error, 'hihi');
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
});

// Delete only the Image with the id passed in to the URL.
router.delete('/:imageId', checkAuth, (req: any, res: any, next: any) => {
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
});

function onError (response: any, error: any) {
    console.error(error);

    response.status(500).json({
        error: error,
    });
}

function generateServerUrl (req: any) {
    return `${req.protocol}://${req.get('host')}`;
}

function getSingleImageUrl (serverURL: string, imageId: string) {
    return `${serverURL}/api/images/${imageId}`;
}

function getAllImages (serverURL: string) {
    return `${serverURL}/api/images/`;
}

export default router;
