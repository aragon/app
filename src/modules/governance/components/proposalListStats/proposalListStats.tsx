import { Button, DateFormat, formatterUtils, IconType } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IGetProposalListParams } from '../../api/governanceService';
import { useProposalListData } from '../../hooks/useProposalListData';

export interface IProposalListStatsProps {
    /**
     * The DAO for which the proposal list statistics are being displayed.
     */
    dao: IDao;
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const ProposalListStats: React.FC<IProposalListStatsProps> = (props) => {
    const { dao, initialParams } = props;

    const daoId = dao.id;

    const { t } = useTranslations();

    const { proposalList, itemsCount } = useProposalListData(initialParams);

    const executedParams = {
        ...initialParams,
        queryParams: { ...initialParams.queryParams, isExecuted: true },
    };
    const { itemsCount: executedCount } = useProposalListData(executedParams);

    const plugins = useDaoPlugins({ daoId, type: PluginType.PROCESS });
    const buttonUrl = daoUtils.getDaoUrl(dao, 'settings#governance');

    const latestProposalDate = proposalList != null && proposalList.length > 0 ? proposalList[0].blockTimestamp * 1000 : undefined;
    const formattedProposalDate = formatterUtils.formatDate(latestProposalDate, {
        format: DateFormat.RELATIVE,
    });

    const [proposalDateValue, proposalDateUnit] = formattedProposalDate?.split(' ') ?? [undefined, undefined];
    const proposalDateSuffix = t('app.governance.proposalListStats.recentUnit', {
        unit: proposalDateUnit,
    });

    const stats = [
        {
            label: t('app.governance.proposalListStats.total'),
            value: itemsCount ?? '-',
        },
        {
            label: t('app.governance.proposalListStats.types'),
            value: plugins?.length ?? '-',
        },
        {
            label: t('app.governance.proposalListStats.executed'),
            value: executedCount ?? '-',
        },
        {
            label: t('app.governance.proposalListStats.mostRecent'),
            value: proposalDateValue ?? '-',
            suffix: proposalDateUnit ? proposalDateSuffix : undefined,
        },
    ];

    return (
        <div className="flex w-full flex-col gap-y-4 md:gap-y-6">
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard key={stat.label} label={stat.label} suffix={stat.suffix} value={stat.value} />
                ))}
            </div>
            <Button href={buttonUrl} iconRight={IconType.CHEVRON_RIGHT} size="md" variant="tertiary">
                {t('app.governance.proposalListStats.button')}
            </Button>
        </div>
    );
};
