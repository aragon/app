import type { Network } from '@/shared/api/daoService';

export interface INetworkInputProps {
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * Label of the input. Defaults to the shared network-input label translation.
     */
    label?: string;
    /**
     * Help text to display above the input.
     */
    helpText?: string;
    /**
     * The prefix of the field in the form.
     */
    fieldPrefix?: string;
    /**
     * Optional default value to init the field with.
     * @default Network.ETHEREUM_SEPOLIA
     */
    defaultValue?: Network;
    /**
     * Callback called with the new network whenever the user selects a different one.
     */
    onValueChange?: (network: Network) => void;
}
