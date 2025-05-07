import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer/actionComposerUtils';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';
import {
    addressUtils,
    ProposalActionType as GukProposalActionType,
    IconType,
    type IProposalActionChangeMembers as IGukProposalActionChangeMembers,
    type IProposalActionChangeSettings as IGukProposalActionChangeSettings,
} from '@aragon/gov-ui-kit';
import { MultisigAddMembersAction } from '../../components/multisigProposalActions/multisigAddMembersAction';
import { MultisigRemoveMembersAction } from '../../components/multisigProposalActions/multisigRemoveMembersAction';
import { MultisigUpdateSettingsAction } from '../../components/multisigProposalActions/multisigUpdateSettingsAction';
import {
    MultisigProposalActionType,
    type IMultisigActionChangeMembers,
    type IMultisigActionChangeSettings,
    type IMultisigPluginSettings,
    type IMultisigProposalAction,
} from '../../types';
import { multisigSettingsUtils, type IMultisigSettingsParseParams } from '../multisigSettingsUtils';
import { defaultAddMembers, defaultRemoveMembers, defaultUpdateSettings } from './multisigActionDefinitions';

export interface IGetMultisigActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<IMultisigPluginSettings>;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export interface INormalizeChangeSettingsParams extends Omit<IMultisigSettingsParseParams, 'settings'> {
    /**
     * Action to be normalised.
     */
    action: IMultisigActionChangeSettings;
}

export type IGetMultisigActionsResult = IActionComposerPluginData<IDaoPlugin<IMultisigPluginSettings>>;

class MultisigActionUtils {
    getMultisigActions = ({ plugin, t }: IGetMultisigActionsProps): IGetMultisigActionsResult => {
        const { address } = plugin;

        // The setMetadata function on the Multisig plugin is only supported from version 1.3 onwards
        const minVersion = { build: 1, release: 3 };
        const includePluginMetadataAction = versionComparatorUtils.isGreaterOrEqualTo(plugin, minVersion);

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
                    id: `${address}-${MultisigProposalActionType.MULTISIG_ADD_MEMBERS}`,
                    name: t(`app.plugins.multisig.multisigActions.${MultisigProposalActionType.MULTISIG_ADD_MEMBERS}`),
                    icon: IconType.PLUS,
                    groupId: address,
                    defaultValue: { ...defaultAddMembers, to: address },
                },
                {
                    id: `${address}-${MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS}`,
                    name: t(
                        `app.plugins.multisig.multisigActions.${MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS}`,
                    ),
                    icon: IconType.MINUS,
                    groupId: address,
                    defaultValue: { ...defaultRemoveMembers, to: address },
                },
                {
                    id: `${address}-${MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS}`,
                    name: t(
                        `app.plugins.multisig.multisigActions.${MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS}`,
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
                [MultisigProposalActionType.MULTISIG_ADD_MEMBERS]: MultisigAddMembersAction,
                [MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS]: MultisigRemoveMembersAction,
                [MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS]: MultisigUpdateSettingsAction,
            },
        };
    };

    isChangeMembersAction = (
        action: IProposalAction | IMultisigProposalAction,
    ): action is IMultisigActionChangeMembers =>
        action.type === MultisigProposalActionType.MULTISIG_ADD_MEMBERS ||
        action.type === MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS;

    isChangeSettingsAction = (
        action: IProposalAction | IMultisigProposalAction,
    ): action is IMultisigActionChangeSettings => action.type === MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS;

    normalizeChangeMembersAction = (action: IMultisigActionChangeMembers): IGukProposalActionChangeMembers => {
        const { type, ...otherValues } = action;

        return { ...otherValues, type: GukProposalActionType.ADD_MEMBERS };
    };

    normalizeChangeSettingsAction = (params: INormalizeChangeSettingsParams): IGukProposalActionChangeSettings => {
        const { action, membersCount, t } = params;
        const { type, existingSettings, proposedSettings, ...otherValues } = action;

        const completeProposedSettings = { ...existingSettings, ...proposedSettings };

        const parsedExistingSettings = multisigSettingsUtils.parseSettings({
            membersCount,
            settings: existingSettings,
            t,
        });
        const parsedProposedSettings = multisigSettingsUtils.parseSettings({
            membersCount,
            settings: completeProposedSettings,
            t,
        });

        return {
            ...otherValues,
            type: GukProposalActionType.CHANGE_SETTINGS_MULTISIG,
            existingSettings: parsedExistingSettings,
            proposedSettings: parsedProposedSettings,
        };
    };
}

export const multisigActionUtils = new MultisigActionUtils();
