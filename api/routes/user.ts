import * as express from 'express'
const router = express.Router()

import * as auth from '../auth/check-auth'
import * as UserController from '../controllers/user'

// Route for signing users up.
router.post('/signup', UserController.postSignUp)

// Route for login in a user.
router.post('/login', UserController.postLogin)

if (process.env === 'DEVELOPMENT') {
    // DANGER: Delete all current users.
    router.delete('/delete/', auth.checkAuth, UserController.deleteAll)

    // DANGER: Delete a specific user by id.
    router.delete('/delete/:userId', auth.checkAuth, UserController.deleteSpecific)
}

export default router
