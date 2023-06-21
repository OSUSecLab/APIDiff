import {ClientRequest, ServerResponse} from "http";

export const pingHandler = async (req: ClientRequest, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({message: "pong"}));
}
