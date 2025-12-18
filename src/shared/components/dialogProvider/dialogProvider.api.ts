import type { IDialogAlertRootProps, IDialogRootProps } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';

// Default properties type for dialog components.
//biome-ignore lint/suspicious/noExplicitAny: any is used to allow any type of props to be passed to the dialog components.
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
     * If true, adds the dialog onto the stack. If false (default), replaces
     * existing dialogs with the new one (as in the previous approach with 1 dialog).
     *
     * Set to true for nested dialogs that should preserve parent dialog state.
     */
    stack?: boolean;
}

export interface IDialogLocation<TParams extends DialogComponentProps = DialogComponentProps> extends IDialogLocationOptions<TParams> {
    /**
     * ID of the dialog.
     */
    id: string;
}

export interface IDialogContext {
    /**
     * Stack of currently open dialogs. The last item is the topmost (active) dialog.
     * Only active dialog is visible.
     */
    locations: IDialogLocation[];
    /**
     * Opens the specified dialog.
     *
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
     *
     * @example
     * // Close all dialogs on stack
     * close();
     *
     * @example
     * // Close a specific dialog (removes it from stack)
     * close('SPECIFIC_DIALOG_ID');
     */
    close: (id?: string) => void;
    /**
     * Updates the options for the current active dialog.
     *
     * @deprecated This method was mostly used to fix rough edges previous modal approach had. With the new approach there is no state reusing between modals. TODO: APP-358.
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
