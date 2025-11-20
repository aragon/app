'use client';

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

    const [locations, setLocations] = useState<IDialogLocation[]>([]);

    const updateOptions = useCallback((options?: Partial<IDialogLocationOptions>) => {
        setLocations((currentLocations) => {
            if (currentLocations.length === 0) {
                return currentLocations;
            }

            const updatedLocations = [...currentLocations];
            const lastIndex = updatedLocations.length - 1;
            updatedLocations[lastIndex] = { ...updatedLocations[lastIndex], ...options };

            return updatedLocations;
        });
    }, []);

    const open = useCallback(
        <TParams extends DialogComponentProps = DialogComponentProps>(
            id: string,
            options?: IDialogLocationOptions<TParams>,
        ) => {
            const { stack = false, ...restOptions } = options ?? {};

            setLocations((currentLocations) =>
                stack ? [...currentLocations, { id, ...restOptions }] : [{ id, ...restOptions }],
            );
        },
        [],
    );

    const close = useCallback((id?: string) => {
        setLocations((currentLocations) => {
            if (currentLocations.length === 0) {
                return currentLocations;
            }

            // If no ID provided, close all dialogs (backward compatibility)
            if (id == null) {
                return [];
            }

            // If ID provided, close that specific dialog
            const index = currentLocations.findIndex((loc) => loc.id === id);
            if (index === -1) {
                return currentLocations;
            }

            return [...currentLocations.slice(0, index), ...currentLocations.slice(index + 1)];
        });
    }, []);

    const contextValues = useMemo(
        () => ({ open, close, locations, updateOptions }),
        [open, close, updateOptions, locations],
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
