import {
    addressUtils,
    ProposalActionType as GukProposalActionType,
    IconType,
    type IProposalActionChangeSettings as IGukProposalActionChangeSettings,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { ITokenProposalAction } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { LockToVoteUpdateSettingsAction } from '../../components/lockToVoteActions/lockToVoteUpdateSettingsAction';
import type {
    ILockToVoteActionChangeSettings,
    ILockToVotePluginSettings,
    ILockToVotePluginSettingsToken,
} from '../../types';
import { LockToVoteProposalActionType } from '../../types/enum';
import { lockToVoteSettingsUtils } from '../lockToVoteSettingsUtils';
import { defaultUpdateSettings } from './lockToVoteActionDefinitions';

export interface IGetLockToVoteActionProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<ILockToVotePluginSettings>;
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
    token: ILockToVotePluginSettingsToken;
}

export type IGetLockToVoteActionsResult = IActionComposerPluginData<
    IDaoPlugin<ILockToVotePluginSettings>
>;

class LockToVoteActionUtils {
    getLockToVoteActions = ({
        plugin,
        t,
    }: IGetLockToVoteActionProps): IGetLockToVoteActionsResult => {
        const { address, settings } = plugin;
        const { address: tokenAddress, name } = settings.token;

        return {
            groups: [
                {
                    id: tokenAddress,
                    name,
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
                    id: `${address}-${LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS}`,
                    name: t(
                        `app.plugins.lockToVote.lockToVoteActions.${LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS}`,
                    ),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: defaultUpdateSettings(plugin),
                    meta: plugin,
                },
                {
                    ...actionComposerUtils.getDefaultActionPluginMetadataItem(
                        plugin,
                        t,
                    ),
                    meta: plugin,
                },
            ],
            components: {
                [LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS]:
                    LockToVoteUpdateSettingsAction,
            },
        };
    };

    isChangeSettingsAction = (
        action: IProposalAction | ITokenProposalAction,
    ): action is ILockToVoteActionChangeSettings =>
        action.type === LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS;

    normalizeChangeSettingsAction = (
        params: INormalizeChangeSettingsParams,
    ): IGukProposalActionChangeSettings => {
        const { action, t, token } = params;
        const { type, proposedSettings, existingSettings, ...otherValues } =
            action;

        const completeExistingSettings = { ...existingSettings, token };
        const completeProposedSettings = {
            ...completeExistingSettings,
            ...proposedSettings,
        };

        const parsedExistingSettings = lockToVoteSettingsUtils.parseSettings({
            settings: completeExistingSettings,
            t,
        });
        const parsedProposedSettings = lockToVoteSettingsUtils.parseSettings({
            settings: completeProposedSettings,
            t,
        });

        return {
            ...otherValues,
            type: GukProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
            existingSettings: parsedExistingSettings,
            proposedSettings: parsedProposedSettings,
        };
    };
}

export const lockToVoteActionUtils = new LockToVoteActionUtils();
