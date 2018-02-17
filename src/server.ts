// Immediately load the dotenv file.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

import { listen } from './utils/listen';

import imageRoutes from './routes/images';

console.log('Hold your horses! I am (Re)starting...');

// If there is an environment variable for the port, to run this on, use that, else use 3000.
const port = process.env.PORT || '3000';

// This creates the server, via the http package.
const startup = async () => {
    // tslint:disable-next-line:ter-max-len
    const connectionLink = `mongodb://${process.env.MONGO_ATLAS_NAME}:${process.env.MONGO_ATLAS_PW}${process.env.MONGO_ATLAS_CLUSTER}`;

    mongoose.connect(connectionLink);

    const app = express();

    // Use this route to get images by their image name.
    app.use('/uploads', express.static('uploads'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.header('Acces-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    app.use('/api/images', imageRoutes);

    app.use((req: any, res: any, next: any) => {
        const error = new Error('Route not found!');
        error.name = 'RouteError';
        next(error);
    });

    app.use((error, req: any, res: any, next: any) => {
        res.status(error.status || 500);
        res.json({
            error: {
                message: error.message,
            },
        });
    });

    await listen(app, {
        port: parseInt(port, 10),
    });
};

// Runs the startup code and listens for a promise.
startup()
    .then(() => {
        const baseUrl = `${process.env.BASE_URL}${port}`;
        console.log(`API Endpoint: ${baseUrl}/api/`);
    })
    .catch((error: any) => {
        console.error(error.stack);
    });

// Catches all other errors.
process.on('unhandledRejection', (r: any) => {
    console.log(r);
});

// Handles ctlr+c events.
process.on('SIGINT', async () => {
    try {
        console.log(' Bye!');
    } catch (err) {
        console.error('You have an error in the SIGINT handler', err.stack);
    }

    process.exit(0);
});
