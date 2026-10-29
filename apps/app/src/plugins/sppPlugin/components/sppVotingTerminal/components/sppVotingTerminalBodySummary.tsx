import { ProposalVoting } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { useSppVotingTerminalBodyMode } from '@/plugins/sppPlugin/hooks/useSppVotingTerminalBodyMode';
import type {
    ISppProposal,
    ISppStage,
    ISppStagePlugin,
} from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { SppVotingTerminalMultiBodySummaryDefault } from './sppVotingTerminalMultiBodySummaryDefault';

export interface ISppVotingTerminalBodySummaryProps {
    /**
     * Plugin body to summarize.
     */
    plugin: ISppStagePlugin;
    /**
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Stage the body belongs to.
     */
    stage: ISppStage;
}

export const SppVotingTerminalBodySummary: React.FC<
    ISppVotingTerminalBodySummaryProps
> = (props) => {
    const { plugin, proposal, stage } = props;
    const { pluginId } = useSppVotingTerminalBodyMode({
        plugin,
        proposal,
        stage,
    });
    const isExternal = plugin.interfaceType == null;

    return (
        <ProposalVoting.BodySummaryListItem
            bodyBrand={
                isExternal ? brandedExternals[plugin.brandId] : undefined
            }
            id={plugin.address}
        >
            <PluginSingleComponent
                body={isExternal ? plugin.address : undefined}
                canVote={sppStageUtils.canBodyVote(proposal, stage, plugin)}
                Fallback={SppVotingTerminalMultiBodySummaryDefault}
                isExecuted={proposal.executed.status}
                isVeto={sppStageUtils.isVetoBody(plugin)}
                name={isExternal ? undefined : plugin.name}
                pluginId={pluginId}
                proposal={
                    isExternal
                        ? proposal
                        : sppStageUtils.getBodySubProposal(
                              proposal,
                              plugin.address,
                              stage.stageIndex,
                          )
                }
                slotId={
                    GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY
                }
                stage={stage}
            />
        </ProposalVoting.BodySummaryListItem>
    );
};
