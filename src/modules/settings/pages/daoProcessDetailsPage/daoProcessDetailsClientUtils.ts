'use client';

import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import {
    GovernanceType,
    type ICreateProcessFormData,
    type ICreateProcessFormDataAdvanced,
    ProcessPermission,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type {
    ISetupBodyFormExisting,
    ISetupBodyFormMembership,
} from '@/modules/createDao/dialogs/setupBodyDialog';
import { BodyType } from '@/modules/createDao/types/enum';
import type {
    ISppPluginSettings,
    ISppStagePlugin,
} from '@/plugins/sppPlugin/types';
import {
    type IDaoPlugin,
    type IPluginSettings,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IPluginToFormDataParams } from '../../types';

export class DaoProcessDetailsClientUtils {
    pluginToProcessFormData = (
        plugin: IDaoPlugin,
        allPlugins: IDaoPlugin[],
    ): ICreateProcessFormData => {
        const base = {
            name: daoUtils.getPluginName(plugin),
            resources: plugin.links ?? [],
            description: plugin.description ?? '',
            proposalCreationMode: ProposalCreationMode.ANY_WALLET,
            processKey: plugin.slug,
            permissions: ProcessPermission.ANY,
            permissionSelectors: [],
        };

        if (plugin.isBody && plugin.isProcess) {
            const body = this.bodyToFormData({
                plugin,
                membership: { members: [] },
            });

            return { governanceType: GovernanceType.BASIC, body, ...base };
        }

        const stages = this.sppSettingsToFormData(
            plugin.settings as ISppPluginSettings,
            allPlugins,
        );

        return { governanceType: GovernanceType.ADVANCED, stages, ...base };
    };

    bodyToFormDataDefault = <
        TSettings extends IPluginSettings,
        TMembership extends ISetupBodyFormMembership,
    >(
        params: IPluginToFormDataParams<TSettings, TMembership>,
    ): ISetupBodyFormExisting<TSettings, ICompositeAddress, TMembership> => {
        const { plugin, membership } = params;

        return {
            internalId: plugin.address,
            type: BodyType.EXISTING,
            plugin: plugin.interfaceType,
            address: plugin.address,
            name: daoUtils.getPluginName(plugin),
            description: plugin.description ?? '',
            resources: plugin.links ?? [],
            governance: plugin.settings,
            membership,
            release: plugin.release,
            build: plugin.build,
            canCreateProposal: true,
            proposalCreationConditionAddress:
                plugin.proposalCreationConditionAddress,
        };
    };

    bodyToFormData = <
        TSettings extends IPluginSettings,
        TMembership extends ISetupBodyFormMembership,
    >(
        params: IPluginToFormDataParams<TSettings, TMembership>,
    ): ISetupBodyFormExisting<TSettings, ICompositeAddress, TMembership> => {
        const { plugin } = params;

        const pluginFunction = pluginRegistryUtils.getSlotFunction<
            IPluginToFormDataParams<TSettings, TMembership>,
            ISetupBodyFormExisting<TSettings, ICompositeAddress, TMembership>
        >({
            slotId: SettingsSlotId.SETTINGS_PLUGIN_TO_FORM_DATA,
            pluginId: plugin.interfaceType,
        });

        return pluginFunction != null
            ? pluginFunction(params)
            : this.bodyToFormDataDefault(params);
    };

    private sppSettingsToFormData = (
        settings: ISppPluginSettings,
        allPlugins: IDaoPlugin[],
    ): ICreateProcessFormDataAdvanced['stages'] =>
        settings.stages.map((stage) => {
            const bodies = stage.plugins.map((plugin) =>
                this.bodyToFormData({
                    plugin: this.sppBodyToFormData(plugin, allPlugins),
                    membership: { members: [] },
                }),
            );

            return {
                internalId: stage.stageIndex.toString(),
                id: stage.stageIndex.toString(),
                name: stage.name ?? '',
                settings: {
                    type:
                        stage.vetoThreshold > 0
                            ? ProcessStageType.OPTIMISTIC
                            : ProcessStageType.NORMAL,
                    votingPeriod: dateUtils.secondsToDuration(
                        stage.voteDuration,
                    ),
                    earlyStageAdvance: stage.minAdvance === 0,
                    requiredApprovals:
                        stage.approvalThreshold > 0
                            ? stage.approvalThreshold
                            : stage.vetoThreshold,
                    stageExpiration:
                        stage.maxAdvance !== 3_155_760_000
                            ? dateUtils.secondsToDuration(
                                  stage.maxAdvance - stage.voteDuration,
                              )
                            : undefined,
                },
                bodies,
            };
        });

    private sppBodyToFormData<T extends IPluginSettings>(
        stagePlugin: ISppStagePlugin,
        allPlugins: IDaoPlugin[],
    ): IDaoPlugin<T> {
        const plugin = allPlugins.find(
            ({ address }) => address === stagePlugin.address,
        ) as IDaoPlugin<T> | undefined;

        return {
            ...stagePlugin,
            isBody: true,
            isProcess: false,
            isSubPlugin: true,
            release: plugin?.release ?? '',
            build: plugin?.build ?? '',
            slug: plugin?.slug ?? '',
            settings: plugin?.settings as T,
            name: plugin?.name,
            description: plugin?.description,
            links: plugin?.links ?? [],
            subdomain: plugin?.subdomain ?? '',
            interfaceType: plugin?.interfaceType ?? PluginInterfaceType.UNKNOWN,
            address: plugin?.address ?? stagePlugin.address,
            blockTimestamp: plugin?.blockTimestamp ?? 0,
            transactionHash: plugin?.transactionHash ?? '',
            proposalCreationConditionAddress:
                plugin?.proposalCreationConditionAddress,
        };
    }
}

export const daoProcessDetailsClientUtils = new DaoProcessDetailsClientUtils();
