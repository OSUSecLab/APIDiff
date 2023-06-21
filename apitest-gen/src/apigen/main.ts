import {promises} from "fs";
import { generator } from "./generator";
import {API} from "../model/API";
import {Script} from "../model/Script";
import {Config} from "./config";
import {join} from "path";

// const api = {
//     name: "wx.test",
//     params: {
//         test: {type: "number", required: false},
//         array: {type: "Array", required: false, arrayType: "string"},
//         object: {type: "Object", required: true, nestObject: {
//             test: {type: "string", required: true}
//             }},
//         success: {type: "Function", required: true},
//         fail: {type: "Function", required: true},
//         complete: {type: "Function", required: true}
//     },
//     type: "ASYNC"
// } as API;

(async () => {
    // check input and output
    try {
        await promises.access(Config.inputDocument);
    } catch {
        console.error(`[main] input does not exist`);
        return;
    }
    try {
        await promises.access(Config.outputDirectory);
    } catch {
        console.log(`[main] output does not exist, creating...`);
        await promises.mkdir(Config.outputDirectory);
    }

    const apis = JSON.parse((await promises.readFile(Config.inputDocument)).toString()) as Array<API>;

    for (let api of apis) {
        if (api.name.indexOf(".") < 0) {
            // not a regular API, passing
            continue;
        }

        // create result object for output
        const result = new Script();

        // generate
        await generator.callback()(api, result);

        // write result
        await promises.writeFile(
            join(Config.outputDirectory, `${api.name}.js`),
            `// ${JSON.stringify(api)}\n${result.getScript()}`);
    }
})();

