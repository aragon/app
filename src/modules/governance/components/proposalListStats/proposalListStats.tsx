import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, DateFormat, formatterUtils, Heading, IconType } from '@aragon/gov-ui-kit';
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

    const executedParams = { ...initialParams, queryParams: { ...initialParams.queryParams, isExecuted: true } };
    const { itemsCount: executedCount } = useProposalListData(executedParams);

    const plugins = useDaoPlugins({ daoId, type: PluginType.PROCESS });
    const buttonUrl = daoUtils.getDaoUrl(dao, 'settings');

    const latestProposalDate =
        proposalList != null && proposalList.length > 0 ? proposalList[0].blockTimestamp * 1000 : undefined;
    const formattedProposalDate = formatterUtils.formatDate(latestProposalDate, { format: DateFormat.RELATIVE });

    const [proposalDateValue, proposalDateUnit] = formattedProposalDate?.split(' ') ?? [undefined, undefined];
    const proposalDateSuffix = t('app.governance.proposalListStats.recentUnit', { unit: proposalDateUnit });

    const stats = [
        { label: t('app.governance.proposalListStats.total'), value: itemsCount ?? '-' },
        { label: t('app.governance.proposalListStats.types'), value: plugins?.length ?? '-' },
        { label: t('app.governance.proposalListStats.executed'), value: executedCount ?? '-' },
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
                    <div key={stat.label} className="flex flex-col gap-y-1 rounded-xl bg-neutral-50 p-4">
                        <Heading size="h3">
                            {stat.value}
                            {stat.suffix != null && (
                                <span className="text-xs text-neutral-500 md:text-sm">{stat.suffix}</span>
                            )}
                        </Heading>
                        <p className="text-sm text-neutral-500">{stat.label}</p>
                    </div>
                ))}
            </div>
            <Button variant="tertiary" size="md" iconRight={IconType.CHEVRON_RIGHT} href={buttonUrl}>
                {t('app.governance.proposalListStats.button')}
            </Button>
        </div>
    );
};
