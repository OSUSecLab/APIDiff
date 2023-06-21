import { EventEmitter } from "events";
import {TargetService} from "../services/TargetService";
import {Job} from "../model/Job";

class EvalEmitter extends EventEmitter {}

const evalEmitter = new EvalEmitter();

evalEmitter.on('eval', (job: Job) => {
    setImmediate(async () => {
        if (!TargetService.isInitialized()) {
            throw new Error("[eval event] error: target service is not initialized");
        }

        let target = TargetService.getInstance().getTarget();
        if (!target.isInitialized()) {
            await target.init();
        }

        target.eval(job.script, job.getUUID(), (result, error) => {
            if (result !== null) {
                job.setResult(result);
            }
            if (error !== null) {
                job.setException(error.message);
            }
            job.setFinished();
        })
    });
});

evalEmitter.on('error', (err) => {
    console.error(`[eval event] error: ${err}`);
});


export { evalEmitter }