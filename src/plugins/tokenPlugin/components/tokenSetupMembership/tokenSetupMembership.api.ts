import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';
import type { IToken } from '@/modules/finance/api/financeService';

export interface ITokenSetupMembershipProps extends IPluginSetupMembershipParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenSetupMembershipForm extends ISetupBodyFormMembership<ITokenSetupMembershipMember> {
    /**
     * The token used by the plugin.
     */
    token: Pick<IToken, 'address' | 'name' | 'symbol' | 'totalSupply' | 'decimals'>;
}

export interface ITokenSetupMembershipMember extends ICompositeAddress {
    /**
     * Token amount to be distributed.
     */
    tokenAmount?: string | number;
}
