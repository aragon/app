'use client';

import {
    Button,
    DateFormat,
    formatterUtils,
    StateSkeletonBar,
    StateSkeletonCircular,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { SafeDialogId } from '@/modules/safe/constants';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    type IWorkspaceTodoProposalItem,
    type IWorkspaceTodoTransactionItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';

export interface IWorkspaceTodoPreviewItemProps {
    /**
     * To-do to render: a proposal to vote on or a Safe transaction to sign.
     */
    todo: IWorkspaceTodoItem;
    /**
     * ID of the workspace, which the vote button links into.
     */
    workspaceId: string;
}

type TranslationFunction = ReturnType<typeof useTranslations>['t'];

type OpenDialogFunction = ReturnType<typeof useDialogContext>['open'];

interface IWorkspaceTodoPreviewAction {
    /**
     * Label of the action button.
     */
    label: string;
    /**
     * A primary action is a vote, a secondary one a signature.
     */
    variant: 'primary' | 'secondary';
    /**
     * Page the action takes place on. The button navigates when set, and calls `onClick` otherwise.
     */
    href?: string;
    /**
     * Opens the action in place, for a Safe transaction reviewed and signed in a dialog.
     */
    onClick?: () => void;
}

interface IWorkspaceTodoPreviewDisplay {
    /**
     * Avatar of the account the row belongs to.
     */
    avatar: ReactNode;
    /**
     * What is waiting: the proposal or the transaction.
     */
    title: string;
    /**
     * What to do about it and until when.
     */
    meta: string;
    /**
     * The action to take.
     */
    action: IWorkspaceTodoPreviewAction;
}

const rowClassName =
    'flex items-center gap-4 border-neutral-100 border-t px-4 py-3 first:border-t-0 md:px-6 md:py-4';

const metaSeparator = ' · ';

const buildProposalDisplay = (
    todo: IWorkspaceTodoProposalItem,
    workspaceId: string,
    t: TranslationFunction,
): IWorkspaceTodoPreviewDisplay => {
    const { proposal, dao } = todo;

    const slug = proposalUtils.getProposalSlug(proposal, dao);
    const displayTitle = proposalUtils.getDisplayTitle(proposal, slug);
    const actionLabel = t('app.workspace.workspaceTodoPreview.proposal.action');

    // Guarded rather than trusted: a relative format of an invalid instant throws, and a missing end must not take
    // the whole overview down with it.
    const voteEndDate = Number.isFinite(proposal.voteEndDate)
        ? formatterUtils.formatDate(proposal.voteEndDate * 1000, {
              format: DateFormat.RELATIVE,
          })
        : null;

    return {
        avatar: (
            <WorkspaceAccountAvatar
                avatar={dao.avatar}
                name={dao.name}
                type={WorkspaceAccountType.DAO}
            />
        ),
        // An untitled proposal is titled by its slug already.
        title:
            slug == null || displayTitle === slug
                ? displayTitle
                : t('app.workspace.workspaceTodoPreview.proposal.title', {
                      slug,
                      title: displayTitle,
                  }),
        meta:
            voteEndDate == null
                ? actionLabel
                : t('app.workspace.workspaceTodoPreview.proposal.meta', {
                      date: voteEndDate,
                  }),
        action: {
            label: actionLabel,
            variant: 'primary',
            href: workspaceTodoUtils.getProposalUrl(workspaceId, todo, slug),
        },
    };
};

const buildTransactionDisplay = (
    todo: IWorkspaceTodoTransactionItem,
    t: TranslationFunction,
    open: OpenDialogFunction,
): IWorkspaceTodoPreviewDisplay => {
    const { account, safeInfo, transaction, hasNonceRival } = todo;

    const meta = t('app.workspace.workspaceTodoPreview.transaction.meta', {
        account: workspaceUtils.getAccountLabel(account),
        count: transaction.confirmations.length,
        required: workspaceTodoUtils.getRequiredSignatures(todo),
    });
    const nonceRival = hasNonceRival
        ? [t('app.workspace.workspaceTodoPreview.transaction.nonceRival')]
        : [];

    return {
        avatar: (
            <WorkspaceAccountAvatar
                avatar={account.metadata?.avatar}
                name={workspaceUtils.getAccountName(account)}
                type={account.type}
            />
        ),
        title: t('app.workspace.workspaceTodoPreview.transaction.title', {
            nonce: transaction.nonce,
        }),
        meta: [meta, ...nonceRival].join(metaSeparator),
        action: {
            label: t('app.workspace.workspaceTodoPreview.transaction.action'),
            variant: 'secondary',
            // The same review dialog as the Safe queue, which is where a transaction is signed.
            onClick: () =>
                open(SafeDialogId.TRANSACTION_REVIEW, {
                    params: {
                        transaction,
                        safeAddress: account.address,
                        network: account.network,
                        safeVersion: safeInfo?.version ?? null,
                    },
                }),
        },
    };
};

/**
 * A to-do of the connected wallet as a compact row of the overview preview: the avatar of its account, what is
 * waiting, what to do about it and until when, and the action itself. A vote leads to the proposal page of its
 * account; a signature opens the review dialog of the Safe queue in place.
 */
export const WorkspaceTodoPreviewItem: React.FC<
    IWorkspaceTodoPreviewItemProps
> = (props) => {
    const { todo, workspaceId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { avatar, title, meta, action } =
        todo.type === WorkspaceTodoType.PROPOSAL
            ? buildProposalDisplay(todo, workspaceId, t)
            : buildTransactionDisplay(todo, t, open);

    const buttonProps = {
        className: 'shrink-0',
        size: 'sm' as const,
        variant: action.variant,
    };

    return (
        <div className={rowClassName}>
            {avatar}
            <div className="flex min-w-0 grow flex-col gap-1">
                <p className="truncate text-base text-neutral-800 leading-tight">
                    {title}
                </p>
                <p className="truncate text-neutral-500 text-sm leading-tight">
                    {meta}
                </p>
            </div>
            {action.href == null ? (
                <Button {...buttonProps} onClick={action.onClick}>
                    {action.label}
                </Button>
            ) : (
                <Button {...buttonProps} href={action.href}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};

/**
 * Placeholder of a row while the preview loads.
 */
export const WorkspaceTodoPreviewItemSkeleton: React.FC = () => (
    <div className={rowClassName}>
        <StateSkeletonCircular size="md" />
        <div className="flex grow flex-col gap-2">
            <StateSkeletonBar size="lg" width="60%" />
            <StateSkeletonBar size="md" width="40%" />
        </div>
        <StateSkeletonBar size="xl" width={72} />
    </div>
);
