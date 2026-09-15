import {
    addressUtils,
    ProposalVoting,
    ProposalVotingTab,
} from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ISppProposal, ISppStage, ISppStagePlugin } from '../../../types';
import { sppStageUtils } from '../../../utils/sppStageUtils';
import { SppStageStatus } from './sppStageStatus';
import { SppVotingTerminalBodyContent } from './sppVotingTerminalBodyContent';

const hiddenExternalTabs = [ProposalVotingTab.VOTES];

export interface ISppVotingTerminalStageBodyContentProps {
    /**
     * Plugin to display the body content for.
     */
    plugin: ISppStagePlugin;
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

export const SppVotingTerminalStageBodyContent: React.FC<
    ISppVotingTerminalStageBodyContentProps
> = (props) => {
    const { plugin, stage, proposal, daoId, displayStatus } = props;

    const { data: pluginEns } = useEnsName(plugin.address);

    const status = sppStageUtils.getStageStatus(proposal, stage);

    const isExternalPlugin = plugin.interfaceType == null;

    // The tab set is a per-body-type policy, so it is asked of the registry rather than branched on
    // here. Nothing registered means the generic external fallback, which has no indexed
    // sub-proposal and so no votes to show.
    const getHiddenTabs = pluginRegistryUtils.getSlotFunction<
        undefined,
        ProposalVotingTab[]
    >({
        slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
        pluginId: sppStageUtils.getBodyPluginId(plugin, proposal.network),
    });
    const hideTabs =
        getHiddenTabs?.(undefined) ??
        (isExternalPlugin ? hiddenExternalTabs : undefined);
    const defaultName =
        pluginEns ?? addressUtils.truncateAddress(plugin.address);
    const pluginName =
        !isExternalPlugin && plugin.name != null ? plugin.name : defaultName;

    return (
        <ProposalVoting.BodyContent
            bodyBrand={
                isExternalPlugin ? brandedExternals[plugin.brandId] : undefined
            }
            bodyId={plugin.address}
            hideTabs={hideTabs}
            key={plugin.address}
            name={pluginName}
            status={status}
        >
            <SppVotingTerminalBodyContent
                daoId={daoId}
                plugin={plugin}
                proposal={proposal}
                stage={stage}
                subProposal={sppStageUtils.getBodySubProposal(
                    proposal,
                    plugin.address,
                    stage.stageIndex,
                )}
            >
                {displayStatus && (
                    <SppStageStatus
                        daoId={daoId}
                        proposal={proposal}
                        stage={stage}
                    />
                )}
            </SppVotingTerminalBodyContent>
        </ProposalVoting.BodyContent>
    );
};
