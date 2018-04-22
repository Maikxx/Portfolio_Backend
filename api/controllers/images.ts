import * as express from 'express'
import * as mongoose from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'
import { MulterFile } from '../types/multerFile'
import { ImageType } from '../types/image'

const Image = require('../models/image')

export async function post (req: express.Request & {files: MulterFile[]}, res: express.Response, next: express.NextFunction) {
    function calculateFileSize(size: number) {
        return size / 1000
    }

    if (req.files && req.files.length) {
        try {
            await req.files.map(async (file: MulterFile) => {
                const image = await new Image({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    description: req.body.description,
                    location: req.body.location,
                    image: {
                        originalname: file.originalname,
                        destination: file.destination,
                        filename: file.filename,
                        path: file.path,
                        size: `${calculateFileSize(file.size)}kb`,
                    },
                })

                await image.save()
            })
        } catch (error) {
            onError(res, error)
        }

        res.status(201).json({
            message: 'OK, images succesfully saved.',
        })
    }
}

export function getAll (req: express.Request, res: express.Response, next: express.NextFunction) {
    Image.find()
        .select('name description location image')
        .exec()
        .then((results: any) => {
            res.status(200).json({
                count: results.length,
                images: results.map((result: ImageType) => {
                    const { _id } = result

                    return {
                        _id: _id,
                        name: result.name,
                        description: result.description,
                        location: result.location,
                        image: result.image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(generateServerUrl(req), _id),
                        },
                    }
                }
            )})
        })
        .catch((error: any) => onError(res, error))
}

export function getSpecific (req: express.Request, res: express.Response, next: express.NextFunction) {
    const imageId = req.params.imageId

    Image.findById(imageId)
        .then((result: ImageType) => {
            const {
                _id,
            } = result

            if (!result) {
                res.status(404).json({
                    message: 'No valid entry found for the provided ID',
                })
            } else {
                res.status(200).json({
                    storedImage: {
                        _id: _id,
                        name: result.name,
                        description: result.description,
                        location: result.location,
                        image: result.image,
                        requestUsed: {
                            type: 'GET',
                            url: getSingleImageUrl(generateServerUrl(req), _id),
                        },
                    },
                })
            }
        })
        .catch((error: any) => onError(res, error))
}

export function patch (req: express.Request, res: express.Response, next: express.NextFunction) {
    const imageId = req.params.imageId
    const updateOps = {}

    for (const ops of req.params.imageId) {
        updateOps[ops.propName] = ops.value
    }

    Image.update({ _id: imageId }, { $set: updateOps })
        .then((result: ImageType) => {
            const {
                _id,
            } = result

            res.status(200).json({
                patchedImage: {
                    _id: _id,
                    name: result.name,
                    description: result.description,
                    location: result.location,
                    image: result.image,
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
            })
        })
        .catch((error: any) => onError(res, error))
}

export function deleteAll (req: express.Request, res: express.Response, next: express.NextFunction) {
    Image.remove({})
        .exec()
        .then((result: any) => {
            const dirToRemoveFrom = 'uploads'

            fs.readdir(dirToRemoveFrom, (error: any, files: any) => {
                if (error) {
                    return console.error(error)
                }

                for (const file of files) {
                    fs.unlink(path.join(dirToRemoveFrom, file), (error: object) => {
                        if (error) {
                            return console.error(error)
                        }
                    })
                }
            })

            res.status(200).json({
                message: 'Deleted all items',
                requestAllImages: {
                    type: 'GET',
                    description: 'See the empty list of images.',
                    url: getAllImages(generateServerUrl(req)),
                },
            })
        })
        .catch((error: any) => onError(res, error))
}

export function deleteSpecific (req: express.Request, res: express.Response, next: express.NextFunction) {
    const imageId = req.params.imageId

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
            })
        })
        .catch((error: any) => onError(res, error))
}

function onError (response: express.Response, error: any) {
    console.error(error)

    response.status(500).json({
        error: error,
    })
}

function getSingleImageUrl (serverURL: string, imageId: string) {
    return `${serverURL}/api/images/${imageId}`
}

function generateServerUrl (req: express.Request) {
    return `${req.protocol}://${req.get('host')}`
}

function getAllImages (serverURL: string) {
    return `${serverURL}/api/images/`
}
