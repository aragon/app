'use client';

import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceMemberList } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import { buildWorkspaceMemberListParams } from '../workspaceMemberList';

export interface IWorkspaceAllMembersAsideCardProps {
    /**
     * Account option selected on the page. Only its label is used, as the page it sits on aggregates every account;
     * the members of a single account are the account-scoped route, which renders the members page of that account
     * and its own aside.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Accounts the members are read from, i.e. what the aggregated option covers.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of members the list next to the card reads per page. The stats come out of the list's own first page,
     * so both must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Stats of the aggregated member view, displayed on the aside of the workspace members page.
 *
 * Mirrors `WorkspaceAllProposalsAsideCard`, minus the most-recent stat, which members have no equivalent of. There
 * is no per-account-type branch beside it, unlike the proposals and assets asides: a single account never reaches
 * this page, the account-scoped members route rendering the DAO members page instead. A selected body does get a
 * card of its own — `WorkspaceBodyMembersAsideCard`, which the dispatcher reaches first.
 */
export const WorkspaceAllMembersAsideCard: React.FC<
    IWorkspaceAllMembersAsideCardProps
> = (props) => {
    const { activeOption, accounts, pageSize } = props;

    const { t } = useTranslations();

    // Unfiltered first page of the list: it carries the total count and the partial flag. Shares its key with the
    // list's own query, so the stats cost no request of their own.
    const { data: members } = useWorkspaceMemberList(
        buildWorkspaceMemberListParams(accounts, pageSize),
        { enabled: accounts.length > 0 },
    );

    const firstPage = members?.pages[0];
    const membersCount = firstPage?.metadata.totalRecords;

    const formatCount = (value?: number) =>
        value != null
            ? (formatterUtils.formatNumber(value, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';

    const formattedCount = formatCount(membersCount);

    const stats = [
        {
            label: t('app.workspace.workspaceMembersAsideCard.total'),
            // Unread accounts are missing from the count, so it is only a lower bound — the same count the list
            // flags as incomplete must not read as exact here.
            value:
                firstPage?.partial && membersCount != null
                    ? `${formattedCount}+`
                    : formattedCount,
        },
        {
            label: t('app.workspace.workspaceMembersAsideCard.accounts'),
            value: formatCount(accounts.length),
        },
    ];

    const cardTitle =
        activeOption?.label ??
        t('app.workspace.workspaceMembersAsideCard.allMembers');

    return (
        <Page.AsideCard title={cardTitle}>
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                    />
                ))}
            </div>
        </Page.AsideCard>
    );
};
