import type { ReactNode } from 'react';

export type DebugContextValues = Record<string, unknown>;

export interface IDebugContextControlOption {
    /**
     * Label of the option.
     */
    label: string;
    /**
     * Value of the option.
     */
    value: string;
}

export interface IDebugContextControl {
    /**
     * Control type used to define the component to be rendered.
     */
    type: 'boolean' | 'string' | 'address' | 'select';
    /**
     * Name of the control.
     */
    name: string;
    /**
     * Label of the control.
     */
    label: string;
    /**
     * Optional description rendered below the control.
     */
    description?: string;
    /**
     * Options of a `select` control.
     */
    options?: IDebugContextControlOption[];
    /**
     * Initial value for the control.
     */
    value?: unknown;
    /**
     * Group of the control.
     */
    group?: string;
    /**
     * Callback called on value change.
     */
    onChange?: (value: unknown) => void;
}

export interface IDebugContext<
    TValues extends DebugContextValues = DebugContextValues,
> {
    /**
     * Debug controls of the app.
     */
    controls: IDebugContextControl[];
    /**
     * Registers a control to the debug context.
     */
    registerControl: (control: IDebugContextControl) => void;
    /**
     * Unregisters a control.
     */
    unregisterControl: (controlName: string) => void;
    /**
     * Current debug values.
     */
    values: TValues;
    /**
     * Updates the value of the specified control.
     */
    updateValue: (name: string, value: unknown) => void;
}

export interface IDebugContextProviderProps {
    /**
     * Children of the context provider.
     */
    children: ReactNode;
}
