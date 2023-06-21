import {ClientRequest, ServerResponse} from "http";
import {JobService} from "../../services/JobService";
import {ExceptionResultMessage, ResultMessageBase, SuccessResultMessage} from "../../model/Message";


export const resultHandler = async (req: ClientRequest, res: ServerResponse) => {
    // @ts-ignore // http standard library issues
    const requestPath: string = req.url;
    if (requestPath.split("/").length !== 3) {
        res.statusCode = 400;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({message: "invalid uuid"}));
        return;
    }

    const uuid = requestPath.split("/")[2];
    if (!JobService.isInitialized()) {
        JobService.initialize();
    }
    const jobService = JobService.getInstance();
    const job = jobService.getJobByUUID(uuid);
    if (job === undefined) {
        res.statusCode = 404;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({message: "job not found via uuid"}));
        return;
    }

    if (!job.isFinished()) {
        res.statusCode = 418;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({message: "job is not resolved"}));
        return;
    }

    const message = {
        message: "success",
        jobSequence: job.getSequence(),
        jobUUID: job.getUUID()
    } as ResultMessageBase;

    if (job.hasException()) {
        (<ExceptionResultMessage> message).exception = job.getException();
        res.statusCode = 200;
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify(message));
        return;
    }

    (<SuccessResultMessage> message).result = job.getResult();

    res.statusCode = 200;
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify(message));
}
