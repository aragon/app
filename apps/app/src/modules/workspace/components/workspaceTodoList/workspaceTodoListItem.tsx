'use client';

import {
    DataList,
    DateFormat,
    formatterUtils,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    type IWorkspaceTodoProposalItem,
    type IWorkspaceTodoTransactionItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceTransactionUtils } from '../../utils/workspaceTransactionUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';
import {
    type IWorkspaceListItemSummaryProps,
    WorkspaceListItemSummary,
} from '../workspaceListItemSummary';

export interface IWorkspaceTodoListItemProps {
    /**
     * To-do to render: a proposal to vote on or a Safe transaction to sign.
     */
    todo: IWorkspaceTodoItem;
    /**
     * ID of the workspace, which the row links into.
     */
    workspaceId: string;
}

type TranslationFunction = ReturnType<typeof useTranslations>['t'];

interface IWorkspaceTodoDisplay extends IWorkspaceListItemSummaryProps {
    /**
     * Page the to-do is acted on.
     */
    href: string;
}

const buildProposalDisplay = (
    todo: IWorkspaceTodoProposalItem,
    workspaceId: string,
    t: TranslationFunction,
    timeLeftLabel: string,
): IWorkspaceTodoDisplay => {
    const { proposal, dao } = todo;

    const slug = proposalUtils.getProposalSlug(proposal, dao);
    const title = proposalUtils.getDisplayTitle(proposal, slug);

    // Guarded rather than trusted: formatting an invalid instant throws, and a missing end must not take the whole
    // list down with it.
    const timeLeft = Number.isFinite(proposal.voteEndDate)
        ? formatterUtils.formatDate(proposal.voteEndDate * 1000, {
              format: DateFormat.DURATION,
          })
        : null;

    const accountId = workspaceUtils.buildAccountId({
        network: proposal.network,
        address: proposal.daoAddress,
    });

    return {
        avatar: (
            <WorkspaceAccountAvatar
                avatar={dao.avatar}
                name={dao.name}
                type={WorkspaceAccountType.DAO}
            />
        ),
        title,
        // An untitled proposal is titled by its slug already.
        identifier: title === slug ? undefined : slug,
        // Worded as the proposal rows word their deadline.
        description: timeLeft == null ? null : `${timeLeft} ${timeLeftLabel}`,
        tag: {
            label: t('app.workspace.workspaceTodoList.item.proposal.action'),
            variant: 'primary',
        },
        // A proposal whose plugin does not resolve has no slug, hence no page of its own.
        href: workspaceUtils.getAccountScopeUrl(
            workspaceId,
            accountId,
            slug == null ? 'proposals' : `proposals/${slug}`,
        ),
    };
};

const buildTransactionDisplay = (
    todo: IWorkspaceTodoTransactionItem,
    workspaceId: string,
    t: TranslationFunction,
): IWorkspaceTodoDisplay => {
    const { account, safeInfo, transaction, hasNonceRival } = todo;

    const accountName = workspaceUtils.getAccountName(account);

    return {
        avatar: (
            <WorkspaceAccountAvatar
                avatar={account.metadata?.avatar}
                name={accountName}
                type={account.type}
            />
        ),
        // Titled as on the transactions page the row links to, so the transaction is recognised there.
        title: workspaceUtils.getAccountLabel(account),
        identifier: workspaceTransactionUtils.getSafeTransactionTitle(
            transaction.nonce,
            accountName,
        ),
        description: t(
            `app.workspace.workspaceTodoList.item.transaction.${hasNonceRival ? 'signaturesNonceRival' : 'signatures'}`,
            {
                count: transaction.confirmations.length,
                // The threshold read from the Safe wins over the one the queue carries, as on the queue page.
                required:
                    safeInfo?.threshold ?? transaction.confirmationsRequired,
            },
        ),
        tag: {
            label: t('app.workspace.workspaceTodoList.item.transaction.action'),
            variant: 'neutral',
        },
        href: workspaceTransactionUtils.getSafeTransactionUrl(
            workspaceId,
            account.id,
            transaction.safeTxHash,
        ),
    };
};

/**
 * A to-do of the connected wallet as a data-list item: the avatar of its account, what is waiting, how long is left
 * or how far along it is, and the action it calls for. The row takes no action itself; it links to where the to-do
 * is acted on: the proposal page of its account for a vote, and for a signature the transactions of its Safe, with
 * the transaction expanded.
 */
export const WorkspaceTodoListItem: React.FC<IWorkspaceTodoListItemProps> = (
    props,
) => {
    const { todo, workspaceId } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();

    const { href, ...summary } =
        todo.type === WorkspaceTodoType.PROPOSAL
            ? buildProposalDisplay(
                  todo,
                  workspaceId,
                  t,
                  copy.proposalDataListItemStatus.left,
              )
            : buildTransactionDisplay(todo, workspaceId, t);

    return (
        <DataList.Item className="flex items-center py-3 md:py-5" href={href}>
            <WorkspaceListItemSummary {...summary} />
        </DataList.Item>
    );
};
