import { useEffect, useRef, useState } from 'react';

export interface IUseRerenderParams<T> {
    /**
     * Callback to be executed on delay that returns a value of type T.
     */
    callback: () => T;
    /**
     * Delay between each execution (number in ms).
     */
    delay: number;
    /**
     * Initial value of type T
     */
    initialValue: T;
    /**
     * Boolean to determine if the interval should be enabled
     */
    enabled?: boolean;
}

export const useRerender = <T,>(params: IUseRerenderParams<T>): T => {
    const { callback, delay, initialValue, enabled = true } = params;

    const [value, setValue] = useState<T>(initialValue);

    const savedCallback = useRef<() => T>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const tick = () => {
            const result = savedCallback.current?.();

            if (result !== undefined) {
                setValue(result);
            }
        };

        const interval = setInterval(tick, delay);

        return () => clearInterval(interval);
    }, [delay, enabled]);

    return value;
};
