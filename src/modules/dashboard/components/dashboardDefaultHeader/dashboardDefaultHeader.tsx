import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';

export interface IDashboardDefaultHeaderProps {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const DashboardDefaultHeader: React.FC<IDashboardDefaultHeaderProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    const proposalsCreated = formatterUtils.formatNumber(dao.metrics.proposalsCreated, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const membersCount = formatterUtils.formatNumber(dao.metrics.members, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(dao.metrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const stats = [
        { value: proposalsCreated, label: t('app.dashboard.dashboardDefaultHeader.stat.proposals') },
        { value: membersCount, label: t('app.dashboard.dashboardDefaultHeader.stat.members') },
        { value: daoTvl, label: t('app.dashboard.dashboardDefaultHeader.stat.treasury'), suffix: 'USD' },
    ];

    return (
        <Page.Header
            title={dao.name}
            description={dao.description}
            stats={stats}
            avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao.avatar)} name={dao.name} size="2xl" />}
        />
    );
};
