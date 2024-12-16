import { useEffect, useRef, useState } from 'react';

export interface IUseDynamicValueParams<TResult> {
    callback: () => TResult;
    delay?: number;
    enabled?: boolean;
}

export const useDynamicValue = <TResult,>({
    callback,
    delay = 1000,
    enabled = true,
}: IUseDynamicValueParams<TResult>): TResult => {
    const [value, setValue] = useState<TResult>(() => callback());

    // Use ref to store the callback function to avoid unnecessary re-renders.
    // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
    const savedCallback = useRef(value);

    useEffect(() => {
        if (!enabled) {
            savedCallback.current = callback();
            return;
        }

        const tick = () => {
            const newValue = callback();
            savedCallback.current = newValue;
            setValue(newValue);
        };

        const interval = setInterval(tick, delay);
        return () => clearInterval(interval);
    }, [callback, delay, enabled]);

    return value;
};
