/* eslint-disable @typescript-eslint/no-explicit-any */
const groupBy = (arr: any, callback: (...args: any) => string) => {
    return arr.reduce((acc: any = {}, ...args: any) => {
        const key = callback(...args);
        acc[key] ??= [];
        acc[key].push(args[0]);
        return acc;
    }, {});
};

if (typeof Object.groupBy === typeof undefined) {
    Object.groupBy = groupBy as any;
}
