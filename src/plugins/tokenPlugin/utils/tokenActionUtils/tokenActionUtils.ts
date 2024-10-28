import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { defaultMintAction } from '@/modules/governance/components/actionComposer/actionComposerDefinitions';
import { type IPluginActionData } from '@/modules/governance/components/createProposalForm/createProposalFormActions/createProposalFormActions';
import { MintAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/mintAction';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';

export interface IUseTokenActionParams {
    /**
     * The DAO.
     */
    dao: IDao;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class TokenActionUtils {
    getTokenActions = ({ address, name, subdomain }: IDaoPlugin): IPluginActionData => {
        return {
            groups: [
                {
                    id: 'token plugin',
                    name: name ?? subdomain,
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: ProposalActionType.TOKEN_MINT,
                    name: 'MINT',
                    icon: IconType.SETTINGS,
                    groupId: name ?? subdomain,
                    defaultValue: defaultMintAction,
                },
            ],
            components: {
                [ProposalActionType.TOKEN_MINT]: MintAction,
            },
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
