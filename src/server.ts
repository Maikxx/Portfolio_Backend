import * as express from 'express';
import { listen } from './utils/listen';

import imageRoutes from './routes/images';

console.log('Aloha! (Re)starting...');

// If there is an environment variable for the port, to run this on, use that, else use 3000.
const port = '3000';

// This creates the server, via the http package.
const startup = async () => {
    console.log('Starting the http server');
    const app = express();

    app.use('/api/images', imageRoutes);

    await listen(app, {
        port: parseInt(port, 10),
    });
};

startup()
    .then(() => {
        const baseUrl = `http://localhost:3000`;
        console.log(`API Endpoint: ${baseUrl}/api/`);
        console.log(`Go ahead and use, use, use!`);
    })
    .catch((error) => {
        console.log(error.stack);
    });

// Catches all other errors.
process.on('unhandledRejection', (r) => {
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
