'use client';

import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import { daoProposalsPageFilterParam } from '@/modules/governance/pages/daoProposalsPage';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    Button,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    IconType,
    Link,
    addressUtils,
    formatterUtils,
} from '@aragon/gov-ui-kit';
import { DashboardDefaultHeader } from '../../components/dashboardDefaultHeader';
import { DashboardDaoSlotId } from '../../constants/moduleDaoSlots';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const dashboardProposalsCount = 3;
const dashboardMembersCount = 6;
const dashboardAssetsCount = 3;

export const daoDashboardPageMembersFilterParam = 'members';
export const daoDashboardPageProposalsFilterParam = 'proposals';

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const { buildEntityUrl, networkDefinition } = useDaoChain({ network: dao?.network });

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao?.address);

    const { activePlugin: membersPlugin, setActivePlugin: setMembersPlugin } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        name: daoDashboardPageMembersFilterParam,
    });

    const { activePlugin: proposalsPlugin, setActivePlugin: setProposalsPlugin } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.PROCESS,
        includeGroupFilter: true,
        name: daoDashboardPageProposalsFilterParam,
    });

    if (dao == null) {
        return null;
    }

    const daoUrl = daoUtils.getDaoUrl(dao)!;

    const proposalListParams = {
        queryParams: { daoId, pageSize: dashboardProposalsCount, sort: 'blockTimestamp', isSubProposal: false },
    };

    const memberListParams = { queryParams: { daoId, pageSize: dashboardMembersCount } };
    const assetListParams = {
        queryParams: { address: dao.address, network: dao.network, pageSize: dashboardAssetsCount },
    };

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const daoLaunchedAt = formatterUtils.formatDate(dao.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address });
    const daoCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: dao.transactionHash });

    const membersPageUrl = `${daoUrl}/members?${daoMembersPageFilterParam}=${membersPlugin?.uniqueId ?? ''}`;
    const proposalsPageUrl = `${daoUrl}/proposals?${daoProposalsPageFilterParam}=${proposalsPlugin?.uniqueId ?? ''}`;

    return (
        <>
            <PluginSingleComponent
                slotId={DashboardDaoSlotId.DASHBOARD_DAO_HEADER}
                Fallback={DashboardDefaultHeader}
                dao={dao}
                pluginId={dao.id}
            />
            <Page.Content>
                <Page.Main>
                    {hasSupportedPlugins && (
                        <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.proposals.title')}>
                            <DaoProposalList
                                initialParams={proposalListParams}
                                hidePagination={true}
                                value={proposalsPlugin}
                                onValueChange={setProposalsPlugin}
                            >
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={proposalsPageUrl}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoProposalList>
                        </Page.MainSection>
                    )}
                    {hasSupportedPlugins && (
                        <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.members.title')}>
                            <DaoMemberList.Container
                                initialParams={memberListParams}
                                hidePagination={true}
                                value={membersPlugin}
                                onValueChange={setMembersPlugin}
                            >
                                <Button
                                    className="self-start"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.CHEVRON_RIGHT}
                                    href={membersPageUrl}
                                >
                                    {t('app.dashboard.daoDashboardPage.main.viewAll')}
                                </Button>
                            </DaoMemberList.Container>
                        </Page.MainSection>
                    )}
                    <Page.MainSection title={t('app.dashboard.daoDashboardPage.main.assets.title')}>
                        <AssetList.Default initialParams={assetListParams} hidePagination={true}>
                            <Button
                                className="self-start"
                                variant="tertiary"
                                size="md"
                                iconRight={IconType.CHEVRON_RIGHT}
                                href={`${daoUrl}/assets`}
                            >
                                {t('app.dashboard.daoDashboardPage.main.viewAll')}
                            </Button>
                        </AssetList.Default>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title={t('app.dashboard.daoDashboardPage.aside.details.title')}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.chain')}>
                                <p className="text-neutral-500">{networkDefinition?.name}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.dashboard.daoDashboardPage.aside.details.address')}
                                copyValue={dao.address}
                                link={{ href: daoAddressLink }}
                            >
                                {truncatedAddress}
                            </DefinitionList.Item>
                            {daoEns != null && (
                                <DefinitionList.Item
                                    term={t('app.dashboard.daoDashboardPage.aside.details.ens')}
                                    copyValue={daoEns}
                                    link={{ href: daoAddressLink }}
                                >
                                    {daoEns}
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item
                                term={t('app.dashboard.daoDashboardPage.aside.details.launched')}
                                link={{ href: daoCreationLink }}
                            >
                                {daoLaunchedAt}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {dao.links.length > 0 && (
                        <Page.AsideCard
                            title={t('app.dashboard.daoDashboardPage.aside.links')}
                            className="flex flex-col gap-4"
                        >
                            {dao.links.map(({ url, name }) => (
                                <Link key={url} href={url} isExternal={true} showUrl={true}>
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
