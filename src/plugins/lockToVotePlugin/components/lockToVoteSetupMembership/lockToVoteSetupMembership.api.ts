import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';
import type { IToken } from '@/modules/finance/api/financeService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface ILockToVoteSetupMembershipProps extends IPluginSetupMembershipParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ILockToVoteSetupMembershipForm extends ISetupBodyFormMembership<ILockToVoteSetupMembershipMember> {
    /**
     * The token used by the plugin.
     */
    token: Pick<IToken, 'address' | 'name' | 'symbol' | 'totalSupply' | 'decimals'>;
}

export interface ILockToVoteSetupMembershipMember extends ICompositeAddress {
    /**
     * Token amount to be distributed.
     */
    tokenAmount?: string | number;
}
