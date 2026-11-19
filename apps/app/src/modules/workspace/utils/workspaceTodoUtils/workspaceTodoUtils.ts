import type { ProposalStatus } from '@aragon/gov-ui-kit';
import type { IProposal } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISppProposal } from '@/plugins/sppPlugin/types';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type {
    IWorkspaceTodoItem,
    IWorkspaceTodoProposalItem,
    IWorkspaceTodoTransactionItem,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceUtils } from '../workspaceUtils';

export interface IWorkspaceTodoProposalStage {
    /**
     * Index of the stage the proposal is at.
     */
    index: number;
    /**
     * Name of that stage, when its process names it.
     */
    name?: string;
}

class WorkspaceTodoUtils {
    /**
     * Status of a proposal as its process plugin computes it, or undefined when no plugin claims the proposal's
     * interface type, which the to-do list treats as "not actionable" rather than guessing.
     */
    getProposalStatus = (proposal: IProposal): ProposalStatus | undefined => {
        const getStatus = pluginRegistryUtils.getSlotFunction<
            IProposal,
            ProposalStatus
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: proposal.pluginInterfaceType,
        });

        return getStatus?.(proposal);
    };

    /**
     * Stage a proposal of a staged process is at, which is where its to-do stands. Undefined for a proposal that is
     * not staged or whose process has a single stage, where the stage says nothing the proposal does not.
     */
    getProposalStage = (
        proposal: IProposal,
    ): IWorkspaceTodoProposalStage | undefined => {
        if (proposal.pluginInterfaceType !== PluginInterfaceType.SPP) {
            return undefined;
        }

        const { stageIndex, settings } = proposal as ISppProposal;
        const stages = settings?.stages ?? [];
        const stage = stages[stageIndex];

        return stages.length > 1 && stage != null
            ? { index: stageIndex, name: stage.name ?? undefined }
            : undefined;
    };

    /**
     * Orders the proposals of the to-do list by the end of their vote window, soonest first; the ones whose end is
     * unknown come last, in the order they were read.
     */
    sortProposalsByDeadline = (
        proposals: IWorkspaceTodoProposalItem[],
    ): IWorkspaceTodoProposalItem[] => {
        const getDeadline = ({ proposal }: IWorkspaceTodoProposalItem) =>
            Number.isFinite(proposal.voteEndDate)
                ? proposal.voteEndDate
                : Number.POSITIVE_INFINITY;

        return [...proposals].sort(
            (first, second) => getDeadline(first) - getDeadline(second),
        );
    };

    /**
     * Key identifying a to-do among the ones of a list.
     */
    getTodoKey = (todo: IWorkspaceTodoItem): string =>
        'proposal' in todo
            ? todo.proposal.id
            : `${todo.account.id}-${todo.transaction.safeTxHash}`;

    /**
     * URL a proposal is voted on inside a workspace: its page under its account, or the proposals of that account
     * when it has no slug, i.e. when its plugin does not resolve and it has no page of its own.
     * @param workspaceId - ID of the workspace.
     * @param todo - Proposal to-do.
     * @param slug - Slug of the proposal, as `proposalUtils.getProposalSlug` builds it.
     * @returns The URL of the proposal.
     */
    getProposalUrl = (
        workspaceId: string,
        todo: IWorkspaceTodoProposalItem,
        slug?: string,
    ): string => {
        const accountId = workspaceUtils.buildAccountId({
            network: todo.proposal.network,
            address: todo.proposal.daoAddress,
        });

        return workspaceUtils.getAccountScopeUrl(
            workspaceId,
            accountId,
            slug == null ? 'proposals' : `proposals/${slug}`,
        );
    };

    /**
     * Signatures a Safe transaction needs to execute. The threshold read from the Safe wins over the one the queue
     * carries, as on the queue page.
     */
    getRequiredSignatures = (todo: IWorkspaceTodoTransactionItem): number =>
        todo.safeInfo?.threshold ?? todo.transaction.confirmationsRequired;
}

export const workspaceTodoUtils = new WorkspaceTodoUtils();
