import type { IDialogRootProps } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';

// Default properties type for dialog components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DialogComponentProps = any;

export interface IDialogLocationOptions<TParams extends DialogComponentProps = DialogComponentProps> {
    /**
     * Parameters to be passed to the dialog to open.
     */
    params?: TParams;
    /**
     * Disables closing the dialog when clicking outside when set to true.
     */
    disableOutsideClick?: boolean;
    /**
     * Callback triggered instead of the default close function.
     */
    onClose?: () => void;
    modal?: boolean;
}

export interface IDialogLocation<TParams extends DialogComponentProps = DialogComponentProps>
    extends IDialogLocationOptions<TParams> {
    /**
     * ID of the dialog.
     */
    id: string;
}

export interface IDialogContext {
    /**
     * Definitions for the current active dialog.
     */
    location?: IDialogLocation;
    /**
     * Opens the specified dialog.
     */
    open: (id: string, options?: IDialogLocationOptions) => void;
    /**
     * Closes the current active dialog if there's one.
     */
    close: (id?: string) => void;
    /**
     * Updates the options for the current active dialog.
     */
    updateOptions: (options: Partial<IDialogLocationOptions>) => void;
}

export interface IDialogComponentProps<TParams extends DialogComponentProps = DialogComponentProps> {
    /**
     * Definitions specific to the dialog.
     */
    location: IDialogLocation<TParams>;
}

export interface IDialogComponentDefinitions<TParams extends DialogComponentProps = DialogComponentProps>
    extends Pick<IDialogRootProps, 'hiddenTitle' | 'hiddenDescription' | 'useFocusTrap' | 'size'> {
    /**
     * Component to be rendered.
     */
    Component: ComponentType<IDialogComponentProps<TParams>>;
}
