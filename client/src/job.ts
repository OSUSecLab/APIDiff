
export interface TestcaseEntities {
    name: string;
    type: "ASYNC" | "SYNC";
}

class Job {
    public script: string;
    public api: string;
    public entities: TestcaseEntities;
    public type: "ASYNC" | "SYNC"
    private sequence!: number;
    private uuid!: string;

    private result!: string;
    private exception!: string;
    private finished: boolean;

    constructor(_entities: TestcaseEntities, _script: string) {
        this.script = _script;
        this.api = _entities.name;
        this.type = _entities.type;
        this.entities = _entities;
        this.finished = false;
    }

    public getApi(): string {
        return this.api;
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

    public setSequence(sequence: number) {
        this.sequence = sequence;
    }

    public getUUID() {
        return this.uuid;
    }

    public setUUID(uuid: string) {
        this.uuid = uuid;
    }

    public setType(type: "ASYNC" | "SYNC") {
        this.type = type;
    }
}

export { Job }
