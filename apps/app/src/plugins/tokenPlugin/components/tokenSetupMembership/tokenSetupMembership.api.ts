import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginSetupMembershipParams } from '@/modules/createDao/types';
import type { IToken } from '@/modules/finance/api/financeService';
import type { ITokenPluginSettingsToken } from '../../types';

export interface ITokenSetupMembershipProps
    extends IPluginSetupMembershipParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenSetupMembershipForm
    extends ISetupBodyFormMembership<ITokenSetupMembershipMember> {
    /**
     * The token used by the plugin. `underlying` is carried over from the plugin settings for existing bodies (set
     * for wrapped / voting-escrow governance tokens) and is unset for tokens created or imported through the wizard.
     */
    token: Pick<
        IToken,
        'address' | 'name' | 'symbol' | 'totalSupply' | 'decimals'
    > &
        Partial<Pick<ITokenPluginSettingsToken, 'underlying'>>;
}

export interface ITokenSetupMembershipMember extends ICompositeAddress {
    /**
     * Token amount to be distributed.
     */
    tokenAmount?: string | number;
}
