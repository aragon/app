'use client';

import {
    GovernanceType,
    ProcessPermission,
    ProcessStageType,
    ProposalCreationMode,
    type ICreateProcessFormData,
    type ICreateProcessFormDataAdvanced,
} from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyFormExisting, ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import { SetupBodyType } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { ISppPluginSettings, ISppStagePlugin } from '@/plugins/sppPlugin/types';
import { PluginInterfaceType, type IDaoPlugin, type IPluginSettings } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IPluginToFormDataParams } from '../../types';

export class DaoProcessDetailsClientUtils {
    pluginToProcessFormData = (plugin: IDaoPlugin, allPlugins: IDaoPlugin[]): ICreateProcessFormData => {
        const base = {
            name: daoUtils.getPluginName(plugin),
            resources: plugin.links ?? [],
            description: plugin.description ?? '',
            proposalCreationMode: ProposalCreationMode.ANY_WALLET,
            processKey: plugin.slug,
            pluginAddress: plugin.address,
        };

        if (plugin.isBody && plugin.isProcess) {
            const body = this.bodyToFormData({ plugin, membership: { members: [] } });
            return {
                governanceType: GovernanceType.BASIC,
                body,
                permissions: ProcessPermission.ANY,
                permissionSelectors: [],
                ...base,
            };
        }

        return {
            governanceType: GovernanceType.ADVANCED,
            stages: this.sppSettingsToFormData(plugin.settings as ISppPluginSettings, allPlugins),
            permissions: ProcessPermission.ANY,
            permissionSelectors: [],
            ...base,
        };
    };

    public bodyToFormDataDefault = <
        TSettings extends IPluginSettings,
        TMembership extends ISetupBodyFormMembership,
    >(params: {
        plugin: IDaoPlugin<TSettings>;
        membership: TMembership;
    }): ISetupBodyFormExisting<TSettings, ICompositeAddress, TMembership> => {
        const { plugin, membership } = params;
        return {
            internalId: crypto.randomUUID(),
            type: SetupBodyType.EXISTING,
            plugin: plugin.interfaceType,
            address: plugin.address,
            name: daoUtils.getPluginName(plugin),
            description: plugin.description ?? '',
            resources: plugin.links ?? [],
            governance: plugin.settings,
            membership,
            canCreateProposal: false,
        };
    };

    public bodyToFormData = <TSettings extends IPluginSettings, TMembership extends ISetupBodyFormMembership>(
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

        return pluginFunction != null ? pluginFunction(params) : this.bodyToFormDataDefault(params);
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
                internalId: crypto.randomUUID(),
                id: crypto.randomUUID(),
                name: stage.name ?? '',
                settings: {
                    type: stage.vetoThreshold > 0 ? ProcessStageType.OPTIMISTIC : ProcessStageType.NORMAL,
                    votingPeriod: dateUtils.secondsToDuration(stage.voteDuration),
                    earlyStageAdvance: stage.minAdvance === 0,
                    requiredApprovals: stage.approvalThreshold > 0 ? stage.approvalThreshold : stage.vetoThreshold,
                    stageExpiration:
                        stage.maxAdvance !== 3155760000 ? dateUtils.secondsToDuration(stage.maxAdvance) : undefined,
                },
                bodies,
            };
        });

    private sppBodyToFormData<T extends IPluginSettings>(
        plugin: ISppStagePlugin,
        allPlugins: IDaoPlugin[],
    ): IDaoPlugin<T> {
        const hydrated = allPlugins.find((p) => p.address === plugin.address) as IDaoPlugin<T> | undefined;
        return {
            ...plugin,
            isBody: true,
            isProcess: false,
            isSubPlugin: true,
            release: hydrated?.release ?? '',
            build: hydrated?.build ?? '',
            slug: hydrated?.slug ?? '',
            settings: hydrated?.settings as T,
            name: hydrated?.name,
            description: hydrated?.description,
            links: hydrated?.links ?? [],
            subdomain: hydrated?.subdomain ?? '',
            interfaceType: hydrated?.interfaceType ?? PluginInterfaceType.UNKNOWN,
            address: hydrated?.address ?? plugin.address,
            blockTimestamp: hydrated?.blockTimestamp ?? 0,
            transactionHash: hydrated?.transactionHash ?? '',
        };
    }
}

export const daoProcessDetailsClientUtils = new DaoProcessDetailsClientUtils();
