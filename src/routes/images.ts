import * as express from 'express';
import * as mongoose from 'mongoose';
import * as multer from 'multer';

interface FileType {
    mimetype: string;
    originalname: string;
    destination: string;
    filename: string;
    path: string;
    size: string;
}

const storage = multer.diskStorage({
    destination: (request: object, file: FileType, callback: any) => {
        callback(null, 'uploads/');
    },
    filename: (request: object, file: FileType, callback: any) => {
        // tslint:disable-next-line:prefer-template
        callback(null, new Date().toISOString() + '-' + file.originalname);
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
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

const Image = require('../models/image');
const router = express.Router();

// Create a new image with the name, description and location that are passed in via the request.
router.post('/', upload.single('image'), (req: any, res: any, next: any) => {

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

    const serverURL = `${req.protocol}://${req.get('host')}`;

    image.save()
        .then(result => {
            res.status(201).json({
                storedImage: {
                    _id: result._id,
                    name: result.name,
                    description: result.description,
                    location: result.location,
                    image: result.image,
                    requestUsed: 'POST',
                    requestThisImage: {
                        type: 'GET',
                        description: 'Get the last saved image via this request.',
                        url: getSingleImageUrl(serverURL, result),
                    },
                },
            });
        })
        .catch(error => onError(res, error));
});

// Get all the Images from the database.
// Select does what it describes, it selects items to return in the response of the find.
router.get('/', (req: any, res: any, next: any) => {
    const serverURL = `${req.protocol}${req.get('host')}`;

    Image.find()
        .select('name description location image')
        .exec()
        .then(results => {
            res.status(200).json({
                count: results.length,
                images: results.map(result => {
                    return {
                        _id: result._id,
                        name: result.name,
                        description: result.description,
                        location: result.location,
                        image: result.image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(serverURL, result),
                        },
                    };
                }),
            });
        })
        .catch(error => onError(res, error));
});

// Get a single Image by passing the id into the URL.
router.get('/:imageId', (req: any, res: any, next: any) => {
    const imageId = req.params.imageId;
    const serverURL = `${req.protocol}${req.get('host')}`;

    Image.findById(imageId)
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
                        image: result.image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(serverURL, result),
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
router.patch('/:imageId', (req: any, res: any, next: any) => {
    const imageId = req.params.imageId;
    const updateOps = {};
    const serverURL = `${req.protocol}${req.get('host')}`;

    for (const ops of req.params.imageId) {
        updateOps[ops.propName] = ops.value;
    }

    Image.update({ _id: imageId }, { $set: updateOps })
        .then(result => {
            res.status(200).json({
                patchedImage: {
                    _id: result._id,
                    name: result.name,
                    description: result.description,
                    location: result.location,
                    image: result.image,
                    requestUsed: {
                        type: 'PATCH',
                        url: getSingleImageUrl(serverURL, result),
                    },
                    requestThisImage: {
                        type: 'GET',
                        description: 'Get the patched (changed) image via this request.',
                        url: getSingleImageUrl(serverURL, result),
                    },
                },
            });
        })
        .catch(error => onError(res, error));
});

// Delete all database logs of type Image.
router.delete('/', (req: any, res: any, next: any) => {
    const serverURL = `${req.protocol}${req.get('host')}`;

    Image.remove({})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Success: Deleted all items!',
                requestAllImages: {
                    type: 'GET',
                    description: 'See the empty list of images.',
                    url: getAllImages(serverURL),
                },
            });
        })
        .catch(error => onError(res, error));
});

// Delete only the Image with the id passed in to the URL.
router.delete('/:imageId', (req: any, res: any, next: any) => {
    const imageId = req.params.imageId;
    const serverURL = `${req.protocol}${req.get('host')}`;

    Image.remove({ _id: imageId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Success: Deleted one item!',
                requestAllImages: {
                    type: 'GET',
                    description: 'See the list of images that remained after this deletion.',
                    url: getAllImages(serverURL),
                },
            });
        })
        .catch(error => onError(res, error));
});

function onError (response: any, error: any) {
    console.error(error);

    response.status(500).json({
        error: error,
    });
}

function getSingleImageUrl (serverURL: string, imageResult: { _id: string }) {
    console.log(typeof serverURL);
    console.log(typeof imageResult._id);

    return `${serverURL}/api/images/${imageResult._id}`;
}

function getAllImages (serverURL: string) {
    return `${serverURL}/api/images/`;
}

export default router;
