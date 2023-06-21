import {WeChatEvaluator} from "./impl/wechat";
import {getProcessName} from "../utils/common";
import {ITarget} from "./ITarget";
import {TargetService} from "../services/TargetService";
import {getRemoteDebuggerUrl, getRemoteDebugContextId} from "../utils/env";
import {RemoteDebugger} from "./impl/remote-debug";


const checkTarget = (): ITarget => {
    let processName = null;
    try {
        processName = getProcessName();
    } catch (e) {
        console.error(`[evaluator check target] error in obtaining target, use general evaluator`);
        return new WeChatEvaluator();
    }
    // check if process is wechat
    if (processName !== null && processName.indexOf("com.tencent.mm") >= 0) {
        console.log(`[evaluator] select wechat evaluator automatically by process name`);
        return new WeChatEvaluator();
    }
    if (processName !== null && processName === "node") {
        console.log(`[evaluator] select remote debugger, evaluator requires websocket URL`);
        const remoteDebuggerUrl = getRemoteDebuggerUrl();
        if (remoteDebuggerUrl !== "") {
            console.log(`[evaluator] remote debugger: will be connected to ${remoteDebuggerUrl}`);
            return new RemoteDebugger({url: remoteDebuggerUrl, contextId: getRemoteDebugContextId()});
        } else {
            console.error(`[evaluator] error in obtain remote debugger websocket url, re-initialize by request /target`);
        }
    }
    console.log(`[evaluator] nothing matched, fall back to empty remote debugger`);
    return new RemoteDebugger({url: ""});
}


export const initEvaluator = () => {
    console.log(`[evaluator init] select evaluator...`)
    if (!TargetService.isInitialized()) {
        TargetService.initialize(checkTarget());
    }
    try {
        const target = TargetService.getInstance().getTarget();
        if (!target.isInitialized()) {
            target.init()
                .then(() => {
                    TargetService.getInstance().getTarget().isGlobalThisWritable()
                        .then(r => {
                            if (r)
                                console.log("[evaluator init] globalThis is writable");
                            else
                                console.log("[evaluator init] globalThis is not writable");})
                        .catch(e => {console.error(e)})
                })
                .catch((e) => {
                    console.error(`[evaluator init] error in init target: ${e}`);
                });
        }
    } catch (e) {
        console.error(`[evaluator init] error in init target: ${e}`);
    }
}
