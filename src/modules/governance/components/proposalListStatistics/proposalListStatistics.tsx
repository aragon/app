import type { IDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { DateFormat, formatterUtils, Heading } from '@aragon/gov-ui-kit';
import { useProposalListData } from '../../hooks/useProposalListData';

export interface IProposalListStatisticsProps {
    /**
     * The DAO for which the proposal list statistics are being displayed.
     */
    dao: IDao;
}

export const ProposalListStatistics: React.FC<IProposalListStatisticsProps> = (props) => {
    const { dao } = props;

    const queryParams = {
        daoId: dao.id,
    };

    const { proposalList, itemsCount } = useProposalListData({ queryParams });

    const executedQueryParams = {
        ...queryParams,
        isExecuted: true,
        sort: 'blockTimestamp',
    };

    const { itemsCount: executedCount } = useProposalListData({ queryParams: executedQueryParams });

    const plugins = useDaoPlugins({ daoId: dao.id });

    const stats = [
        { label: 'Total', value: itemsCount ?? '-' },
        {
            label: 'Types',
            value: plugins != null ? plugins.length : '-',
        },
        {
            label: 'Executed',
            value: executedCount ?? '-',
        },
        {
            label: 'Most recent',
            value:
                formatterUtils.formatDate(
                    proposalList ? proposalList[proposalList.length - 1].blockTimestamp * 1000 : undefined,
                    {
                        format: DateFormat.RELATIVE,
                    },
                ) ?? '-',
        },
    ];

    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-y-1 rounded-xl bg-neutral-50 p-4">
                    <Heading size="h3">{stat.value}</Heading>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};
