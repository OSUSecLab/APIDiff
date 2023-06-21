import {checkEnv} from "./env";

export const getFilesDir = (): string => {
    let dir = null;
    Java.perform(() => {
        dir = Java.use("android.app.ActivityThread")
            .currentApplication()
            .getApplicationContext()
            .getFilesDir()
            .getCanonicalPath();
    });
    if (dir === null) {
        throw new Error(`[utils] error in obtain files path`);
    }
    return dir;
}

export const getUUID = (): string => {
    if (checkEnv() === "NODEJS") {
        return require('crypto').randomUUID();
    }

    // android
    let uuid = null;
    Java.perform(() => {
        uuid = Java.use("java.util.UUID")
            .randomUUID()
            .toString();
    });
    if (uuid === null) {
        throw new Error(`[utils] error in generating random uuid`);
    }
    return uuid;
}

export const getProcessName = (): string => {
    if (checkEnv() === "NODEJS") {
        return "node";
    }

    // android
    let processName = null;
    Java.perform(() => {
        processName = Java.use("android.app.ActivityThread")
            .currentProcessName()
    });
    if (processName === null) {
        throw new Error(`[utils] error in obtaining current process name`);
    }
    return processName;
}
