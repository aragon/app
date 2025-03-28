import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';

export interface IMultisigSetupMembershipProps extends IPluginSetupMembershipParams {
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
    /**
     * Hides the field label and help-text when set to true.
     */
    hideLabel?: boolean;
}

export interface IMultisigSetupMembershipForm extends ISetupBodyFormMembership {}
