import * as express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /api/images.',
    });
});

router.post('/', (req, res, next) => {
    const image = {
        imageId: req.body.imageId,
        name: req.body.name,
    };

    res.status(201).json({
        message: 'Handling POST requests to /api/images.',
        storedImage: image,
    });
});

router.get('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    if (imageId === 'special') {
        res.status(200).json({
            message: 'Handling GET requests to /api/images/special.',
            imageId: imageId,
        });
    } else {
        res.status(200).json({
            message: 'You passed another ID.',
        });
    }
});

router.delete('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;

    res.status(200).json({
        message: `Deleted imageId: ${imageId}.`,
    });
});

export default router;
