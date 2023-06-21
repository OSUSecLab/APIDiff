import { getUUID } from "../utils/common";
import { globalCounter } from "../utils/counter";

class Job {
    public script: string;
    private readonly sequence: number;
    private readonly uuid: string;

    private result!: string;
    private exception!: string;
    private finished: boolean;

    constructor(_script: string) {
        this.uuid = getUUID();
        this.script = _script;
        this.sequence = globalCounter.getCounter();
        this.finished = false;
    }

    public getResult(): string {
        return this.result;
    }

    public setResult(_result: string) {
        this.result = _result;
    }

    public hasException(): boolean {
        return typeof this.exception !== "undefined";
    }

    public getException(): string {
        return this.exception;
    }

    public setException(_exception: string) {
        this.exception = _exception;
    }

    public isFinished(): boolean {
        return this.finished;
    }

    public setFinished() {
        this.finished = true;
    }

    public getSequence() {
        return this.sequence;
    }

    public getUUID() {
        return this.uuid;
    }
}

export { Job }
