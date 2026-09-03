import {
    addressUtils,
    ProposalVoting,
    ProposalVotingTab,
} from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import { safeBodyPluginId } from '@/plugins/safeMultisigPlugin/constants';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
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

    // A Safe body has no indexed sub-proposal, so the generic external body has no votes to show.
    // The Safe implementation builds the tab from live Safe confirmations instead, so it keeps it.
    const hasSafeBodyVotes =
        sppStageUtils.getBodyPluginId(plugin, proposal.network) ===
        safeBodyPluginId;
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
            hideTabs={
                isExternalPlugin && !hasSafeBodyVotes
                    ? hiddenExternalTabs
                    : undefined
            }
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
