import { Application } from 'express';
import * as http from 'http';
import * as promisify from 'es6-promisify';

export async function listen(app: Application, { port }) {
    const server = http.createServer(app);
    await promisify(server.listen.bind(server))(port);
}
