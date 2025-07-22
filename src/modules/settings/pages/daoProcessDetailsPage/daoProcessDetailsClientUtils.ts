import {
    GovernanceType,
    ProcessStageType,
    ProposalCreationMode,
    type ICreateProcessFormData,
    type ICreateProcessFormDataAdvanced,
} from '@/modules/createDao/components/createProcessForm';
import { SetupBodyType } from '@/modules/createDao/dialogs/setupBodyDialog';
import type {
    ISetupBodyFormExisting,
    ISetupBodyFormMembership,
} from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import type { ISppPluginSettings, ISppStagePlugin } from '@/plugins/sppPlugin/types';
import { PluginInterfaceType, type IDaoPlugin, type IPluginSettings } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import { SettingsSlotId } from '../../constants/moduleSlots';

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
            const slotFn = pluginRegistryUtils.getSlotFunction<
                { plugin: IDaoPlugin; membership: ISetupBodyFormMembership },
                ISetupBodyFormExisting<IPluginSettings, ICompositeAddress, ISetupBodyFormMembership>
            >({
                slotId: SettingsSlotId.SETTINGS_PLUGIN_INFO,
                pluginId: plugin.interfaceType,
            });

            const normalizeBody = slotFn ?? this.normalizeBody;

            const body = normalizeBody({
                plugin: plugin,
                membership: { members: [] },
            });

            return {
                governanceType: GovernanceType.BASIC,
                body,
                ...base,
            };
        }

        return {
            governanceType: GovernanceType.ADVANCED,
            stages: this.normalizeSettings(plugin.settings as ISppPluginSettings, allPlugins),
            ...base,
        };
    };

    normalizeBody = <TSettings extends IPluginSettings, TMembership extends ISetupBodyFormMembership>(params: {
        plugin: IDaoPlugin<TSettings>;
        membership: TMembership;
    }): ISetupBodyFormExisting<TSettings, ICompositeAddress, TMembership> => {
        const { plugin, membership } = params;

        return {
            subdomain: plugin.subdomain,
            internalId: crypto.randomUUID(),
            type: SetupBodyType.EXISTING,
            plugin: plugin.interfaceType,
            address: plugin.address,
            name: plugin.name?.trim() ?? daoUtils.getPluginName(plugin),
            build: plugin.build,
            release: plugin.release,
            description: plugin.description ?? '',
            resources: plugin.links ?? [],
            governance: plugin.settings,
            membership,
            canCreateProposal: false,
        };
    };

    private normalizeSettings = (
        settings: ISppPluginSettings,
        allPlugins: IDaoPlugin[],
    ): ICreateProcessFormDataAdvanced['stages'] =>
        settings.stages.map((stage) => {
            const bodies = stage.plugins.map((plugin) => {
                const normalized = this.normalizePlugin(plugin, allPlugins);

                const normalizeFn = pluginRegistryUtils.getSlotFunction<
                    { plugin: IDaoPlugin; membership: ISetupBodyFormMembership },
                    ISetupBodyFormExisting<IPluginSettings, ICompositeAddress, ISetupBodyFormMembership>
                >({
                    slotId: SettingsSlotId.SETTINGS_PLUGIN_INFO,
                    pluginId: normalized.interfaceType,
                });

                if (!normalizeFn) {
                    return this.normalizeBody({
                        plugin: normalized,
                        membership: { members: [] },
                    });
                }

                return normalizeFn({
                    plugin: normalized,
                    membership: { members: [] },
                });
            });

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

    private normalizePlugin<T extends IPluginSettings>(
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
