import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer/actionComposerUtils';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
import { tokenSettingsUtils } from '../tokenSettingsUtils';
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

export interface INormalizeChangeSettingsParams {
    /**
     * Action to be normalised.
     */
    action: ITokenActionChangeSettings;
    /*
     * Translation function for internationalization.
     */
    t: TranslationFunction;
    /**
     * Token linked to the plugin.
     */
    token: ITokenPluginSettings['token'];
}

export type IGetTokenActionsResult = IActionComposerPluginData<IDaoPlugin<ITokenPluginSettings>>;

class TokenActionUtils {
    getTokenActions = ({ plugin, t }: IGetTokenActionsProps): IGetTokenActionsResult => {
        const { address, release, build, settings } = plugin;
        const { address: tokenAddress, name } = settings.token;

        // The setMetadata function on the TokenVoting plugin is only supported from version 1.3 onwards
        const includePluginMetadataItem = Number(release) > 1 || (Number(release) === 1 && Number(build) >= 3);

        return {
            groups: [
                {
                    id: tokenAddress,
                    name: name,
                    info: addressUtils.truncateAddress(tokenAddress),
                    indexData: [tokenAddress],
                },
                {
                    id: address,
                    name: daoUtils.getPluginName(plugin),
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: `${tokenAddress}-${TokenProposalActionType.MINT}`,
                    name: t(`app.plugins.token.tokenActions.${TokenProposalActionType.MINT}`),
                    icon: IconType.SETTINGS,
                    groupId: tokenAddress,
                    meta: plugin,
                    defaultValue: defaultMintAction(settings),
                },
                {
                    id: `${address}-${TokenProposalActionType.UPDATE_VOTE_SETTINGS}`,
                    name: t(`app.plugins.token.tokenActions.${TokenProposalActionType.UPDATE_VOTE_SETTINGS}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: defaultUpdateSettings(plugin),
                    meta: plugin,
                },
                {
                    ...actionComposerUtils.getDefaultActionPluginMetadataItem(plugin, t),
                    meta: plugin,
                    hidden: !includePluginMetadataItem,
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
        const { action, t, token } = params;
        const { type, proposedSettings, existingSettings, ...otherValues } = action;

        const completeExistingSettings = { ...existingSettings, token };
        const completeProposedSettings = { ...completeExistingSettings, ...proposedSettings };

        const parsedExistingSettings = tokenSettingsUtils.parseSettings({ settings: completeExistingSettings, t });
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
