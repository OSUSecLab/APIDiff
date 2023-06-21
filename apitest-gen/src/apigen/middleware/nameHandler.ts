import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";

export const nameHandler = async (ctx: Context, next?: Middleware): Promise<Context> => {
    if (!ctx.source.hasDependencies) {
        ctx.destination.append(`${ctx.source.name}(`);
    } else {
        ctx.destination.append(`d.${ctx.source.name.split(".")[1]}(`);
    }

    if (next) await next(ctx);

    ctx.destination.append(`)`);
    return ctx;
}
