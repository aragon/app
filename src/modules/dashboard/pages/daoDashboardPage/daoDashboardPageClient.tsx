'use client';

import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { Button, DaoAvatar, DefinitionList, Dropdown, IconType, Link, addressUtils } from '@aragon/ods';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (props) => {
    const { id } = props;

    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const stats = [
        { value: '69', label: t('app.dashboard.daoDashboardPage.header.stat.proposals') },
        { value: '420k', label: t('app.dashboard.daoDashboardPage.header.stat.members') },
        { value: '42.69M', label: t('app.dashboard.daoDashboardPage.header.stat.treasury'), suffix: 'USD' },
    ];

    const truncatedAddress = addressUtils.truncateAddress(dao?.address);
    const hasSupportedPlugins = dao?.plugins.some(
        ({ subdomain }) => subdomain === 'multisig' || subdomain === 'token-voting',
    );

    return (
        <>
            <Page.Header
                title={dao?.name}
                description={dao?.description}
                stats={stats}
                avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao?.avatar)} name={dao?.name} size="2xl" />}
            >
                <div className="flex flex-row gap-4">
                    <Button variant="secondary" size="md" disabled={true}>
                        {t('app.dashboard.daoDashboardPage.header.action.follow')}
                    </Button>
                    <Dropdown.Container size="md" label="patito.dao.eth">
                        <Dropdown.Item icon={IconType.COPY}>{truncatedAddress}</Dropdown.Item>
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
                            <DaoMemberList slug={dao!.permalink} hidePagination={true}>
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={`/dao/${dao?.permalink}/members`}
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
                                <p className="text-neutral-500">Ethereum Mainnet</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.address')}>
                                <Link iconRight={IconType.LINK_EXTERNAL}>{truncatedAddress}</Link>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
