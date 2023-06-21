import {ITarget} from "./ITarget";

export abstract class Target implements ITarget {
    public abstract init(): Promise<void>;
    public abstract eval(script: string, jobId: string, callback: (result: string | null, error: Error | null) => void): void;
    public abstract isInitialized(): boolean;
    public abstract isGlobalThisWritable(): Promise<boolean>;
}
