'use client';

import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    Button,
    DaoAvatar,
    DefinitionList,
    Dropdown,
    IconType,
    Link,
    NumberFormat,
    addressUtils,
    clipboardUtils,
    formatterUtils,
    ssrUtils,
} from '@aragon/ods';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

const dashboardMembersCount = 6;

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (props) => {
    const { id } = props;

    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const proposalsCreated = formatterUtils.formatNumber(dao?.metrics.proposalsCreated, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const membersCount = formatterUtils.formatNumber(dao?.metrics.members, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(dao?.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const stats = [
        { value: proposalsCreated, label: t('app.dashboard.daoDashboardPage.header.stat.proposals') },
        { value: membersCount, label: t('app.dashboard.daoDashboardPage.header.stat.members') },
        { value: daoTvl, label: t('app.dashboard.daoDashboardPage.header.stat.treasury'), suffix: 'USD' },
    ];

    const truncatedAddress = addressUtils.truncateAddress(dao?.address);

    const memberListParams = { queryParams: { daoId: id, pageSize: dashboardMembersCount } };

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const dropdownLabel = dao?.ens ?? truncatedAddress;
    const pageUrl = ssrUtils.isServer() ? '' : window.location.href.replace(/(http(s?)):\/\//, '');

    return (
        <>
            <Page.Header
                title={dao?.name}
                description={dao?.description}
                stats={stats}
                avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao?.avatar)} name={dao?.name} size="2xl" />}
            >
                <div className="flex flex-row gap-4">
                    <Dropdown.Container size="md" label={dropdownLabel}>
                        {dao?.ens != null && (
                            <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(dao.ens!)}>
                                {dao.ens}
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(dao!.address)}>
                            {truncatedAddress}
                        </Dropdown.Item>
                        <Dropdown.Item
                            icon={IconType.COPY}
                            onClick={() => clipboardUtils.copy(pageUrl)}
                            className="max-w-48"
                        >
                            {pageUrl}
                        </Dropdown.Item>
                    </Dropdown.Container>
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    <Page.Section title={t('app.dashboard.daoDashboardPage.main.assets.title')}>
                        <AssetList hidePagination={true}>
                            <Button
                                className="self-start"
                                variant="tertiary"
                                size="md"
                                iconRight={IconType.CHEVRON_RIGHT}
                                href={`/dao/${id}/assets`}
                            >
                                {t('app.dashboard.daoDashboardPage.main.viewAll')}
                            </Button>
                        </AssetList>
                    </Page.Section>
                    {hasSupportedPlugins && (
                        <Page.Section title={t('app.dashboard.daoDashboardPage.main.members.title')}>
                            <DaoMemberList initialParams={memberListParams} hidePagination={true}>
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={`/dao/${id}/members`}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoMemberList>
                        </Page.Section>
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.Section title={t('app.dashboard.daoDashboardPage.aside.details.title')}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.blockchain')}>
                                <p className="text-neutral-500">{networkDefinitions[dao!.network].name}</p>
                            </DefinitionList.Item>
                            {/* TODO: add links to block explorer creation date */}
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.address')}>
                                <Link iconRight={IconType.LINK_EXTERNAL}>{truncatedAddress}</Link>
                            </DefinitionList.Item>
                            {dao?.ens && (
                                <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.ens')}>
                                    <Link iconRight={IconType.LINK_EXTERNAL}>{dao.ens}</Link>
                                </DefinitionList.Item>
                            )}
                            {/* TODO: add formatted creation date */}
                        </DefinitionList.Container>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
