import fs, {promises} from "fs";
import {executorQueue} from "./queue";
import {TestcaseEntities, Job} from "./job";
import {fetch} from "./fetch";
import {PingRequest} from "./models";
import path from "path";
import {JobExecutor} from "./jobExecutor";
import {sleep} from "./utils";
import {Config} from "./config";
import {debug} from "debug";

const prepare = async () => {
    // ping server first
    const pingResponse = await fetch(new PingRequest());
    if (pingResponse.message !== "pong") {
        throw new Error(`[main] server is not ready`);
    }
}

const main = async () => {
    await prepare();

    const logger = debug("main");
    const files = await promises.readdir(Config.testcases);

    let clearCounter = 15;
    // prepare test cases
    for (let f of files) {
        if (f.endsWith(".js")) {
            const content = (await promises.readFile(path.join(Config.testcases, f))).toString().split("\n");
            if (content.length !== 2) {
                logger(`invalid test case, skipping...`);
                continue;
            }

            // normalize api
            try {
                const entities = JSON.parse(content[0].split("// ")[1]) as TestcaseEntities;
                if (!entities.name.startsWith("wx.")) {
                    continue;
                }
                if (Config.blackList.includes(entities.name)) {
                    continue;
                }
                executorQueue.enqueue(new JobExecutor(new Job(entities, content[1])));
            } catch (e) {
                logger(`error in parse entities for file ${f}: ${e}`);
            }

            clearCounter -= 1;
            if (clearCounter === 0) {
                const entities = {name: "clear global result set", type: "SYNC"} as TestcaseEntities;
                // executorQueue.enqueue(new JobExecutor(new Job(entities, "globalThis.resultSet = {}")));
                clearCounter = 15;
            }
        }
    }

    const queueLogger = logger.extend("queue");
    const writer = fs.createWriteStream(Config.output);
    writer.write("api,result,exception,final_status,elapsed_time\n");
    while (executorQueue.size() !== 0) {
        const jobExecutor = executorQueue.dequeue();
        queueLogger(`queue size: ${executorQueue.size()}, currently working on: ${jobExecutor.getJob().getApi()}`);
        await jobExecutor.execute();
        queueLogger(`job: ${jobExecutor.getJob().getApi()} executed, after execution status: ${jobExecutor.getStatus()}`);

        // don't care the results
        if (jobExecutor.getJob().getApi() === "clear global result set") {
            // take a breath, wait GC (probably)
            await sleep(600);
            continue;
        }

        // sleep 300ms for network delay
        // await sleep(300);

        if (jobExecutor.getStatus() === "RETRY") {
            logger(`job ${jobExecutor.getJob().getApi()} has no result yet, will retry`);
            executorQueue.enqueue(jobExecutor);
            continue;
        }

        if (jobExecutor.getStatus() === "ASYNC_FETCH_RETRY") {
            logger(`job ${jobExecutor.getJob().getApi()} has finished but async results are not ready, will retry`);
            executorQueue.enqueue(jobExecutor);
            continue;
        }

        try {
            const job = jobExecutor.getJob();
            writer.write(
                `${job.getApi()},${job.getResult()},${job.getException()},${jobExecutor.getStatus()},${jobExecutor.getBenchTime()}\n`);
        } catch (e) {
            logger(`error in obtain final result: ${e}`);
        }
    }
}


(async () => {
    await main();
})()
