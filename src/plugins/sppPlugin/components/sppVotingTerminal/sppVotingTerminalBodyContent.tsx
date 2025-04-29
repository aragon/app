import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { sppSettingsUtils } from '@/plugins/sppPlugin/utils/sppSettingsUtils';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ChainEntityType, ProposalVoting, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import type { ISppProposal, ISppStage, ISppStagePlugin, ISppSubProposal } from '../../types';
import { SppVotingTerminalBodyBreakdownDefault } from './sppVotingTerminalBodyBreakdownDefault';
import { SppVotingTerminalBodyVoteDefault } from './sppVotingTerminalBodyVoteDefault';

export interface ISppVotingTerminalBodyContentProps {
    /**
     * The plugin that the stage belongs to.
     */
    plugin: ISppStagePlugin;
    /**
     * ID of the related DAO.
     */
    daoId: string;
    /**
     * Sub proposal to display the content for.
     */
    subProposal?: ISppSubProposal;
    /**
     * Stage on which sub proposal is created.
     */
    stage: ISppStage;
    /**
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Flag indicating if the vote is a veto.
     */
    isVeto: boolean;
    /**
     * Flag indicating if the user can vote.
     */
    canVote: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

const votesPerPage = 6;

export const SppVotingTerminalBodyContent: React.FC<ISppVotingTerminalBodyContentProps> = (props) => {
    const { plugin, daoId, subProposal, stage, proposal, canVote, isVeto, children } = props;
    const { address: pluginAddress } = plugin;
    const { t } = useTranslations();

    const isExternalBody = plugin.subdomain == null;

    const { data: externalBodyEnsName } = useEnsName({
        address: pluginAddress as Hex,
        query: { enabled: isExternalBody },
        chainId: mainnet.id,
    });

    const { id: chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const pluginHref = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: pluginAddress });
    const pluginSettings = isExternalBody
        ? { pluginAddress, pluginName: externalBodyEnsName ?? undefined, link: { href: pluginHref } }
        : plugin.settings;

    const proposalSettings = useSlotSingleFunction<IUseGovernanceSettingsParams, IDaoSettingTermAndDefinition[]>({
        params: { daoId, settings: pluginSettings, pluginAddress: plugin.address },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain ?? 'external',
        fallback: () =>
            sppSettingsUtils.getFallbackSettings({
                t,
                settings: pluginSettings,
            }),
    });

    const voteListParams = {
        queryParams: { proposalId: subProposal?.id, pluginAddress: subProposal?.pluginAddress, pageSize: votesPerPage },
    };

    // Set parent name and description on sub-proposal to correctly display the proposal info on the vote dialog.
    const { title, description, incrementalId } = proposal;
    const processedSubProposal =
        subProposal != null ? { ...subProposal, title, description, incrementalId } : undefined;

    return (
        <>
            {(processedSubProposal != null || isExternalBody) && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={isExternalBody ? 'external' : plugin.subdomain}
                        proposal={isExternalBody ? proposal : subProposal}
                        body={isExternalBody ? plugin.address : undefined}
                        canVote={canVote}
                        stage={stage}
                        Fallback={SppVotingTerminalBodyBreakdownDefault}
                    >
                        <div className="flex flex-col gap-y-4 pt-6 md:pt-8">
                            {canVote && (
                                <PluginSingleComponent
                                    slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                                    pluginId={isExternalBody ? 'external' : processedSubProposal!.pluginSubdomain}
                                    proposal={isExternalBody ? proposal : processedSubProposal}
                                    externalAddress={isExternalBody ? plugin.address : undefined}
                                    daoId={daoId}
                                    stage={stage}
                                    isVeto={isVeto}
                                    Fallback={SppVotingTerminalBodyVoteDefault}
                                />
                            )}
                            {children}
                        </div>
                    </PluginSingleComponent>
                    {processedSubProposal && (
                        <ProposalVoting.Votes>
                            <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={plugin.address} />
                        </ProposalVoting.Votes>
                    )}
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </>
    );
};
