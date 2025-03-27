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
     * Address of the plugin, used to validate if the entered user address is already a member of the plugin.
     */
    pluginAddress?: string;
}

export interface IMultisigSetupMembershipForm {
    /**
     * Members of the voting body.
     */
    members: ICompositeAddress[];
}
