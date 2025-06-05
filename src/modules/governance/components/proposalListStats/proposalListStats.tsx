import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, DateFormat, formatterUtils, Heading, IconType } from '@aragon/gov-ui-kit';
import { useProposalListData } from '../../hooks/useProposalListData';

export interface IProposalListStatsProps {
    /**
     * The DAO for which the proposal list statistics are being displayed.
     */
    dao: IDao;
}

export const ProposalListStats: React.FC<IProposalListStatsProps> = (props) => {
    const { dao } = props;

    const daoId = dao.id;

    const { t } = useTranslations();

    const daoUrl = daoUtils.getDaoUrl(dao, 'settings');

    const queryParams = {
        daoId,
        sort: 'blockTimestamp',
        isSubProposal: false,
    };

    const { proposalList, itemsCount } = useProposalListData({ queryParams });

    const executedQueryParams = {
        ...queryParams,
        isExecuted: true,
    };

    const { itemsCount: executedCount } = useProposalListData({ queryParams: executedQueryParams });

    const plugins = useDaoPlugins({ daoId, type: PluginType.PROCESS });

    const formatMostRecent = () => {
        const formattedDate =
            formatterUtils.formatDate(proposalList != null ? proposalList[0].blockTimestamp * 1000 : undefined, {
                format: DateFormat.RELATIVE,
            }) ?? '-';

        const [value, unit] = formattedDate.split(' ');

        if (!value || !unit) {
            return { value: formattedDate, suffix: '' };
        }

        const suffix = t('app.governance.daoProposalsPage.aside.proposalListStats.recentUnit', {
            unit,
        });

        return { value, suffix };
    };

    const formattedMostRecent = formatMostRecent();

    const stats = [
        {
            id: 'total',
            label: t('app.governance.daoProposalsPage.aside.proposalListStats.total'),
            value: itemsCount ?? '-',
        },
        {
            id: 'types',
            label: t('app.governance.daoProposalsPage.aside.proposalListStats.types'),
            value: plugins?.length ?? '-',
        },
        {
            id: 'executed',
            label: t('app.governance.daoProposalsPage.aside.proposalListStats.executed'),
            value: executedCount ?? '-',
        },
        {
            id: 'mostRecent',
            label: t('app.governance.daoProposalsPage.aside.proposalListStats.mostRecent'),
            value: formattedMostRecent.value,
            suffix: formattedMostRecent.suffix,
        },
    ];

    return (
        <div className="flex w-full flex-col gap-y-4 md:gap-y-6">
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <div key={stat.id} className="flex flex-col gap-y-1 rounded-xl bg-neutral-50 p-4">
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
            <Button variant="tertiary" size="md" iconRight={IconType.CHEVRON_RIGHT} href={daoUrl}>
                {t('app.governance.daoProposalsPage.aside.proposalListStats.button')}
            </Button>
        </div>
    );
};
