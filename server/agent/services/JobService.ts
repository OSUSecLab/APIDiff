import {Job} from "../model/Job";

export class JobService {
    private static instance: JobService;
    private readonly jobMap: Map<string, Job>;

    public constructor() {
        this.jobMap = new Map();
    }

    public static initialize() {
        JobService.instance = new JobService();
    }

    public getJobMap() {
        return this.jobMap;
    }

    public addJob(job: Job) {
        this.jobMap.set(job.getUUID(), job);
    }

    public getJobByUUID(uuid: string) {
        return this.jobMap.get(uuid);
    }

    public static isInitialized() {
        return JobService.instance !== undefined;
    }

    public static getInstance(): JobService {
        if (JobService.instance === undefined) {
            throw new Error("[job service] error: instance is not initialized, call ...initialize first");
        }
        return JobService.instance;
    }
}
