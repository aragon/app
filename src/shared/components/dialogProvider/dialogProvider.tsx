import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DialogComponentProps, IDialogContext, IDialogLocation, IOpenDialogOptions } from './dialogProvider.api';

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

    const open = useCallback(
        <TParams extends DialogComponentProps = DialogComponentProps>(
            id: string,
            options?: IOpenDialogOptions<TParams>,
        ) => setLocation({ id, params: options?.params }),
        [],
    );

    const close = useCallback(() => setLocation(undefined), []);

    const contextValues = useMemo(() => ({ open, close, location }), [open, close, location]);

    return <DialogContext.Provider value={contextValues}>{children}</DialogContext.Provider>;
};

export const useDialogContext = () => {
    const values = useContext(DialogContext);

    if (values == null) {
        throw new Error('useDialogContext: hook must be used inside a DialogContextProvider to work properly.');
    }

    return values;
};
