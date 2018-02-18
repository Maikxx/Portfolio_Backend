import * as express from 'express';
import * as multer from 'multer';
const router = express.Router();

import * as auth from '../auth/check-auth';
import * as ImageController from '../controllers/images';

// Set the typescript typing of the properties of the returned filetype.
interface FileType {
    mimetype: string;
    originalname: string;
    destination: string;
    filename: string;
    path: string;
    size: string;
}

// Define that the images need to be stored on a DISK, not in the memory and pass an object with options to it.
const storage = multer.diskStorage({
    destination: (request: object, file: FileType, callback: any) => {
        // Define a place to save the uploaded images.
        callback(null, 'uploads/');
    },
    filename: (request: object, file: FileType, callback: any) => {
        const {
            originalname,
        } = file;

        // Create a good filename to save, by checking if there is a space in the file and replacing it with an underscore.
        // Then paste the date of creation before it with an underscore and continue the process in the callback.
        const newDate = new Date().toISOString();
        const fileNameToSave = originalname.replace(/ /g, '_');

        callback(null, `${newDate}_${fileNameToSave}`);
    },
});

// Function which filters out the passable filetypes.
const fileFilter = (request: object, file: FileType, callback: any) => {
    const {
        mimetype,
    } = file;

    // Check if the mimetype of the passed file matches, what the API accepts.
    // If it does, continue the flow, else stop the flow and eventually throw an error.
    if (mimetype === 'image/jpeg' ||
        mimetype === 'image/jpg' ||
        mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

// Upload parameters for uploading files to multer, via FormData.
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
