import {Target} from "../Target";
import {ITarget} from "../ITarget";
import CDP from "chrome-remote-interface";


export class RemoteDebugger extends Target implements ITarget {

    private static readonly TAG = "remote-debug";
    private readonly websocketUrl: string;
    private chromeDebugger!: CDP.Client;
    private initialized: boolean;
    private globalThisWritable: boolean = false;
    private contextId: number;

    public constructor(_options: { [key: string]: string }) {
        super();
        this.websocketUrl = _options.url;
        this.initialized = false;
        this.contextId = _options.contextId === "" ? 2 : Number(_options.contextId);
    }

    public getDebugger () {
        return this.chromeDebugger;
    }

    async init(): Promise<void> {
        if (this.websocketUrl === "") {
            throw new Error(`[target ${RemoteDebugger.TAG}] invalid websocket URL`);
        }
        try {
            this.chromeDebugger = await CDP({target: this.websocketUrl, local: true});
            this.initialized = true;
        } catch (e) {
            console.error(`[target ${RemoteDebugger.TAG}] error in connecting to debugger: ${e}`);
            throw e;
        }
    }

    isGlobalThisWritable(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized()) {
                throw new Error(`[eval] initialize before check`);
            }
            this.eval(`(() => {globalThis.resultSet = {}; return (globalThis.resultSet !== undefined).toString();})()`, "", (res, err) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (JSON.parse(<string>res) == "true") {
                    resolve(true);
                    this.globalThisWritable = true;
                } else {
                    resolve(false);
                }
            });
        })
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    eval(script: string, jobId: string, callback: (result: (string | null), error: (Error | null)) => void): void {
        console.log(`[target ${RemoteDebugger.TAG}] evaluating in remote: ${this.websocketUrl}`);

        if (jobId !== "") {
            script = `
(() => {
    let result = {};
    globalThis.resultSet["${jobId}"] = {};
    try {
        result.syncResult = ${script};
        return JSON.stringify(result);
    } catch (e) {return e.toString();} 
})()`.replaceAll("::UUID::", jobId);
        } else {
            script = `(() => { let result = null; try { result = ${script}; return result === undefined ? "undefined": JSON.stringify(result);} catch (e) {return e.toString();} } )()`;
        }

        this.chromeDebugger.Runtime.evaluate({expression: script, contextId: this.contextId, timeout: 5000})
            .then((res) => {
                if (res.result.subtype && res.result.subtype === "error") {
                    console.error(`[target ${RemoteDebugger.TAG}] evaluate ${jobId} finished with exception`);
                    callback(null, new Error(res.result.description));
                    return;
                }
                console.debug(`[target ${RemoteDebugger.TAG}] evaluate ${jobId} finished with result`);
                callback(res.result.value, null);
            })
            .catch((e) => {
                console.error(`[target ${RemoteDebugger.TAG}] evaluate ${jobId} finished with exception`);
                callback(null, e);
            });
    }

}


