'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';

export interface IWorkspaceProposalsAsideCardProps {
    /**
     * Title of the card, i.e. the label of the selected tab.
     */
    title: string;
    /**
     * Number of proposals of the selection.
     */
    proposalsCount?: number;
    /**
     * Number of DAO accounts the proposals are read from.
     */
    daosCount: number;
    /**
     * Creation timestamp of the most recent proposal, in seconds.
     */
    mostRecentTimestamp?: number;
}

/**
 * Stats of the aggregated proposal view, displayed on the aside of the workspace proposals page.
 *
 * Mirrors `ProposalListStats` of the DAO page, minus the stats that do not generalize across DAOs: the plugin count
 * is replaced by the number of DAOs, and there is no governance-settings link because there is no single DAO to
 * point at. The account tabs render `ProposalListStats` itself instead.
 */
export const WorkspaceProposalsAsideCard: React.FC<
    IWorkspaceProposalsAsideCardProps
> = (props) => {
    const { title, proposalsCount, daosCount, mostRecentTimestamp } = props;

    const { t } = useTranslations();

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
            label: t('app.workspace.workspaceProposalsAsideCard.total'),
            value: formatCount(proposalsCount),
            suffix: undefined as string | undefined,
        },
        {
            label: t('app.workspace.workspaceProposalsAsideCard.daos'),
            value: formatCount(daosCount),
            suffix: undefined,
        },
        {
            label: t('app.workspace.workspaceProposalsAsideCard.mostRecent'),
            value: dateValue ?? '-',
            suffix: dateUnit
                ? t('app.workspace.workspaceProposalsAsideCard.recentUnit', {
                      unit: dateUnit,
                  })
                : undefined,
        },
    ];

    return (
        <Page.AsideCard title={title}>
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
