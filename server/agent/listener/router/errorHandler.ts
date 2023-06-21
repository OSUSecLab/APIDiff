import {ClientRequest, ServerResponse} from "http";

const notFoundHandler = async (req: ClientRequest, res: ServerResponse) => {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({message: "not found"}));
}

const methodNotAllowedHandler = async (req: ClientRequest, res: ServerResponse) => {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({message: "method not allowed"}));
}

const internalServerErrorHandler = async (req: ClientRequest, res: ServerResponse) => {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({message: "internal server error"}));
}

export { notFoundHandler, methodNotAllowedHandler, internalServerErrorHandler }
