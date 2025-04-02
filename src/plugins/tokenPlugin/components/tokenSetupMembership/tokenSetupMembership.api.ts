import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';
import type { IToken } from '@/modules/finance/api/financeService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface ITokenSetupMembershipProps extends IPluginSetupMembershipParams {
    /**
     * ID of the DAO to fetch the members from.
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
