import {Target} from "../Target";
import {ITarget} from "../ITarget";


class WeChatEvaluator extends Target implements ITarget {
    // change the signature
    public static APPBRAND_J2V8_CONTEXT_MGR_CLASS_SIGNATURE = "com.tencent.mm.plugin.appbrand.n.a";

    private _jsRuntimeInstance!: Java.Wrapper;
    private _contextArray!: Array<Java.Wrapper>;

    private _currentContextIndex = 0;
    private _runnableCounter = 0;

    private initialized = false;
    public globalThisWritable = false;

    public async init() {
        this._jsRuntimeInstance = this.obtainJSRuntime(this.obtainActiveRuntime(this.obtainAppBrandRuntimeContainer()));
        this._contextArray = this.obtainJ2V8Contexts();
        this.findTargetContext();
        this.initialized = true;
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    public async isGlobalThisWritable(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized()) {
                throw new Error(`[eval] initialize before check`);
            }
            this.exec("(() => {globalThis.resultSet = {}; return globalThis.resultSet !== undefined;})()", "", (res, err) => {
                if (err) {
                    reject(err);
                }
                if (res == "true") {
                    resolve(true);
                    this.globalThisWritable = true;
                } else {
                    resolve(false);
                }
            });
        })
    }

    public obtainAppBrandRuntimeContainer(): Java.Wrapper {
        let instance: Java.Wrapper | null = null;
        Java.perform(() => {
            Java.choose("com.tencent.mm.plugin.appbrand.AppBrandRuntimeContainerWC", {
                onMatch: (i: Java.Wrapper) => {
                    console.log(`[enum container] got AppBrandRuntimeContainer instance: ${i}`);
                    instance = i;
                },
                onComplete: () => {
                    console.log(`[enum container] enumerate AppBrandRuntimeContainer completed.`);
                }
            })
        });

        if (instance === null) {
            throw new Error(`[enum container] error in enum AppBrandRuntimeContainer`);
        }

        return Java.cast(instance, Java.use("com.tencent.mm.plugin.appbrand.AppBrandRuntimeContainer"));
    }

    public obtainAppBrandService(appBrandRuntime: Java.Wrapper) {
        let appBrandServiceObject: Java.Wrapper | null = null;
        let appBrandServiceClassName: Java.Wrapper | null = null;
        Java.perform(() => {
            let fields = appBrandRuntime.class.getDeclaredFields();
            for (let i = 0; i < fields.length; i++) {
                fields[i].setAccessible(true);
                let value = fields[i].get(appBrandRuntime);

                try {
                    if (value.toString().startsWith("com.tencent.mm.plugin.appbrand.service")) {
                        appBrandServiceObject = value;
                        appBrandServiceClassName = value.toString().split("@")[0];
                        return;
                    }
                } catch (e) {
                    continue;
                }
            }
        });

        if (appBrandServiceObject === null || appBrandServiceClassName === null) {
            throw new Error(`[get AppBrandService] error in fetch AppBrandService.`);
        }

        return {
            className: appBrandServiceClassName,
            object: appBrandServiceObject
        };
    }

    public obtainActiveRuntime(appBrandRuntimeContainer: Java.Wrapper): Java.Wrapper {
        return Java.cast(appBrandRuntimeContainer.getActiveRuntime(), Java.use("com.tencent.mm.plugin.appbrand.AppBrandRuntime"));
    }

    public obtainJSRuntime(appBrandRuntime: Java.Wrapper): Java.Wrapper {
        const appBrandServiceInfo = this.obtainAppBrandService(appBrandRuntime);
        const appBrandService = Java.cast(appBrandServiceInfo.object, Java.use(appBrandServiceInfo.className));
        return Java.cast(appBrandService.getJsRuntime(), Java.use(WeChatEvaluator.APPBRAND_J2V8_CONTEXT_MGR_CLASS_SIGNATURE));
    }

    public obtainJ2V8Contexts(): Array<Java.Wrapper> {
        let contextArray = new Array<Java.Wrapper>();
        Java.perform(() => {
            Java.choose("com.eclipsesource.mmv8.V8ContextWrapper$V8ContextImpl", {
                onMatch: (i: Java.Wrapper) => {
                    const isolatePointer = new NativePointer(i.v8.value.v8RuntimePtr.value).readPointer();
                    const contextPointer = new NativePointer(i.getPtr()).readPointer();
                    console.log(`[enum context] got context @ 0x${contextPointer.toString(16)} in isolate @ 0x${isolatePointer.toString(16)}`);

                    contextArray.push(i);
                },
                onComplete: () =>{
                    console.log(`[enum context] enumerate isolate and context pointer completed.`);
                }
            })
        });
        return contextArray;
    }

    public postJobToJsThread(func: () => void) {
        const runnableClassName = `com.tencent.mm.appbrand.v8.JSRuntimeJob$${this._runnableCounter ++}`;
        this._jsRuntimeInstance.post(WeChatEvaluator.createRunnable(runnableClassName, func).$new());
    }

    public findTargetContext() {
        for (let i = 0; i < this._contextArray.length; i++) {
            try {
                console.log(`[find context] examine context index: ${i}`);
                this.exec("Object.keys(wx).length > 0", "", (result: string | null, error: Error | null) => {
                    // no idea why cannot use strict compare here
                    if (result == "true" && error === null) {
                        this._currentContextIndex = i;
                        console.log(`[find context] got target context, index: ${i}`);
                    }
                }, i);
            } catch (e) {
                console.error(`[find context] got error: ${e}`);
            }
        }
    }

    public getJsRuntime() {
        return this._jsRuntimeInstance;
    }

    public getContexts() {
        return this._contextArray;
    }

    public static createRunnable(name: string, func: () => void): Java.Wrapper {
        return Java.registerClass({
            name: name,
            implements: [ Java.use("java.lang.Runnable") ],
            fields: {},
            methods: {
                run: func
            }
        });
    }


    public exec(script: string, jobId: string, callback?: (result: string | null, error: Error | null) => void, index?: number): void {
        let context: Java.Wrapper;
        if (index !== undefined) {
            if (index > this._contextArray.length) {
                throw new Error(`[eval] index out of range: 0 - ${this._contextArray.length - 1}`);
            }
            context = this._contextArray[index];
        } else {
            context = this._contextArray[this._currentContextIndex];
        }

        console.log(`[eval] evaluating in context: 0x${new NativePointer(context.getPtr()).readPointer().toString(16)}`);

        if (jobId !== "") {
            script = `
(() => {
    let result = {};
    globalThis.resultSet["${jobId}"] = {};
    try {
        result.syncResult = ${script};
        return JSON.stringify(result);
    } catch (e) {return e;} 
})()`.replaceAll("::UUID::", jobId);
        } else {
            script = `(() => { let result = null; try { result = ${script}; return result === undefined ? "undefined": result;} catch (e) {return e;} } )()`;
        }

        const executeDetailsClass = Java.use("com.eclipsesource.mmv8.ExecuteDetails");
        const executeDetailsInstance = executeDetailsClass.$new();
        executeDetailsInstance.sourceLength = script.length;

        this.postJobToJsThread(() => {
            console.log(`[eval] try to acquire thread locker...`);
            try {
                context.v8.value.locker.value.acquire();
            } catch (e) {
                console.error(`[eval] acquire thread lock failed.`);
                if (callback && e instanceof Error) {
                    callback(null, e);
                }
                return;
            }

            console.log(`[eval] about to eval script: ${script}`);
            context.v8.value.switchV8Context(context.getPtr());
            const result = context.executeScript(script, executeDetailsInstance);

            // if it has callback, omit the output
            if (callback !== undefined) {
                callback(result.toString(), null);
                return;
            }

            console.log(`[eval] obtained eval result:`);
            console.log(result)
        });
    }

    public eval(script: string, jobId: string, callback: (results: string | null, error: Error | null) => void): void {
        this.exec(script, jobId, callback);
    }

}

export { WeChatEvaluator }