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
    /**
     * Boolean to determine if the interval should be enabled
     */
    enabled?: boolean;
}

export const useInterval = (params: IUseIntervalParams) => {
    const { callback, delay, enabled = true } = params;

    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const tick = () => {
            savedCallback.current?.();
        };

        const interval = setInterval(tick, delay);

        return () => clearInterval(interval);
    }, [delay, enabled]);
};
