import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { addressUtils, ProposalStatus, ProposalVoting, ProposalVotingTab } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useEnsName } from 'wagmi';
import type { ISppProposal, ISppStage, ISppStagePlugin } from '../../../types';
import { sppStageUtils } from '../../../utils/sppStageUtils';
import { SppStageStatus } from './sppStageStatus';
import { SppVotingTerminalBodyContent } from './sppVotingTerminalBodyContent';

export interface ISppVotingTerminalStageBodyContentProps {
    /**
     * Plugin to display the body content for.
     */
    plugin: ISppStagePlugin;
    /**
     * Status of the stage.
     */
    status: ProposalStatus;
    /**
     * Stage of the SPP proposal.
     */
    stage: ISppStage;
    /**
     * Main SPP proposal.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Displays the stage status when set to true.
     */
    displayStatus: boolean;
}

export const SppVotingTerminalStageBodyContent: React.FC<ISppVotingTerminalStageBodyContentProps> = (props) => {
    const { plugin, status, stage, proposal, daoId, displayStatus } = props;

    const { data: pluginEns } = useEnsName({ address: plugin.address as Hex });

    const defaultName = pluginEns ?? addressUtils.truncateAddress(plugin.address);
    const pluginName = plugin.subdomain != null && plugin.name != null ? plugin.name : defaultName;
    const isVeto = sppStageUtils.isVeto(stage);

    return (
        <ProposalVoting.BodyContent
            name={pluginName}
            key={plugin.address}
            status={status}
            bodyId={plugin.address}
            hideTabs={!plugin.subdomain ? [ProposalVotingTab.VOTES] : undefined}
            bodyBrand={plugin.subdomain === undefined ? brandedExternals[plugin.brandId] : undefined}
        >
            <SppVotingTerminalBodyContent
                plugin={plugin}
                daoId={daoId}
                subProposal={sppStageUtils.getBodySubProposal(proposal, plugin.address, stage.stageIndex)}
                proposal={proposal}
                canVote={status === ProposalStatus.ACTIVE}
                isVeto={isVeto}
                stage={stage}
            >
                {displayStatus && <SppStageStatus proposal={proposal} stage={stage} daoId={daoId} />}
            </SppVotingTerminalBodyContent>
        </ProposalVoting.BodyContent>
    );
};
