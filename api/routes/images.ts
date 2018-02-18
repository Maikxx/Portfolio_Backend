import * as express from 'express';
import * as multer from 'multer';
const router = express.Router();

import * as auth from '../auth/check-auth';
import * as ImageController from '../controllers/images';

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

// Create a new image with the name, description and location that are passed in via the request.
router.post('/', auth.checkAuth, upload.single('image'), ImageController.post);

// Get all the Images from the database.
// Select does what it describes, it selects items to return in the response of the find.
router.get('/', auth.checkAuth, ImageController.getAll);

// Get a single Image by passing the id into the URL.
router.get('/:imageId', auth.checkAuth, ImageController.getSpecific);

// Update a single image handling route.
// If you want to access this, set a body of a request, with an array of objects.
// Each object should have a propName assigned to the corresponding propName that you want to update, and a "value".
// The value you set here is the new value for the property.
router.patch('/:imageId', auth.checkAuth, ImageController.patch);

// Delete all database logs of type Image.
router.delete('/', auth.checkAuth, ImageController.deleteAll);

// Delete only the Image with the id passed in to the URL.
router.delete('/:imageId', auth.checkAuth, ImageController.deleteSpecific);

export default router;
