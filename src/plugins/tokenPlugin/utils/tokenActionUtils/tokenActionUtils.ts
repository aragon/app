import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IPluginActionComposerData } from '@/modules/governance/components/actionComposer';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { TokenMintTokensAction } from '../../components/tokenProposalActions/tokenMintTokensAction';
import type { ITokenPluginSettings } from '../../types';
import { defaultMintAction } from './tokenActionDefinitions';

export interface IGetTokenActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export type IGetTokenActionsResult = IPluginActionComposerData<IDaoPlugin<ITokenPluginSettings>>;

class TokenActionUtils {
    getTokenActions = ({ plugin, t }: IGetTokenActionsProps): IGetTokenActionsResult => {
        const { address } = plugin;

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
                    name: t(`app.plugins.token.tokenActions.${ProposalActionType.MINT}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    meta: plugin,
                    defaultValue: {
                        ...defaultMintAction,
                        to: address,
                    },
                },
            ],
            components: {
                [ProposalActionType.MINT]: TokenMintTokensAction,
            },
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
