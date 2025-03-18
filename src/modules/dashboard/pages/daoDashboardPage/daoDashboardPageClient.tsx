'use client';

import { DaoSlotId } from '@/daos/constants/slots';
import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    Button,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    IconType,
    Link,
    NumberFormat,
    addressUtils,
    formatterUtils,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { DefaultHeader } from '../../components';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const dashboardProposalsCount = 3;
const dashboardMembersCount = 6;
const dashboardAssetsCount = 3;

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const proposalsCreated = formatterUtils.formatNumber(dao?.metrics.proposalsCreated, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const membersCount = formatterUtils.formatNumber(dao?.metrics.members, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(dao?.metrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const stats = [
        { value: proposalsCreated, label: t('app.dashboard.daoDashboardPage.header.stat.proposals') },
        { value: membersCount, label: t('app.dashboard.daoDashboardPage.header.stat.members') },
        { value: daoTvl, label: t('app.dashboard.daoDashboardPage.header.stat.treasury'), suffix: 'USD' },
    ];

    const { buildEntityUrl } = useBlockExplorer();

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao?.address);

    if (dao == null) {
        return null;
    }

    const proposalListParams = { queryParams: { daoId, pageSize: dashboardProposalsCount } };
    const memberListParams = { queryParams: { daoId, pageSize: dashboardMembersCount } };
    const assetListParams = {
        queryParams: { address: dao.address, network: dao.network, pageSize: dashboardAssetsCount },
    };

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const daoLaunchedAt = formatterUtils.formatDate(dao.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    const { id: chainId } = networkDefinitions[dao.network];
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address, chainId });
    const daoCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: dao.transactionHash, chainId });

    return (
        <>
            <PluginSingleComponent
                slotId={DaoSlotId.DASHBOARD_HEADER}
                Fallback={DefaultHeader}
                title={dao.name}
                description={dao.description}
                daoId={dao.id}
                pluginId="OxPlugin"
                stats={stats.filter((stat) => stat.value !== membersCount)}
            />
            <Page.Content>
                <Page.Main>
                    {hasSupportedPlugins && (
                        <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.proposals.title')}>
                            <DaoProposalList.Container initialParams={proposalListParams} hidePagination={true}>
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={`/dao/${daoId}/proposals`}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoProposalList.Container>
                        </Page.MainSection>
                    )}
                    <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.assets.title')}>
                        <AssetList initialParams={assetListParams} hidePagination={true}>
                            <Button
                                className="self-start"
                                variant="tertiary"
                                size="md"
                                iconRight={IconType.CHEVRON_RIGHT}
                                href={`/dao/${daoId}/assets`}
                            >
                                {t('app.dashboard.daoDashboardPage.main.viewAll')}
                            </Button>
                        </AssetList>
                    </Page.MainSection>
                    {hasSupportedPlugins && (
                        <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.members.title')}>
                            <DaoMemberList.Container initialParams={memberListParams} hidePagination={true}>
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={`/dao/${daoId}/members`}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoMemberList.Container>
                        </Page.MainSection>
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title={t('app.dashboard.daoDashboardPage.aside.details.title')}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.chain')}>
                                <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.address')}>
                                <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                                    {truncatedAddress}
                                </Link>
                            </DefinitionList.Item>
                            {daoEns != null && (
                                <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.ens')}>
                                    <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                                        {daoEns}
                                    </Link>
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.launched')}>
                                <Link iconRight={IconType.LINK_EXTERNAL} href={daoCreationLink} target="_blank">
                                    {daoLaunchedAt}
                                </Link>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {dao.links.length > 0 && (
                        <Page.AsideCard
                            title={t('app.dashboard.daoDashboardPage.aside.links')}
                            className="flex flex-col gap-4"
                        >
                            {dao.links.map(({ url, name }) => (
                                <Link key={url} iconRight={IconType.LINK_EXTERNAL} description={url} href={url}>
                                    {name}
                                </Link>
                            ))}
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
