import type { IDialogAlertRootProps, IDialogRootProps } from '@aragon/gov-ui-kit';
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
    /**
     * If true, adds the dialog to the stack. If false (default), replaces all dialogs with this one.
     * Set to true for nested dialogs that should preserve parent dialog state.
     */
    stack?: boolean;
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
     * Stack of currently open dialogs. The last item is the topmost (active) dialog.
     */
    locations: IDialogLocation[];
    /**
     * The currently active (topmost) dialog location.
     */
    location?: IDialogLocation;
    /**
     * Opens the specified dialog.
     * @param id - The dialog ID to open
     * @param options - Dialog options
     * @example
     * // Replace all dialogs (default behavior)
     * open('MY_DIALOG', { params: { data } });
     *
     * @example
     * // Add to stack, preserving parent dialog state
     * open('CHILD_DIALOG', { params: { data }, stack: true });
     */
    open: (id: string, options?: IDialogLocationOptions) => void;
    /**
     * Closes dialogs.
     * @param id - Optional dialog ID to close. If not provided, closes all dialogs.
     * @example
     * // Close all dialogs
     * close();
     *
     * @example
     * // Close a specific dialog (removes it from stack)
     * close('SPECIFIC_DIALOG_ID');
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
    extends Pick<IDialogRootProps, 'hiddenTitle' | 'hiddenDescription' | 'useFocusTrap' | 'size'>,
        Pick<IDialogAlertRootProps, 'variant'> {
    /**
     * Component to be rendered.
     */
    Component: ComponentType<IDialogComponentProps<TParams>>;
}
