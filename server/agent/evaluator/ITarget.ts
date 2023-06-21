
export interface ITarget {
    init: () => Promise<void>;
    isInitialized: () => boolean;
    eval: (script: string, jobId: string, callback: (result: string | null, error: Error | null) => void) => void;
    isGlobalThisWritable: () => Promise<boolean>;
}
