import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";

export const postHandler = async (ctx: Context, next?: Middleware): Promise<Context> => {
    if(next) await next(ctx);

    if (ctx.destination.getScript().indexOf(`"(e) =>`) > 0) {
        ctx.destination.setScript(ctx.destination.script.replaceAll(`"(e) => {globalThis.resultSet[\\"::UUID::\\"] = e;}"`,
            `(e) => {globalThis.resultSet["::UUID::"] = e;}`))
    }
    return ctx;
}
