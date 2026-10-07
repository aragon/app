import {
    AlertInline,
    type IDefinitionSetting,
    ProposalVoting,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { SafeMultisigVotingBody } from '@/plugins/safeMultisigPlugin/components/safeMultisigVotingBody';
import { useSppGovernanceSettingsDefault } from '@/plugins/sppPlugin/hooks/useSppGovernanceSettingsDefault';
import type {
    ISppProposal,
    ISppStage,
    ISppStagePlugin,
    ISppSubProposal,
} from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type PluginId,
    pluginRegistryUtils,
} from '@/shared/utils/pluginRegistryUtils';
import { SppVotingTerminalBodyBreakdownDefault } from './sppVotingTerminalBodyBreakdownDefault';
import { SppVotingTerminalBodyVoteDefault } from './sppVotingTerminalBodyVoteDefault';

export interface ISppVotingTerminalBodyContentProps {
    /**
     * The plugin that the stage belongs to.
     */
    plugin: ISppStagePlugin;
    /** Runtime-resolved identity shared by all slots in this body. */
    bodyPluginId: PluginId;
    /** The settled Safe report was not found after a successful history scan. */
    isHistoryMissing: boolean;
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
     * Children of the component.
     */
    children?: ReactNode;
}

const votesPerPage = 6;

export const SppVotingTerminalBodyContent: React.FC<
    ISppVotingTerminalBodyContentProps
> = (props) => {
    const {
        plugin,
        bodyPluginId,
        isHistoryMissing,
        daoId,
        subProposal,
        stage,
        proposal,
        children,
    } = props;
    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(daoId);

    /**
     * Whether this body type can still be asked to act after its voting window closed. Asked of the
     * registry, because it is a property of the body and not of the stage: a body that votes through
     * an external queue has no say in when that queue clears, and `reportProposalResult` carries no
     * deadline - it records while the stage is the proposal's current one.
     *
     * What is then offered is the body's own call. It knows whether anything is pending and whether
     * the stage can still advance, so it can explain an expired stage instead of showing an action.
     */
    const votesAfterWindow =
        pluginRegistryUtils.getSlotFunction<undefined, boolean>({
            slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
            pluginId: bodyPluginId,
        })?.(undefined) === true;

    const canActLate =
        votesAfterWindow &&
        stage.stageIndex === proposal.stageIndex &&
        !proposal.executed.status;

    const canVote =
        sppStageUtils.canBodyVote(proposal, stage, plugin) || canActLate;
    const showAction =
        !isHistoryMissing &&
        (canVote ||
            (bodyPluginId === PluginInterfaceType.SAFE &&
                sppStageUtils.getBodyResult(
                    proposal,
                    plugin.address,
                    stage.stageIndex,
                ) != null));

    const isExternalBody = plugin.interfaceType == null;
    // Approve/veto is a per-body property: a single stage can mix approving and
    // vetoing bodies, so derive it from this body rather than the stage.
    const isVeto = sppStageUtils.isVetoBody(plugin);

    const pluginSettings = isExternalBody
        ? {}
        : (subProposal?.settings ?? plugin.settings);
    const settings = useSlotSingleFunction<
        IUseGovernanceSettingsParams,
        IDefinitionSetting[]
    >({
        params: {
            daoId,
            settings: pluginSettings,
            isVeto,
            pluginAddress: plugin.address,
            // A native body's settings are snapshotted on the sub-proposal above; a body read live
            // has to recover its own, so hand it the decision these settings are being read for.
            proposal,
            stage,
        },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: bodyPluginId,
        fallback: useSppGovernanceSettingsDefault,
    });

    const proposalSettings = useDaoPluginInfo({
        daoId,
        address: plugin.address,
        settings,
    });

    const voteListParams = {
        queryParams: {
            proposalId: subProposal?.id,
            pluginAddress: subProposal?.pluginAddress,
            pageSize: votesPerPage,
            network,
        },
    };

    // Set parent name and description on sub-proposal to correctly display the proposal info on the vote dialog.
    const { title, description, incrementalId } = proposal;
    const processedSubProposal =
        subProposal != null
            ? {
                  ...subProposal,
                  title,
                  description,
                  incrementalId,
                  pluginInterfaceType: plugin.interfaceType,
              }
            : undefined;

    const bodyBreakdown =
        processedSubProposal != null || isExternalBody ? (
            <PluginSingleComponent
                body={isExternalBody ? plugin.address : undefined}
                canVote={canVote}
                Fallback={SppVotingTerminalBodyBreakdownDefault}
                isVeto={isVeto}
                pluginId={bodyPluginId}
                proposal={isExternalBody ? proposal : subProposal}
                slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                stage={stage}
            >
                <div className="flex flex-col gap-y-4 pt-6 md:pt-8">
                    {isHistoryMissing && (
                        <AlertInline
                            message={t(
                                'app.plugins.spp.sppVotingTerminalBodyContent.historyMissing',
                            )}
                            variant="info"
                        />
                    )}
                    {showAction && (
                        <PluginSingleComponent
                            daoId={daoId}
                            externalAddress={
                                isExternalBody ? plugin.address : undefined
                            }
                            Fallback={SppVotingTerminalBodyVoteDefault}
                            isVeto={isVeto}
                            pluginId={bodyPluginId}
                            proposal={
                                isExternalBody ? proposal : processedSubProposal
                            }
                            slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                            stage={stage}
                        />
                    )}
                    {children}
                </div>
            </PluginSingleComponent>
        ) : null;

    const bodyVotes =
        processedSubProposal != null ? (
            <VoteList
                daoId={daoId}
                initialParams={voteListParams}
                isVeto={isVeto}
                pluginAddress={plugin.address}
            />
        ) : isExternalBody ? (
            <PluginSingleComponent
                body={plugin.address}
                isVeto={isVeto}
                pluginId={bodyPluginId}
                proposal={proposal}
                slotId={GovernanceSlotId.GOVERNANCE_VOTE_LIST}
                stage={stage}
            />
        ) : null;

    const hasBodyContent = bodyBreakdown != null && bodyVotes != null;

    return (
        <>
            {hasBodyContent ? (
                bodyPluginId === PluginInterfaceType.SAFE ? (
                    <SafeMultisigVotingBody
                        breakdown={bodyBreakdown}
                        settings={proposalSettings}
                        votes={bodyVotes}
                    />
                ) : (
                    <>
                        {bodyBreakdown}
                        <ProposalVoting.Votes>{bodyVotes}</ProposalVoting.Votes>
                        <ProposalVoting.Details settings={proposalSettings} />
                    </>
                )
            ) : (
                <ProposalVoting.Details settings={proposalSettings} />
            )}
        </>
    );
};
