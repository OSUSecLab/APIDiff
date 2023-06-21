import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";


export const wrapperHandler = async (ctx: Context, next?: Middleware): Promise<Context> => {
    if (!ctx.source.hasDependencies) {
        if (ctx.source.type === "ASYNC") {
            ctx.destination.prepend(`(() => { `);
        } else {
            ctx.destination.prepend(`(() => { let result = `);
        }
    } else {
        const objectMember = ctx.source.name.split(".")[1];
        ctx.destination.prepend(
            `(() => { Promise.all(${generateDependencies(ctx)}).then((dep) => { for (let d of dep) { if (d !== undefined && ${objectMember} in d) { globalThis.resultSet["::UUID::"] = `);
    }

    if (next !== undefined) { await next(ctx); }

    if (!ctx.source.hasDependencies) {
        if (ctx.source.type === "ASYNC") {
            ctx.destination.append(` })()`);
        } else {
            ctx.destination.append(`; return result; })()`);
        }
    } else {
        ctx.destination.append(`; } } } ) } )()`);
    }
    return ctx;
}

const generateDependencies = (ctx: Context): string => {
    const generator = ctx.generator;



    return "1";
}

