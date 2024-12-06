import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IPluginActionComposerData } from '@/modules/governance/components/actionComposer';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
import {
    defaultAddMembers,
    defaultRemoveMembers,
    defaultUpdateMetadata,
    defaultUpdateSettings,
} from './multisigActionDefinitions';
import { MultisigUpdatePluginMetadataAction } from '../../components/multisigProposalActions/multisigUpdateMetadataAction';

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

export interface INormalizeChangeSettingsParams extends IMultisigSettingsParseParams {
    /**
     * Action to be normalised.
     */
    action: IMultisigActionChangeSettings;
}

export type IGetMultisigActionsResult = IPluginActionComposerData<
    IDaoPlugin<IMultisigPluginSettings>,
    MultisigProposalActionType
>;

class MultisigActionUtils {
    getMultisigActions = ({ plugin, t }: IGetMultisigActionsProps): IGetMultisigActionsResult => {
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
                    defaultValue: { ...defaultUpdateSettings(plugin.settings), to: address },
                },
                {
                    id: `${address}-${MultisigProposalActionType.UPDATE_PLUGIN_METADATA}`,
                    name: t(
                        `app.plugins.multisig.multisigActions.${MultisigProposalActionType.UPDATE_PLUGIN_METADATA}`,
                    ),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: {
                        ...defaultUpdateMetadata({
                            name: plugin.name ?? '',
                            summary: plugin.description,
                            resources: plugin.links,
                            key: plugin.processKey,
                        }),
                        to: address,
                    },
                    meta: plugin,
                },
            ],
            components: {
                [MultisigProposalActionType.MULTISIG_ADD_MEMBERS]: MultisigAddMembersAction,
                [MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS]: MultisigRemoveMembersAction,
                [MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS]: MultisigUpdateSettingsAction,
                [MultisigProposalActionType.UPDATE_PLUGIN_METADATA]: MultisigUpdatePluginMetadataAction,
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
        const { action, membersCount, t, settings } = params;
        const { type, proposedSettings, ...otherValues } = action;

        const completeProposedSettings = { ...settings, ...proposedSettings };

        const parsedExistingSettings = multisigSettingsUtils.parseSettings({ membersCount, settings, t });
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
