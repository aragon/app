import { useEffect, useRef } from 'react';

export interface IUseIntervalParams {
    /**
     * Callback to be executed on delay.
     */
    callback: () => void;
    /**
     * Delay between each execution (number in ms).
     */
    delay: number;
}

export const useInterval = (params: IUseIntervalParams) => {
    const { callback, delay } = params;

    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => {
            savedCallback.current?.();
        };

        const interval = setInterval(tick, delay);

        return () => clearInterval(interval);
    }, [delay]);
};
