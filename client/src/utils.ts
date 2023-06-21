export const sleep = async (_t: number) => {
    return new Promise((res: Function, rej: Function) => {
        setTimeout(() => {
            res();
        }, _t);
    });
}
