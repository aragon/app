import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IPluginActionComposerData } from '@/modules/governance/components/actionComposer';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    ProposalActionType as GukProposalActionType,
    IconType,
    type IProposalActionChangeSettings as IGukProposalActionChangeSettings,
    type IProposalActionTokenMint as IGukProposalActionTokenMint,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { TokenMintTokensAction } from '../../components/tokenProposalActions/tokenMintTokensAction';
import { TokenUpdateSettingsAction } from '../../components/tokenProposalActions/tokenUpdateSettingsAction';
import {
    TokenProposalActionType,
    type ITokenActionChangeSettings,
    type ITokenActionTokenMint,
    type ITokenPluginSettings,
} from '../../types';
import type { ITokenProposalAction } from '../../types/tokenProposalAction';
import { tokenSettingsUtils, type IParseTokenSettingsParams } from '../tokenSettingsUtils';
import { defaultMintAction, defaultUpdateSettings } from './tokenActionDefinitions';

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

export interface INormalizeChangeSettingsParams extends IParseTokenSettingsParams {
    /**
     * Action to be normalised.
     */
    action: ITokenActionChangeSettings;
}

export type IGetTokenActionsResult = IPluginActionComposerData<
    IDaoPlugin<ITokenPluginSettings>,
    TokenProposalActionType
>;

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
                    id: `${address}-${TokenProposalActionType.MINT}`,
                    name: t(`app.plugins.token.tokenActions.${TokenProposalActionType.MINT}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    meta: plugin,
                    defaultValue: { ...defaultMintAction, to: address },
                },
                {
                    id: `${address}-${TokenProposalActionType.UPDATE_VOTE_SETTINGS}`,
                    name: t(`app.plugins.token.tokenActions.${TokenProposalActionType.UPDATE_VOTE_SETTINGS}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: { ...defaultUpdateSettings(plugin.settings), to: plugin.address },
                    meta: plugin,
                },
            ],
            components: {
                [TokenProposalActionType.UPDATE_VOTE_SETTINGS]: TokenUpdateSettingsAction,
                [TokenProposalActionType.MINT]: TokenMintTokensAction,
            },
        };
    };

    isChangeSettingsAction = (action: IProposalAction | ITokenProposalAction): action is ITokenActionChangeSettings =>
        action.type === TokenProposalActionType.UPDATE_VOTE_SETTINGS;

    isTokenMintAction = (action: IProposalAction | ITokenProposalAction): action is ITokenActionTokenMint => {
        return action.type === TokenProposalActionType.MINT;
    };

    normalizeTokenMintAction = (action: ITokenActionTokenMint): IGukProposalActionTokenMint => {
        const { token, receivers, ...otherValues } = action;
        const { currentBalance, newBalance, ...otherReceiverValues } = receivers;

        return {
            ...otherValues,
            type: GukProposalActionType.TOKEN_MINT,
            tokenSymbol: token.symbol,
            receiver: {
                ...otherReceiverValues,
                currentBalance: formatUnits(BigInt(currentBalance), token.decimals),
                newBalance: formatUnits(BigInt(newBalance), token.decimals),
            },
        };
    };

    normalizeChangeSettingsAction = (params: INormalizeChangeSettingsParams): IGukProposalActionChangeSettings => {
        const { action, t, settings } = params;
        const { type, proposedSettings, ...otherValues } = action;

        const completeProposedSettings = { ...settings, ...proposedSettings };

        const parsedExistingSettings = tokenSettingsUtils.parseSettings({ settings, t });
        const parsedProposedSettings = tokenSettingsUtils.parseSettings({ settings: completeProposedSettings, t });

        return {
            ...otherValues,
            type: GukProposalActionType.CHANGE_SETTINGS_MULTISIG,
            existingSettings: parsedExistingSettings,
            proposedSettings: parsedProposedSettings,
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
