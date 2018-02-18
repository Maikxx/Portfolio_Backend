import { Application } from 'express';
import * as http from 'http';
import * as promisify from 'es6-promisify';

// Export an asynchronous function, that creates a server with the given express app passed in.
// Return a promised version of the server, which is bound to the server and the port that is passed in.
// Doing this ensures the startup function in the server file, to be able to access .then and .catch.
export async function listen(app: Application, { port }) {
    const server = http.createServer(app);
    await promisify(server.listen.bind(server))(port);
}
