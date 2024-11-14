import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IPluginActionComposerData } from '@/modules/governance/components/actionComposer';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { TokenMintTokensAction } from '../../components/tokenProposalActions/tokenMintTokensAction';
import type { ITokenPluginSettings } from '../../types';
import { defaultMintAction, defaultUpdateSettings } from './tokenActionDefinitions';
import { TokenUpdateSettingsAction } from '../../components/tokenProposalActions/tokenUpdateSettingsAction';

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
        const { address, name } = plugin.settings.token;

        return {
            groups: [
                {
                    id: address,
                    name: name,
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
                    defaultValue: { ...defaultMintAction, to: address },
                },
                {
                    id: ProposalActionType.UPDATE_VOTE_SETTINGS,
                    name: t(`app.plugins.token.tokenActions.${ProposalActionType.UPDATE_VOTE_SETTINGS}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: { ...defaultUpdateSettings(plugin.settings), to: address },
                    meta: plugin,
                },
            ],
            components: {
                [ProposalActionType.MINT]: TokenMintTokensAction,
                [ProposalActionType.UPDATE_VOTE_SETTINGS]: TokenUpdateSettingsAction,
            },
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
