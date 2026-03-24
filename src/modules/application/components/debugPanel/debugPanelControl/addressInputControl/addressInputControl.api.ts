import type { IDebugContextControl } from '@/shared/components/debugProvider';

export interface IAddressInputControlProps {
    /**
     * Label of the address input.
     */
    label: string;
    /**
     * Name of the debug control, used to read and update the context value.
     */
    name: string;
    /**
     * Callback called when the address is resolved.
     */
    onChange?: IDebugContextControl['onChange'];
}
