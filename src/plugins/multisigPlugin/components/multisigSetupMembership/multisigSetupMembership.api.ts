import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';
import type { Network } from '@/shared/api/daoService';

export interface IMultisigSetupMembershipProps
    extends IPluginSetupMembershipParams {
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
     * Network of the plugin.
     */
    network?: Network;
    /**
     * ID of the DAO, used to derive the chain when the plugin network is not provided.
     */
    daoId?: string;
    /**
     * Whether to show the "Reset all" option in the more actions menu.
     */
    showResetAllAction?: boolean;
}

export interface IMultisigSetupMembershipForm
    extends ISetupBodyFormMembership {}
