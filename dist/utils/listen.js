"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const promisify = require("es6-promisify");
async function listen(app, { port }) {
    const server = http.createServer(app);
    await promisify(server.listen.bind(server))(port);
}
exports.listen = listen;
//# sourceMappingURL=listen.js.map