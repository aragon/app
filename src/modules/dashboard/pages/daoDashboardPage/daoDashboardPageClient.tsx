'use client';

import { DaoSlotId } from '@/daos/constants/slots';
import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { DefaultHeader } from '../../components/defaultHeader';
import { DefaultAside } from '../../components/defaaultAside';

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

    if (dao == null) {
        return null;
    }

    const proposalListParams = { queryParams: { daoId, pageSize: dashboardProposalsCount } };
    const memberListParams = { queryParams: { daoId, pageSize: dashboardMembersCount } };
    const assetListParams = {
        queryParams: { address: dao.address, network: dao.network, pageSize: dashboardAssetsCount },
    };

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    return (
        <>
            <PluginSingleComponent
                pluginId={dao.id}
                slotId={DaoSlotId.DASHBOARD_HEADER}
                Fallback={DefaultHeader}
                dao={dao}
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
                <PluginSingleComponent
                    pluginId={dao.id}
                    slotId={DaoSlotId.DASHBOARD_ASIDE}
                    Fallback={DefaultAside}
                    dao={dao}
                />
            </Page.Content>
        </>
    );
};
