import { type ReactNode } from 'react';

export interface IDebugContextControl {
    /**
     * Control type used to define the component to be rendered.
     */
    type: 'boolean' | 'string';
    /**
     * Name of the control.
     */
    name: string;
    /**
     * Label of the control.
     */
    label: string;
    /**
     * Initial value for the control.
     */
    value?: unknown;
    /**
     * Group of the control.
     */
    group?: string;
}

export interface IDebugContext {
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
    values: Record<string, unknown>;
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
