import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
    DialogComponentProps,
    IDialogContext,
    IDialogLocation,
    IDialogLocationOptions,
} from './dialogProvider.api';

export interface IDialogProviderProps {
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

export const DialogContext = createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC<IDialogProviderProps> = (props) => {
    const { children } = props;

    const [location, setLocation] = useState<IDialogLocation>();

    const updateOptions = useCallback((options?: Partial<IDialogLocationOptions>) => {
        setLocation((currentLocation) => (currentLocation != null ? { ...currentLocation, ...options } : undefined));
    }, []);

    const open = useCallback(
        <TParams extends DialogComponentProps = DialogComponentProps>(
            id: string,
            options?: IDialogLocationOptions<TParams>,
        ) => setLocation({ id, ...options }),
        [],
    );

    const close = useCallback(
        (id?: string) =>
            setLocation((currentLocation) => (id != null && currentLocation?.id != id ? currentLocation : undefined)),
        [],
    );

    const contextValues = useMemo(
        () => ({ open, close, location, updateOptions }),
        [open, close, updateOptions, location],
    );

    return <DialogContext.Provider value={contextValues}>{children}</DialogContext.Provider>;
};

export const useDialogContext = () => {
    const values = useContext(DialogContext);

    if (values == null) {
        throw new Error('useDialogContext: hook must be used inside a DialogContextProvider to work properly.');
    }

    return values;
};
