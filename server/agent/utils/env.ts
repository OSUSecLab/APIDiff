export const checkEnv = (): "NODEJS" | "FRIDA" => {
    if ("PATH" in process.env) {
        return "NODEJS";
    } else {
        return "FRIDA";
    }
}

export const getRemoteDebuggerUrl = () => {
    const debuggerUrl = process.env["REMOTE_DEBUG_WS"];
    if (debuggerUrl === undefined) {
        return "";
    } else {
        return debuggerUrl;
    }
}

export const getRemoteDebugContextId = () => {
    const contextId = process.env["REMOTE_DEBUG_CONTEXT_ID"];
    if (contextId === undefined) {
        return "";
    } else {
        return contextId;
    }
}

export const enableNodeRepl = () => {
    return process.env["ENABLE_NODE_REPL"] !== undefined;
}
