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
import type { IMultisigSetupMembershipForm } from '@/plugins/multisigPlugin/components/multisigSetupMembership';
import type { ISppPluginSettings, ISppStagePlugin } from '@/plugins/sppPlugin/types';
import type {
    ITokenSetupMembershipForm,
    ITokenSetupMembershipMember,
} from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { dateUtils } from '@/shared/utils/dateUtils';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

class ProcessDetailsClientUtils {
    pluginToProcessFormData = (
        plugin: IDaoPlugin<ISppPluginSettings | IPluginSettings>,
        allPlugins: IDaoPlugin[],
    ): ICreateProcessFormData => {
        const basePlugin = {
            name: plugin.name!,
            resources: plugin.links!,
            description: plugin.description!,
            proposalCreationMode: ProposalCreationMode.ANY_WALLET,
            processKey: plugin.slug,
            pluginAddress: plugin.address,
        };

        if (plugin.isBody && plugin.isProcess) {
            if (this.isTokenPlugin(plugin)) {
                return {
                    governanceType: GovernanceType.BASIC,
                    body: this.normalizeBody<
                        ITokenPluginSettings,
                        ITokenSetupMembershipMember,
                        ITokenSetupMembershipForm
                    >(plugin, {
                        members: [],
                        token: plugin.settings.token,
                    }),
                    ...basePlugin,
                };
            }

            return {
                governanceType: GovernanceType.BASIC,
                body: this.normalizeBody<IPluginSettings, ICompositeAddress, IMultisigSetupMembershipForm>(plugin, {
                    members: [],
                }),
                ...basePlugin,
            };
        }

        return {
            governanceType: GovernanceType.ADVANCED,
            stages: this.normalizeSettings(plugin.settings as ISppPluginSettings, allPlugins),
            ...basePlugin,
        };
    };

    private normalizeBody<
        TGovernance extends IPluginSettings,
        TMember extends ICompositeAddress,
        TMembership extends ISetupBodyFormMembership<TMember>,
    >(
        body: IDaoPlugin<TGovernance>,
        membership: TMembership,
    ): ISetupBodyFormExisting<TGovernance, TMember, TMembership> {
        return {
            subdomain: body.subdomain,
            internalId: crypto.randomUUID(),
            type: SetupBodyType.EXISTING,
            plugin: body.subdomain,
            address: body.address,
            name: body.name,
            description: body.description ?? '',
            resources: body.links ?? [],
            governance: body.settings,
            membership,
            canCreateProposal: false,
        };
    }

    private normalizeSettings = (
        settings: ISppPluginSettings,
        allPlugins: IDaoPlugin[],
    ): ICreateProcessFormDataAdvanced['stages'] => {
        return settings.stages.map((stage) => ({
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
            bodies: stage.plugins.map((plugin) => {
                const normalized = this.normalizePlugin(plugin, allPlugins);

                if (this.isTokenPlugin(normalized)) {
                    return this.normalizeBody<
                        ITokenPluginSettings,
                        ITokenSetupMembershipMember,
                        ITokenSetupMembershipForm
                    >(normalized, {
                        members: [],
                        token: normalized.settings.token,
                    });
                }

                return this.normalizeBody<IPluginSettings, ICompositeAddress, IMultisigSetupMembershipForm>(
                    normalized,
                    {
                        members: [],
                    },
                );
            }),
        }));
    };

    private normalizePlugin<T extends IPluginSettings>(
        plugin: ISppStagePlugin,
        allPlugins: IDaoPlugin[],
    ): IDaoPlugin<T> {
        const hydrated = allPlugins.find((p) => p.address === plugin.address);

        return {
            ...plugin,
            isBody: true,
            isProcess: false,
            isSubPlugin: true,
            release: 'release' in plugin ? plugin.release : (hydrated?.release ?? '1'),
            build: 'build' in plugin ? plugin.build : (hydrated?.build ?? '0'),
            slug: 'slug' in plugin ? plugin.slug : (hydrated?.slug ?? ''),
            settings:
                'settings' in plugin
                    ? (plugin.settings as T)
                    : hydrated?.settings !== undefined
                      ? (hydrated.settings as T)
                      : ({} as T),
            name: 'name' in plugin ? (plugin.name ?? '') : (hydrated?.name ?? ''),
            description: 'description' in plugin ? (plugin.description ?? '') : (hydrated?.description ?? ''),
            links: 'links' in plugin ? (plugin.links ?? []) : (hydrated?.links ?? []),
            subdomain: plugin.subdomain ?? hydrated?.subdomain ?? '',
            address: plugin.address,
            blockTimestamp: 'blockTimestamp' in plugin ? plugin.blockTimestamp : (hydrated?.blockTimestamp ?? 0),
            transactionHash: 'transactionHash' in plugin ? plugin.transactionHash : (hydrated?.transactionHash ?? ''),
        };
    }

    private isTokenPlugin(plugin: IDaoPlugin): plugin is IDaoPlugin<ITokenPluginSettings> {
        const settings = plugin.settings as unknown;
        return typeof settings === 'object' && settings !== null && 'token' in settings;
    }
}

export const processDetailsClientUtils = new ProcessDetailsClientUtils();
