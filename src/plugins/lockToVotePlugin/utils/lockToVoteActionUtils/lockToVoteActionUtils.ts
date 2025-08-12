import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import {
    type ITokenActionTokenMint,
    type ITokenPluginSettings,
    type ITokenProposalAction,
} from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';
import {
    addressUtils,
    ProposalActionType as GukProposalActionType,
    IconType,
    type IProposalActionChangeSettings as IGukProposalActionChangeSettings,
    type IProposalActionTokenMint as IGukProposalActionTokenMint,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { LockToVoteUpdateSettingsAction } from '../../components/lockToVoteActions/lockToVoteUpdateSettingsAction';
import { LockToVoteProposalActionType } from '../../types/enums';
import type { ILockToVoteActionChangeSettings } from '../../types/lockToVoteActionChangeSettings';
import { defaultUpdateSettings } from './lockToVoteActionDefinitions';

export interface IGetLockToVoteActionProps {
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
    action: ILockToVoteActionChangeSettings;
    /*
     * Translation function for internationalization.
     */
    t: TranslationFunction;
    /**
     * Token linked to the plugin.
     */
    token: ITokenPluginSettings['token'];
}

export type IGetLockToVoteActionsResult = IActionComposerPluginData<IDaoPlugin<ITokenPluginSettings>>;

class LockToVoteActionUtils {
    getLockToVoteActions = ({ plugin, t }: IGetLockToVoteActionProps): IGetLockToVoteActionsResult => {
        const { address, settings } = plugin;
        const { address: tokenAddress, name } = settings.token;

        const minVersion = { release: 1, build: 1 };
        const includePluginMetadataAction = versionComparatorUtils.isGreaterOrEqualTo(plugin, minVersion);

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
                    id: `${address}-${LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS}`,
                    name: t(
                        `app.plugins.lockToVote.lockToVoteActions.${LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS}`,
                    ),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: defaultUpdateSettings(plugin),
                    meta: plugin,
                },
                {
                    ...actionComposerUtils.getDefaultActionPluginMetadataItem(plugin, t),
                    meta: plugin,
                    hidden: !includePluginMetadataAction,
                },
            ],
            components: {
                [LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS]: LockToVoteUpdateSettingsAction,
            },
        };
    };

    isChangeSettingsAction = (
        action: IProposalAction | ITokenProposalAction,
    ): action is ILockToVoteActionChangeSettings =>
        action.type === LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS;

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

export const lockToVoteActionUtils = new LockToVoteActionUtils();
