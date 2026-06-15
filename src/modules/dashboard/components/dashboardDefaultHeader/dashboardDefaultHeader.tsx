import { DaoAvatar, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IDashboardDefaultHeaderProps {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const DashboardDefaultHeader: React.FC<IDashboardDefaultHeaderProps> = (
    props,
) => {
    const { dao } = props;
    const daoDisplayName = daoUtils.getDaoDisplayName(dao);

    const { t } = useTranslations();

    const { itemsCount: proposalsCount } = useProposalListData({
        queryParams: {
            daoId: dao.id,
            pageSize: 1,
            sort: 'blockTimestamp',
            isSubProposal: false,
            onlyActive: true,
            includeLinkedAccounts: true,
        },
    });

    const proposalsCreated =
        proposalsCount != null
            ? formatterUtils.formatNumber(proposalsCount, {
                  format: NumberFormat.GENERIC_SHORT,
              })
            : '-';

    const membersCount = formatterUtils.formatNumber(dao.metrics.members, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(dao.metrics.tvlUSD, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
    });

    const stats = [
        {
            value: proposalsCreated,
            label: t('app.dashboard.dashboardDefaultHeader.stat.proposals'),
        },
        {
            value: membersCount,
            label: t('app.dashboard.dashboardDefaultHeader.stat.members'),
        },
        {
            value: daoTvl,
            label: t('app.dashboard.dashboardDefaultHeader.stat.treasury'),
            suffix: 'USD',
        },
    ];

    return (
        <Page.Header
            avatar={
                <DaoAvatar
                    name={daoDisplayName}
                    size="2xl"
                    src={ipfsUtils.cidToSrc(dao.avatar)}
                />
            }
            description={dao.description}
            stats={stats}
            title={daoDisplayName}
        />
    );
};
