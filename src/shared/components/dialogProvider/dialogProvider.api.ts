import type { ComponentType } from 'react';

// Default properties type for dialog components.
export type DialogComponentProps = Record<string, unknown>;

export interface IDialogLocation<TParams extends DialogComponentProps = DialogComponentProps> {
    /**
     * ID of the dialog.
     */
    id: string;
    /**
     * Parameters passed to the dialog.
     */
    params?: TParams;
}

export interface IOpenDialogOptions<TParams extends DialogComponentProps = DialogComponentProps> {
    /**
     * Parameters to be passed to the dialog to open.
     */
    params?: TParams;
}

export interface IDialogContext {
    /**
     * Definitions for the current active dialog.
     */
    location?: IDialogLocation;
    /**
     * Opens the specified dialog.
     */
    open: (id: string, options?: IOpenDialogOptions) => void;
    /**
     * Closes the current active dialog if there's one.
     */
    close: () => void;
}

export interface IDialogComponentProps<TParams extends DialogComponentProps = DialogComponentProps> {
    /**
     * Definitions specific to the dialog.
     */
    location: IDialogLocation<TParams>;
}

export interface IDialogComponentDefinitions {
    /**
     * Component to be rendered.
     */
    Component: ComponentType<IDialogComponentProps>;
    /**
     * Optional hidden title for screen readers, usually used for Dialogs without a Dialog.Header component.
     */
    title?: string;
    /**
     * Optional hidden description for screen readers, usually used for Dialogs without a description on the relative
     * Dialog.Header component.
     */
    description?: string;
}
