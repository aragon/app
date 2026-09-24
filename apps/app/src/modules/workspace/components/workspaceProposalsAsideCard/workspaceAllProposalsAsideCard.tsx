'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { useWorkspaceProposalList } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { buildWorkspaceProposalListParams } from '../workspaceProposalList';

export interface IWorkspaceAllProposalsAsideCardProps {
    /**
     * DAO accounts the proposals are read from.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of proposals the list next to the card reads per page. The stats come out of the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
    /**
     * Title of the card, defaulting to the generic aggregated-view title.
     */
    title?: string;
}

/**
 * Stats of the aggregated proposal view, displayed on the aside of the workspace proposals page.
 *
 * Mirrors `ProposalListStats` of the DAO page, minus the stats that do not generalize across DAOs: the plugin count
 * is replaced by the number of DAOs, and there is no governance-settings link because there is no single DAO to
 * point at. An account tab renders `WorkspaceDaoProposalsAsideCard` instead.
 */
export const WorkspaceAllProposalsAsideCard: React.FC<
    IWorkspaceAllProposalsAsideCardProps
> = (props) => {
    const { accounts, pageSize, title } = props;

    const { t } = useTranslations();

    // Unfiltered first page of the list: it carries the total count and the most recent proposal. Shares its key
    // with the list's own query, so the stats cost no request of their own.
    const { data: proposals } = useWorkspaceProposalList(
        buildWorkspaceProposalListParams(accounts, pageSize),
        { enabled: accounts.length > 0 },
    );

    const firstPage = proposals?.pages[0];
    const proposalsCount = firstPage?.metadata.totalRecords;

    // The endpoint always sorts by creation time, so the most recent proposal of the selection is the first row.
    const mostRecentTimestamp = firstPage?.data[0]?.blockTimestamp;

    // Relative time is computed against "now", so the server and the client render different text — format only
    // after mount to avoid a hydration mismatch, as `ProposalListStats` does.
    const isMounted = useIsMounted();

    const formattedDate =
        isMounted && mostRecentTimestamp != null
            ? formatterUtils.formatDate(mostRecentTimestamp * 1000, {
                  format: DateFormat.RELATIVE,
              })
            : undefined;

    const [dateValue, dateUnit] = formattedDate?.split(' ') ?? [
        undefined,
        undefined,
    ];

    const formatCount = (value?: number) =>
        value != null
            ? (formatterUtils.formatNumber(value, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';

    const stats = [
        {
            label: t('app.workspace.workspaceAllProposalsAsideCard.total'),
            value: formatCount(proposalsCount),
            suffix: undefined as string | undefined,
        },
        {
            label: t('app.workspace.workspaceAllProposalsAsideCard.daos'),
            value: formatCount(accounts.length),
            suffix: undefined,
        },
        {
            label: t('app.workspace.workspaceAllProposalsAsideCard.mostRecent'),
            value: dateValue ?? '-',
            suffix: dateUnit
                ? t('app.workspace.workspaceAllProposalsAsideCard.recentUnit', {
                      unit: dateUnit,
                  })
                : undefined,
        },
    ];

    const cardTitle =
        title ?? t('app.workspace.workspaceAllProposalsAsideCard.allProposals');

    return (
        <Page.AsideCard title={cardTitle}>
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        suffix={stat.suffix}
                        value={stat.value}
                    />
                ))}
            </div>
        </Page.AsideCard>
    );
};
