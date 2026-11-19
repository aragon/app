'use client';

import {
    DataList,
    DateFormat,
    formatterUtils,
    StateSkeletonBar,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { safeCalldataUtils } from '@/modules/safe/utils/safeCalldataUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    type IWorkspaceTodoProposalItem,
    type IWorkspaceTodoTransactionItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import { workspaceTransactionUtils } from '../../utils/workspaceTransactionUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';

export interface IWorkspaceTodoListItemProps {
    /**
     * To-do to render: a proposal to vote on or a Safe transaction to sign.
     */
    todo: IWorkspaceTodoItem;
    /**
     * ID of the workspace, which the row links into.
     */
    workspaceId: string;
    /**
     * Leaves the account of the to-do out, for a list scoped to one account, which already tells it.
     */
    hideAccount?: boolean;
}

type TranslationFunction = ReturnType<typeof useTranslations>['t'];

interface IWorkspaceTodoDisplay {
    /**
     * Identifier leading the row: the slug of a proposal or the nonce of a Safe transaction.
     */
    id?: string;
    /**
     * What is waiting: the title of the proposal, or what the Safe transaction calls.
     */
    title: string;
    /**
     * Time shown at the end of the first line: left to vote, or since the transaction was queued.
     */
    time?: string;
    /**
     * Where the to-do stands: the stage of a staged process or the signatures a Safe transaction has.
     */
    context?: string;
    /**
     * Name of the account the to-do belongs to.
     */
    accountName?: string;
    /**
     * Avatar of the account the to-do belongs to.
     */
    accountAvatar: ReactNode;
    /**
     * Page the to-do is acted on.
     */
    href: string;
}

const itemClassName = 'flex flex-col gap-y-2 py-3 md:py-5';

const lineClassName =
    'flex w-full items-center justify-between gap-x-4 md:gap-x-6';

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

    const stage = workspaceTodoUtils.getProposalStage(proposal);

    return {
        // An untitled proposal is titled by its slug already.
        id: title === slug ? undefined : slug,
        title,
        // Worded as the proposal rows word their deadline.
        time: timeLeft == null ? undefined : `${timeLeft} ${timeLeftLabel}`,
        context:
            stage == null
                ? undefined
                : (stage.name ??
                  t('app.plugins.spp.sppProposalListItem.stage', {
                      stageIndex: stage.index + 1,
                  })),
        accountName: dao.name,
        accountAvatar: (
            <WorkspaceAccountAvatar
                avatar={dao.avatar}
                name={dao.name}
                size="sm"
                type={WorkspaceAccountType.DAO}
            />
        ),
        href: workspaceTodoUtils.getProposalUrl(workspaceId, todo, slug),
    };
};

const buildTransactionDisplay = (
    todo: IWorkspaceTodoTransactionItem,
    workspaceId: string,
    t: TranslationFunction,
): IWorkspaceTodoDisplay => {
    const { account, transaction, hasNonceRival } = todo;

    const namespace = 'app.workspace.workspaceTodoList.item.transaction';
    const accountName = workspaceUtils.getAccountName(account);

    const submissionDate = Date.parse(transaction.submissionDate);
    const queued = Number.isFinite(submissionDate)
        ? t(`${namespace}.queued`, {
              date: formatterUtils.formatDate(submissionDate, {
                  format: DateFormat.RELATIVE,
              }),
          })
        : undefined;

    return {
        id: t(`${namespace}.id`, { nonce: transaction.nonce }),
        // A Safe transaction has no metadata, so it is titled by what it calls when that decodes.
        title:
            safeCalldataUtils.decodeFunctionName(transaction.data) ??
            t(`${namespace}.title`),
        time: queued,
        context: t(
            `${namespace}.${hasNonceRival ? 'signaturesNonceRival' : 'signatures'}`,
            {
                count: transaction.confirmations.length,
                required: workspaceTodoUtils.getRequiredSignatures(todo),
            },
        ),
        accountName: workspaceUtils.getAccountLabel(account),
        accountAvatar: (
            <WorkspaceAccountAvatar
                avatar={account.metadata?.avatar}
                name={accountName}
                size="sm"
                type={account.type}
            />
        ),
        href: workspaceTransactionUtils.getSafeTransactionUrl(
            workspaceId,
            account.id,
            transaction.safeTxHash,
        ),
    };
};

/**
 * A to-do of the connected wallet as a two-line data-list item, the same for a vote and a signature. The first line
 * is the object itself, its identifier before its title, with the time on the right: left to vote, or since the
 * transaction was queued. The second line tells where it stands (the stage of a staged process, the signatures a Safe
 * transaction has) and marks its account with a small avatar, named on hover.
 *
 * Being listed says the to-do is open, so the row carries no status and no action of its own; it links to where the
 * to-do is acted on: the proposal page of its account for a vote, and for a signature the transactions of its Safe,
 * with the transaction expanded.
 */
export const WorkspaceTodoListItem: React.FC<IWorkspaceTodoListItemProps> = (
    props,
) => {
    const { todo, workspaceId, hideAccount } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();

    const { id, title, time, context, accountName, accountAvatar, href } =
        todo.type === WorkspaceTodoType.PROPOSAL
            ? buildProposalDisplay(
                  todo,
                  workspaceId,
                  t,
                  copy.proposalDataListItemStatus.left,
              )
            : buildTransactionDisplay(todo, workspaceId, t);

    const showAccount = hideAccount !== true;

    return (
        <DataList.Item className={itemClassName} href={href}>
            <div className={lineClassName}>
                <div className="flex min-w-0 items-center gap-x-1 leading-tight md:gap-x-1.5 md:text-lg">
                    {id != null && (
                        <p className="shrink-0 text-neutral-500">{id}</p>
                    )}
                    <p className="truncate text-neutral-800">{title}</p>
                </div>
                {time != null && (
                    <span className="shrink-0 text-sm leading-tight text-neutral-800 md:text-base">
                        {time}
                    </span>
                )}
            </div>
            {(showAccount || context != null) && (
                <div className={`${lineClassName} min-h-6`}>
                    <p className="truncate text-sm leading-tight text-neutral-500 md:text-base">
                        {context}
                    </p>
                    {showAccount && (
                        <span className="flex shrink-0" title={accountName}>
                            {accountAvatar}
                        </span>
                    )}
                </div>
            )}
        </DataList.Item>
    );
};

/**
 * Placeholder of a row while the to-dos load.
 */
export const WorkspaceTodoListItemSkeleton: React.FC = () => (
    <DataList.Item
        aria-busy="true"
        className={`${itemClassName} bg-neutral-0`}
        tabIndex={0}
    >
        <div className={lineClassName}>
            <StateSkeletonBar size="lg" width="50%" />
            <StateSkeletonBar size="lg" width={72} />
        </div>
        <div className={`${lineClassName} min-h-6`}>
            <StateSkeletonBar size="md" width="30%" />
        </div>
    </DataList.Item>
);
