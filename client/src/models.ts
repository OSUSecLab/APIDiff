import {Endpoints} from "./endpoints";
import {Config} from "./config";

export interface IRequestBody {}

export interface TargetRequestBody extends IRequestBody {
    target: string
}

export interface EvalRequestBody extends IRequestBody {
    script: string
}

export abstract class RequestModelBase {
    public urlBase = `http://${Config.host}:${Config.port}`
    public endpoint: string;
    public method: string;
    public body?: IRequestBody;

    public abstract getUrl(): string
}

export class PingRequest extends RequestModelBase {
    public endpoint = Endpoints.PING_API;
    public method = "GET";

    public getUrl(): string {
        return `${this.urlBase}${this.endpoint}`;
    }
}

export class TargetRequest extends RequestModelBase {
    public endpoint = Endpoints.TARGET_API;
    public method = "POST";
    public body: TargetRequestBody;

    public constructor(_body: TargetRequestBody) {
        super();
        this.body = _body;
    }

    public setBody(body: TargetRequestBody) {
        this.body = body;
    }

    public getBody() {
        return this.body;
    }

    public getUrl(): string {
        return `${this.urlBase}${this.endpoint}`;
    }
}

export class EvalRequest extends RequestModelBase {
    public endpoint = Endpoints.EVAL_API;
    public method = "POST";
    public body: EvalRequestBody;

    public constructor(_body: EvalRequestBody) {
        super();
        this.body = _body;
    }

    public getUrl(): string {
        return `${this.urlBase}${this.endpoint}`;
    }

    public setBody(body: EvalRequestBody) {
        this.body = body;
    }

    public getBody() {
        return this.body;
    }
}

export class ResultRequest extends RequestModelBase {
    public endpoint = Endpoints.RESULT_API;
    public method = "GET";
    public uuid: string;

    public constructor(_uuid: string) {
        super();
        this.uuid = _uuid;
    }

    public setUUID(uuid: string) {
        this.uuid = uuid;
    }

    public getUrl(): string {
        return `${this.urlBase}${this.endpoint.replace(":uuid", this.uuid)}`;
    }
}

export interface IResponseBase {
    message: string
}

export interface ResultResponseBase extends IResponseBase {
    jobUUID: string;
    jobSequence: number;
}

export interface SuccessResultResponse extends ResultResponseBase {
    result: string;
}

export interface ExceptionResultResponse extends ResultResponseBase {
    exception: string;
}

