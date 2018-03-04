import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as auth from '../auth/check-auth';
const router = express.Router();

router.get('/:imageFileName', auth.checkAuth, (req: any, res: any, next: any) => {
    const fileName = req.params.imageFileName;
    const filePath = path.resolve(`uploads/${fileName}`);
    const fileExtension = path.extname(filePath).replace(/\./g, '/');
    const base64String = fs.readFileSync(filePath, 'base64');

    res.status(200).json({
        base64String,
        fileExtension,
    });
});

export default router;
