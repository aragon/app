import { useEffect, useState } from 'react';

export interface IUseDynamicValueParams<TResult> {
    /**
     * Callback to be executed on delay that returns a value of type T.
     */
    callback: () => TResult;
    /**
     * Delay between each execution (number in ms).
     * @default 1000
     */
    delay?: number;
    /**
     * Boolean to determine if the interval should be enabled.
     * @default true
     */
    enabled?: boolean;
}

export const useDynamicValue = <TResult,>(params: IUseDynamicValueParams<TResult>): TResult => {
    const { callback, delay = 1000, enabled = true } = params;

    const [value, setValue] = useState<TResult>(callback());

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const tick = () => setValue(callback());
        const interval = setInterval(tick, delay);

        return () => clearInterval(interval);
    }, [delay, enabled, callback]);

    return value;
};
