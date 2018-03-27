import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import * as auth from '../auth/check-auth'
const router = express.Router()

router.get('/:imageFileName', auth.checkAuth, (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const fileName = req.params.imageFileName
    const filePath = path.resolve(`uploads/${fileName}`)
    const fileExtension = path.extname(filePath).replace(/\./g, '/')

    fs.readFile(filePath, 'base64', (error: object, base64String: string) => {
        if (error) {
            return res.status(500).json({
                message: 'Something went wrong inside the server!',
            })
        } else {
            res.status(200).json({
                base64String,
                fileExtension,
            })
        }
    })
})

export default router
