import {ClientRequest, ServerResponse} from "http";
import {Config} from "../config";
import {ITarget} from "../../evaluator/ITarget";
import {WeChatEvaluator} from "../../evaluator/impl/wechat";
import {TargetService} from "../../services/TargetService";
import {RemoteDebugger} from "../../evaluator/impl/remote-debug";

interface IncomingTarget {
    target: string;
    options: { [key: string]: string };
}

export const targetHandler = async (req: ClientRequest, res: ServerResponse) => {
    let rawData: Buffer;
    let data: IncomingTarget;
    req.on('data', (chunk: Buffer) => {
        rawData = chunk;
    });

    req.on('end', () => {
        try {
            data = JSON.parse(rawData.toString()) as IncomingTarget;
        } catch (e) {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify({message: `invalid body`}));
            return;
        }

        if (data.target === undefined || !Config.targetList.includes(data.target)) {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify({message: `invalid target`}));
            return;
        }

        let targetInstance: ITarget;
        switch (data.target) {
            case "wechat":
                targetInstance = new WeChatEvaluator();
                break;
            case "remote-debugger":
                targetInstance = new RemoteDebugger(data.options);
                break;
            default:
                targetInstance = new WeChatEvaluator();
        }

        TargetService.initialize(targetInstance);

        res.statusCode = 201;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({message: "target initialized"}));
    });
}
