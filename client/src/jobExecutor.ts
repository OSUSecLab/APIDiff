import {Job} from "./job";
import {fetch} from "./fetch";
import {EvalRequest, ExceptionResultResponse, ResultRequest, ResultResponseBase, SuccessResultResponse} from "./models";
import {sleep} from "./utils";
import debug from "debug";

export type Status = "INIT" | "SENT" | "ASYNC_SENT" | "RESOLVED" | "RETRY" | "ASYNC_FETCH_RETRY" | "FAILED";

export class JobExecutor {
    private readonly job: Job;
    private asyncFetchJob!: Job;
    private status: Status;
    private beginTime: number;
    private endTime: number;
    private elapsedTime: number;
    private static logger = debug("executor");

    constructor(_job: Job) {
        this.job = _job;
        this.status = "INIT";
    }

    public getStatus () {
        return this.status;
    }

    public setStatus (_status: Status) {
        this.status = _status;
    }

    public getJob() {
        return this.job;
    }

    public getAsyncFetchJob(): Job {
        if (this.job.type === "ASYNC") {
            return this.asyncFetchJob;
        }
        throw new Error(`sync eval does not have async fetch job`);
    }

    public async sendJob (_job: Job = this.job) {
        // send eval request
        const evalResponse = await fetch(new EvalRequest({
            script: _job.script
        })) as ResultResponseBase;

        if (evalResponse.message !== "success") {
            throw new Error(`[main] error in sending job request`);
        }

        _job.setUUID(evalResponse.jobUUID);
        _job.setSequence(evalResponse.jobSequence);
        this.status = this.job.type === "ASYNC" ? "ASYNC_SENT" : "SENT";
    }

    public async fetchResult (_job: Job = this.job): Promise<void> {
        const fetchLogger = JobExecutor.logger.extend("fetch");
        // if async api, send another fetching job
        if (_job.type === "ASYNC") {
            if (this.asyncFetchJob === undefined) {
                // new async fetch job
                this.asyncFetchJob = new Job(this.job.entities,
                    `(() => {return JSON.stringify(globalThis.resultSet["${this.job.getUUID()}"])})()`);
                this.asyncFetchJob.setType("SYNC");
                await this.sendJob(this.asyncFetchJob);
            }
            // sleep 300ms for network delay
            await sleep(300);

            // we already have async fetch job, retry it here
            return await this.fetchResult(this.asyncFetchJob);
        }
        // sleep 300ms for network delay
        await sleep(300);

        // send result request
        const resultResponse = await fetch(new ResultRequest(_job.getUUID()));

        if (resultResponse.message === "job is not resolved") {
            if (this.job.type === "SYNC") {
                this.status = this.status === "RETRY" ? "FAILED" : "RETRY";
            }
            if (this.job.type === "ASYNC" && _job.type === "SYNC") {
                // async fetch results job
                this.status = this.status === "ASYNC_FETCH_RETRY" ? "FAILED" : "ASYNC_FETCH_RETRY";
            }
            return;
        }

        if (resultResponse.message === "success") {
            fetchLogger(`job ${this.job.api} is finished with result`);
            this.job.setFinished();
            this.status = "RESOLVED";
            if ("exception" in resultResponse) {
                this.job.setException((<ExceptionResultResponse> resultResponse).exception);
            }
            if ("result" in resultResponse) {
                this.job.setResult((<SuccessResultResponse> resultResponse).result);
            }
            return;
        }

        throw new Error(`[main] error in retrieve result: ${resultResponse.message}`);
    }

    public async retryJob (_job: Job = this.job) {
        if (this.status === "RETRY" || this.status === "ASYNC_FETCH_RETRY") {
            await this.fetchResult(_job);
            return;
        }
        // nothing to do if status is not retry
    }

    public async collectResult () {
        return {
            api: this.job.api,
            result: this.job.getResult(),
            exception: this.job.getException(),
            finalStatus: this.status
        }
    }

    public benchTick () {
        this.beginTime = Date.now();
    }

    public benchTok () {
        this.endTime = Date.now();
    }

    public getBenchTime () {
        return this.elapsedTime;
    }

    public async execute () {
        const executeLogger = JobExecutor.logger.extend("execute");
        if (this.status === "FAILED") {
            executeLogger(`[Job Executor] job ${this.job.getApi()} has failed`);
            return;
        }

        try {
            if (this.status === "RETRY" || this.status === "ASYNC_FETCH_RETRY") {
                await this.retryJob();
                return;
            }
        } catch (e) {
            executeLogger(`[Job Executor] error in retry job set: ${e}`);
        }


        try {
            this.benchTick();
            await this.sendJob();
            await this.fetchResult();
            this.benchTok();
            this.elapsedTime = this.endTime - this.beginTime;
        } catch (e) {
            executeLogger(`[Job Executor] error in execute job set: ${e}`);
        }
    }

}
