import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useCurrentUrl } from '@/shared/hooks/useCurrentUrl';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    clipboardUtils,
    DaoAvatar,
    Dropdown,
    formatterUtils,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';

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
    const pageUrl = useCurrentUrl();

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao.address);

    const dropdownLabel = daoEns ?? truncatedAddress;

    return (
        <Page.Header
            title={dao.name}
            description={dao.description}
            stats={stats}
            avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao.avatar)} name={dao.name} size="2xl" />}
        >
            <div className="flex flex-row gap-4">
                <Dropdown.Container
                    contentClassNames="max-w-52"
                    constrainContentWidth={false}
                    size="md"
                    label={dropdownLabel}
                >
                    {daoEns != null && (
                        <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(daoEns)}>
                            {daoEns}
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(dao.address)}>
                        {truncatedAddress}
                    </Dropdown.Item>
                    <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(pageUrl)}>
                        {pageUrl}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </Page.Header>
    );
};
