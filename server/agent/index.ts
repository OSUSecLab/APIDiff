import { initWebServer } from "./listener";
import { getFilesDir, getProcessName } from "./utils/common";
import {initEvaluator} from "./evaluator";
import {TargetService} from "./services/TargetService";
import {checkEnv, enableNodeRepl} from "./utils/env";
import repl from "repl"
import {JobService} from "./services/JobService";
import {Target} from "./evaluator/Target";
import {RemoteDebugger} from "./evaluator/impl/remote-debug";


// debug promote
(global as any).exec = (script: string) => {
    if (!TargetService.isInitialized() || !TargetService.getInstance().getTarget().isInitialized()) {
        console.error(`[eval] target is not initialized`);
        return;
    }
    TargetService.getInstance().getTarget().eval(script, "", (result, error) => {
        if (error) {
            console.error(`[eval] error: ${error}`);
            return;
        }
        console.log(`[eval] result: ${result}`);
    });
}

// debug
(global as any).getDebugObjects = () => {
    return [TargetService, JobService];
}

// debug
(global as any).getDebugger = () => {
    return (<RemoteDebugger>TargetService.getInstance().getTarget())
        .getDebugger();
}


// nodejs REPL
const nodeRepl = () => {
    repl.start("[Node.JS @ Local] >>> ");
}

(async () => {
    initWebServer();
    if (checkEnv() === "FRIDA") {
        // running in FRIDA, guessing android
        console.log(`[main] running in FRIDA`);
        console.log(`[main] app files dir path: ${getFilesDir()}`);
        console.log(`[main] process name: ${getProcessName()}`);
    } else {
        // running in Node.JS, skip android checking
        console.log(`[main] running in Node.JS`);
        if (enableNodeRepl()) {
            nodeRepl();
        }
    }
    await initEvaluator();
})();

