'use client';

import { DaoAvatar, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspaceTodoProposalItem } from '../../hooks/useWorkspaceTodoData';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceTodoItem } from './workspaceTodoItem';

export interface IWorkspaceTodoProposalItemProps
    extends IWorkspaceTodoProposalItem {
    /**
     * ID of the workspace, used to link the row to the proposal details page of its account.
     */
    workspaceId: string;
}

/**
 * A proposal awaiting the wallet's vote: its DAO's avatar, its slug and title, when its vote window closes, and a
 * vote button leading to the proposal page of its account.
 */
export const WorkspaceTodoProposalItem: React.FC<
    IWorkspaceTodoProposalItemProps
> = (props) => {
    const { proposal, dao, workspaceId } = props;

    const { t } = useTranslations();

    const slug = proposalUtils.getProposalSlug(proposal, dao);
    const displayTitle = proposalUtils.getDisplayTitle(proposal, slug);
    const title =
        slug == null
            ? displayTitle
            : t('app.workspace.workspaceTodoList.proposal.title', {
                  slug,
                  title: displayTitle,
              });

    // Guarded rather than trusted: a relative format of an invalid instant throws, and a missing end must not take
    // the whole overview down with it.
    const date = Number.isFinite(proposal.voteEndDate)
        ? formatterUtils.formatDate(proposal.voteEndDate * 1000, {
              format: DateFormat.RELATIVE,
          })
        : undefined;

    const accountId = workspaceUtils.buildAccountId({
        network: proposal.network,
        address: proposal.daoAddress,
    });
    const href =
        slug == null
            ? workspaceUtils.getAccountScopeUrl(
                  workspaceId,
                  accountId,
                  'proposals',
              )
            : workspaceUtils.getAccountScopeUrl(
                  workspaceId,
                  accountId,
                  `proposals/${slug}`,
              );

    return (
        <WorkspaceTodoItem
            action={{
                label: t('app.workspace.workspaceTodoList.proposal.action'),
                variant: 'primary',
                href,
            }}
            avatar={
                <DaoAvatar
                    className="shrink-0"
                    name={dao.name}
                    size="md"
                    src={ipfsUtils.cidToSrc(dao.avatar)}
                />
            }
            meta={
                date == null
                    ? t('app.workspace.workspaceTodoList.proposal.action')
                    : t('app.workspace.workspaceTodoList.proposal.meta', {
                          date,
                      })
            }
            title={title}
        />
    );
};
