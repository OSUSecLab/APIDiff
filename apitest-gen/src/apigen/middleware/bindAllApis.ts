import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";
import {Config} from "../config";
import {promises} from "fs";
import {API} from "../../model/API";


export const bindAllApis = async (ctx: Context, next?: Middleware): Promise<Context> => {
    // for dependencies resolution
    const apis = JSON.parse((await promises.readFile(Config.inputDocument)).toString()) as Array<API>;
    ctx.bindAllApis(apis);

    if (next) await next(ctx);

    return ctx;
}
