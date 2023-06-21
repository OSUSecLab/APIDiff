import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";

export const resultHandler = async (ctx: Context, next?: Middleware): Promise<Context> => {
    console.log(`got results: ${ctx.destination.getScript()}`);
    return next ? next(ctx) : ctx;
}
