import {ClientRequest, ServerResponse} from "http";
import {Job} from "../../model/Job";
import {JobService} from "../../services/JobService";
import {evalEmitter} from "../../events";

interface IncomingJob {
    script: string
}

export const evalHandler = async (req: ClientRequest, res: ServerResponse) => {
    let rawData: Buffer;
    let data: IncomingJob;
    req.on('data', (chunk: Buffer) => {
        rawData = chunk;
    });

    req.on('end', () => {
        try {
            data = JSON.parse(rawData.toString()) as IncomingJob;
        } catch (e) {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify({message: `invalid body`}));
            return;
        }

        if (data.script === undefined || data.script.length == 0) {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify({message: `invalid script`}));
            return;
        }

        const job = new Job(data.script);
        if (!JobService.isInitialized()) {
            JobService.initialize();
        }
        const jobService = JobService.getInstance();
        jobService.addJob(job);

        evalEmitter.emit("eval", job);

        res.statusCode = 201;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({message: "success", jobSequence: job.getSequence(), jobUUID: job.getUUID()}));
    });
}
