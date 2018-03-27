// Immediately load the dotenv file.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load()
}

import * as helmet from 'helmet'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as mongoose from 'mongoose'

import { listen } from './utils/listen'

import imageRoutes from './routes/images'
import userRoutes from './routes/user'
import uploadsRoute from './routes/uploads'

console.log('Hold your horses! I am (Re)starting...')

// If there is an environment variable for the port, to run this on, use that, else use 3000.
const port = process.env.PORT || '3000'

// This creates the server, via the http package.
const startup = async () => {
    // tslint:disable-next-line:ter-max-len
    const connectionLink = `mongodb://${process.env.MONGO_ATLAS_NAME}:${process.env.MONGO_ATLAS_PW}${process.env.MONGO_ATLAS_CLUSTER}`

    // Start up a connection to the database with mongoose.
    mongoose.connect(connectionLink)

    const app = express()

    app.use(helmet())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // Set the access options for the app.
    app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

        if (req.method === 'OPTIONS') {
            res.header('Acces-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
            return res.status(200).json({})
        }
        next()
    })

    // Handling routes.
    app.use('/api/images', imageRoutes)
    app.use('/api/user', userRoutes)
    app.use('/uploads', uploadsRoute)

    // Route not found.
    app.use((req: any, res: any, next: any) => {
        const error = new Error('Route not found!')
        error.name = 'RouteError'
        next(error)
    })

    // Catch errors in the app.
    app.use((error: any, req: any, res: any, next: any) => {
        res.status(error.status || 500)
            .json({
                error: error,
            })
    })

    // Keep the server alive with this function.
    await listen(app, {
        port: parseInt(port, 10),
    })
}

// Runs the startup code and listens for a result from the listen(app).
// If the startup function is succesful log the API endpoint, else log an error to the console.
// This error contaisn a trace of which functions where called, in what order etc.
startup()
    .then(() => {
        const baseUrl = `${process.env.BASE_URL}${port}`
        console.log(`API Endpoint: ${baseUrl}/api/`)
    })
    .catch((error: any) => {
        console.error(error.stack)
    })

// Catches rejection errors, and log it to the console.
process.on('unhandledRejection', (rejection: any) => {
    console.log(rejection)
})

// Handles ctlr+c events. If it cannot normally exit the program then log an error and exit the process.
// Else just log Bye!
process.on('SIGINT', async () => {
    try {
        console.log('Bye!')
    } catch (error) {
        console.error('You have an error in the SIGINT handler', error.stack)
    }

    process.exit(0)
})
