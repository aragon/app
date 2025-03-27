import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';

export interface IMultisigSetupGovernanceForm extends Pick<IMultisigPluginSettings, 'minApprovals' | 'onlyListed'> {}

export interface IMultisigSetupGovernanceProps extends IPluginSetupGovernanceParams {
    /**
     * Total number of members in the body of the DAO. It is a prop because it can either come from the API (actions) or
     * from the local members field (create process form).
     */
    membersCount: number;
}
