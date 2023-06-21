import { ClientRequest, ServerResponse } from "http";

import {notFoundHandler, methodNotAllowedHandler, internalServerErrorHandler} from "./errorHandler";
import { pingHandler } from "./pingHandler";
import { evalHandler } from "./evalHandler";
import {targetHandler} from "./targetHandler";
import {resultHandler} from "./resultHandler";


export const router = () => {
    return (req: ClientRequest, res: ServerResponse): Promise<void> => {
        // @ts-ignore // http standard library issues
        const requestPath = req.url;
        const requestMethod = req.method;
        console.log(`[listener router] got request from client, method: ${requestMethod}, path: ${requestPath}`);
        // error handler
        req.on('error', (err) => {
            console.error(`[listener req] error in request: ${err}`);
            res.statusCode = 400;
            res.end();
        });
        res.on('error', (err) => {
            console.error(`[listener res] error in response: ${err}`);
        });

        // capture all exceptions and reply to client
        try {
            // router dispatch
            // /ping handler
            if (requestPath === "/ping") {
                if (requestMethod !== "GET") {
                    return methodNotAllowedHandler(req, res);
                }
                return pingHandler(req, res);
            }
            // /target handler
            if (requestPath === "/target") {
                if (requestMethod !== "POST") {
                    return methodNotAllowedHandler(req, res);
                }
                return targetHandler(req, res);
            }
            // /eval handler
            if (requestPath === "/eval") {
                if (requestMethod !== "POST") {
                    return methodNotAllowedHandler(req, res);
                }
                return evalHandler(req, res);
            }
            // /result handler
            if (requestPath.startsWith("/result")) {
                if (requestMethod !== "GET") {
                    return methodNotAllowedHandler(req, res);
                }
                return resultHandler(req, res);
            }

            // no handler matches, fall back to 404
            return notFoundHandler(req, res);
        } catch (e) {
            console.error(`[router] error in handling request ${requestPath} : ${e}`);
            return internalServerErrorHandler(req, res);
        }
    }
}
