import { Config } from "./config";
import { router } from "./router";
import { createServer } from "http";

const server = createServer();

server.on('request', router());

const initWebServer = () => {
    server.listen(Config.listenPort, () => {
        console.log(`[listener] http listening on ${Config.listenHost}:${Config.listenPort}`);
    });
    server.on('error', (e) => {
        console.log(`[listener] http server on error: ${e}`);
    });
}

export {
    initWebServer
}
