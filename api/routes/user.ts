import * as express from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

const router = express.Router();
const User = require('../models/user');

router.post('/signup', (req: any, res: any, next: any) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                // Status 409 means we get the request, but got a conflict.
                // Status 422 means unprocessable entity, which is pretty much the same as 409.
                return res.status(409).json({
                    message: 'Mail already exists',
                });
            } else {
                bcrypt.hash(req.body.password, 10, (error, hash) => {
                    if (error) {
                        return onError(res, error);
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                        });

                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    storedUser: {
                                        _id: result._id,
                                        name: result.name,
                                        email: result.email,
                                    },
                                    message: 'User successfully created',
                                });
                            })
                            .catch(error => onError(res, error));
                    }
                });
            }
        });
});

// Route for login in a user.
router.post('/login', (req: any, res: any, next: any) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed',
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (error, response) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Authentication failed',
                    });
                }

                if (response) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id,
                    }, process.env.JWT_KEY, {
                        expiresIn: '1h',
                    });

                    return res.status(200).json({
                        message: 'Authentication successful',
                        token: token,
                    });
                } else {
                    return res.status(401).json({
                        message: 'Authentication failed',
                    });
                }
            });
        })
        .catch(error => onError(res, error));
});

// DANGER: Delete all current users.
router.delete('/delete/', (req: any, res: any, next: any) => {
    User.remove({})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Deleted all items',
            });
        })
        .catch(error => onError(res, error));
});

// DANGER: Delete a specific user by id.
router.delete('/delete/:userId', (req: any, res: any, next: any) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted',
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

export default router;
