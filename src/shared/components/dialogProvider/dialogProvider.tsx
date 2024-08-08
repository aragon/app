import { ComponentType, createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface IActiveDialogDefinition<TParams extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * ID of the active dialog.
     */
    id: string;
    /**
     * Parameters passed to the active dialog.
     */
    params?: TParams;
}

export interface IOpenDialogOptions<TParams extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Parameters to be passed to the dialog to open.
     */
    params?: TParams;
}

export interface IDialogContext {
    /**
     * Definitions for the current active dialog.
     */
    active?: IActiveDialogDefinition;
    /**
     * Record of dialogs controlled by the application.
     */
    dialogs: ModuleDialogs;
    /**
     * Opens the specified dialog.
     */
    open: (id: string, options?: IOpenDialogOptions) => void;
    /**
     * Closes the current active dialog if there's one.
     */
    close: () => void;
}

const DialogContext = createContext<IDialogContext | null>(null);

export interface IDialogProviderProps {
    /**
     * Application modals to be controlled.
     */
    dialogs: ModuleDialogs;
    /**
     * Children of the context provider.
     */
    children?: ReactNode;
}

export interface IDialogComponentProps<TParams extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Definitions for the current active dialog.
     */
    definition: IActiveDialogDefinition<TParams>;
}

export type ModuleDialogs<TModuleDialog extends string = string> = Record<
    TModuleDialog,
    ComponentType<IDialogComponentProps>
>;

export const DialogProvider: React.FC<IDialogProviderProps> = (props) => {
    const { children, dialogs } = props;

    const [activeDialog, setActiveDialog] = useState<IActiveDialogDefinition>();

    const open = useCallback(
        <TParams extends Record<string, unknown> = Record<string, unknown>>(
            id: string,
            options?: IOpenDialogOptions<TParams>,
        ) => setActiveDialog({ id, params: options?.params }),
        [],
    );

    const close = useCallback(() => setActiveDialog(undefined), []);

    const contextValues = useMemo(
        () => ({ open, close, active: activeDialog, dialogs }),
        [open, close, activeDialog, dialogs],
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
