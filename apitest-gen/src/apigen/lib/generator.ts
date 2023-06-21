import {Context} from "./context";
import {API} from "../../model/API";
import {EventEmitter} from "events";
import debug from 'debug';
import {Script} from "../../model/Script";

export type Middleware = (ctx: Context, next?: Middleware) => Promise<Context>;

export class Generator extends EventEmitter {
    middlewares: Array<Middleware>;
    logger: debug.Debugger;

    constructor() {
        super();
        this.middlewares = new Array<Middleware>();
        this.logger = debug("generator:main");
    }

    use (func: Middleware): Generator {
        this.middlewares.push(func);
        return this;
    }

    createContext (source: API, destination: Script): Context {
        const context = new Context();
        context.generator = this;
        context.source = source;
        context.destination = destination;
        return context;
    }

    callback () {
        const func = this.compose(this.middlewares);
        return (source: API, dest: Script) => {
            const ctx = this.createContext(source, dest);
            return this.handleSource(ctx, func)
        };
    }

    handleSource (ctx: Context, func: Middleware) {
        return func(ctx).then(this.onResult.bind(this)).catch(this.onError.bind(this));
    }

    onResult (ctx: Context) {
        this.logger(`got final results: ${ctx.destination}`);
    }

    onError (err: Error) {
        const msg = err.stack || err.toString();
        this.logger(err);
        console.error(`\n${msg.replace(/^/gm, '  ')}\n`);
    }

    compose (middlewares: Array<Middleware>) {
        return (context: Context, next?: Middleware) => {
            let index = -1;
            return dispatch(0)
            function dispatch (i: number): Promise<Context> {
                if (i < index) {
                    return Promise.reject(new Error(`next() called multiple times`));
                }

                index = i;
                let func: Middleware | undefined = middlewares[i];
                if (i === middlewares.length) {
                    func = next;
                }
                if (!func) {
                    return Promise.resolve(context);
                }

                try {
                    return Promise.resolve(func(context, dispatch.bind(null, i + 1)));
                } catch (err) {
                    return Promise.reject(err);
                }
            }
        }
    }

}
