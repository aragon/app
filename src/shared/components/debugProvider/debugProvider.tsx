import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { IDebugContext, IDebugContextControl, IDebugContextProviderProps } from './debugProvider.api';

const debugContext = createContext<IDebugContext | null>(null);

export const DebugContextProvider: React.FC<IDebugContextProviderProps> = (props) => {
    const { children } = props;

    const [controls, setControls] = useState<IDebugContextControl[]>([]);
    const [values, setValues] = useState<Record<string, unknown>>({});

    const updateValue = useCallback(
        (name: string, value: unknown) => setValues((current) => ({ ...current, [name]: value })),
        [],
    );

    const registerControl = useCallback(
        (control: IDebugContextControl) => {
            if (control.value) {
                updateValue(control.name, control.value);
            }

            setControls((current) => {
                const alreadyRegistered = current.find(({ name }) => name === control.name);

                return alreadyRegistered ? current : current.concat(control);
            });
        },
        [updateValue],
    );

    const unregisterControl = useCallback(
        (controlName: string) => setControls((current) => current.filter(({ name }) => name != controlName)),
        [],
    );

    const contextValues = useMemo(
        () => ({ controls, registerControl, values, updateValue, unregisterControl }),
        [controls, registerControl, values, updateValue, unregisterControl],
    );

    return <debugContext.Provider value={contextValues}>{children}</debugContext.Provider>;
};

export const useDebugContext = () => {
    const values = useContext(debugContext);

    if (values == null) {
        throw new Error('useDebugContext: hook must be called inside a DebugContextProvider to work properly.');
    }

    return values;
};
