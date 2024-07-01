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
    ChainEntityType,
    DaoAvatar,
    DateFormat,
    DefinitionList,
    Dropdown,
    IconType,
    Link,
    NumberFormat,
    addressUtils,
    clipboardUtils,
    formatterUtils,
    ssrUtils,
    useBlockExplorer,
} from '@aragon/ods';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const dashboardMembersCount = 6;

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { getChainEntityUrl } = useBlockExplorer();

    const useDaoParams = { id: daoId };
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

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao?.address);

    const memberListParams = { queryParams: { daoId, pageSize: dashboardMembersCount } };

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const dropdownLabel = daoEns ?? truncatedAddress;
    const pageUrl = ssrUtils.isServer() ? '' : window.location.href.replace(/(http(s?)):\/\//, '');

    const daoAddressLink = getChainEntityUrl({
        type: ChainEntityType.ADDRESS,
        chainId: dao ? networkDefinitions[dao.network].chainId : undefined,
        id: dao?.address,
    });

    const daoCreationLink = getChainEntityUrl({
        type: ChainEntityType.TRANSACTION,
        chainId: dao ? networkDefinitions[dao.network].chainId : undefined,
        id: dao?.transactionHash,
    });

    const daoLaunchedAt = formatterUtils.formatDate((dao?.blockTimestamp ?? 0) * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    if (dao == null) {
        return null;
    }

    return (
        <>
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
            <Page.Content>
                <Page.Main>
                    <Page.Section title={t('app.dashboard.daoDashboardPage.main.assets.title')}>
                        <AssetList hidePagination={true}>
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
                    </Page.Section>
                    {hasSupportedPlugins && (
                        <Page.Section title={t('app.dashboard.daoDashboardPage.main.members.title')}>
                            <DaoMemberList initialParams={memberListParams} hidePagination={true}>
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={`/dao/${daoId}/members`}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoMemberList>
                        </Page.Section>
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.Section title={t('app.dashboard.daoDashboardPage.aside.details.title')} inset={false}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.blockchain')}>
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
                    </Page.Section>
                    {dao.links.length > 0 && (
                        <Page.Section
                            title={t('app.dashboard.daoDashboardPage.aside.links')}
                            className="flex flex-col gap-4"
                        >
                            {dao.links.map(({ url, name }) => (
                                <Link key={url} iconRight={IconType.LINK_EXTERNAL} description={url} href={url}>
                                    {name}
                                </Link>
                            ))}
                        </Page.Section>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
