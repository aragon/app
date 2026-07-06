export type NestedOmit<T, K extends PropertyKey> = {
    [P in keyof T as P extends K ? never : P]: NestedOmit<
        T[P],
        K extends `${Exclude<P, symbol>}.${infer R}` ? R : never
    >;
};
