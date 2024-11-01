import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IPluginActionData } from '@/modules/governance/components/createProposalForm/createProposalFormActions/createProposalFormActions.api';
import { MintTokensAction } from '@/plugins/tokenPlugin/components/tokenProposalActions/mintTokensAction';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { defaultMintAction } from '../../constants/tokenActionComposerDefinitions';
import type { ITokenPluginSettings } from '../../types';

interface IGetTokenActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class TokenActionUtils {
    getTokenActions = ({ plugin, t }: IGetTokenActionsProps): IPluginActionData => {
        const { address, name, subdomain } = plugin;

        return {
            groups: [
                {
                    id: address,
                    name: daoUtils.getPluginName(plugin),
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: ProposalActionType.MINT,
                    name: t(`app.plugins.token.actionComposer.action.${ProposalActionType.MINT}`),
                    icon: IconType.SETTINGS,
                    groupId: name ?? subdomain,
                    defaultValue: defaultMintAction,
                },
            ],
            components: {
                [ProposalActionType.MINT]: MintTokensAction,
            },
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
