import type { ProposalStatus } from '@aragon/gov-ui-kit';
import type { IProposal } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type {
    IWorkspaceTodoItem,
    IWorkspaceTodoProposalItem,
    IWorkspaceTodoTransactionItem,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceUtils } from '../workspaceUtils';

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
