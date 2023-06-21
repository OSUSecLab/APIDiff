import {Target} from "../evaluator/Target";

export class TargetService {
    private static instance: TargetService;
    private readonly target: Target;

    public constructor(_target: Target) {
        this.target = _target;
    }

    public getTarget() {
        return this.target;
    }

    public static initialize(_target: Target) {
        TargetService.instance = new TargetService(_target);
    }

    public static isInitialized() {
        return TargetService.instance !== undefined;
    }

    public static getInstance(): TargetService {
        if (TargetService.instance === undefined) {
            throw new Error("[target service] error: instance is not initialized, call ...initialize first");
        }
        return TargetService.instance;
    }
}
