import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface IMultisigSetupMembershipProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * When true show a read only mode of the address field.
     */
    disabled?: boolean;
    /**
     * Callback to be used when the add button is clicked.
     */
    onAddClick?: () => void;
    /**
     * Optional custom validator function that extends the default validation
     */
    customValidator?: (member: ICompositeAddress) => string | boolean;
    /**
     * Address of the plugin
     */
    pluginAddress?: string;
}

export interface IMultisigSetupMembershipForm {
    /**
     * Members of the voting body.
     */
    members: ICompositeAddress[];
    /**
     * Amount of addresses in the authorized list that must approve a proposal for it to pass.
     */
    multisigThreshold: number;
}
