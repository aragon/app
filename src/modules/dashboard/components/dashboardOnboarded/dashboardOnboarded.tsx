'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import { AssetList } from '@/modules/finance/components/assetList';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import { daoProposalsPageFilterParam } from '@/modules/governance/pages/daoProposalsPage';
import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    daoDashboardPageMembersFilterParam,
    daoDashboardPageProposalsFilterParam,
} from '../../pages/daoDashboardPage';

const dashboardProposalsCount = 3;
const dashboardMembersCount = 6;
const dashboardAssetsCount = 3;

export interface IDashboardOnboardedProps {
    /**
     * The DAO data.
     */
    dao: IDao;
}

export const DashboardOnboarded: React.FC<IDashboardOnboardedProps> = (
    props,
) => {
    const { dao } = props;

    const { t } = useTranslations();

    const { activePlugin: membersPlugin, setActivePlugin: setMembersPlugin } =
        useDaoPluginFilterUrlParam({
            daoId: dao.id,
            type: PluginType.BODY,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
            name: daoDashboardPageMembersFilterParam,
        });

    const {
        activePlugin: proposalsPlugin,
        setActivePlugin: setProposalsPlugin,
    } = useDaoPluginFilterUrlParam({
        daoId: dao.id,
        type: PluginType.PROCESS,
        includeGroupFilter: true,
        includeLinkedAccounts: true,
        name: daoDashboardPageProposalsFilterParam,
    });

    const daoUrl = daoUtils.getDaoUrl(dao)!;
    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const proposalListParams = {
        queryParams: {
            daoId: dao.id,
            pageSize: dashboardProposalsCount,
            sort: 'blockTimestamp',
            isSubProposal: false,
        },
    };
    const memberListParams = {
        queryParams: { daoId: dao.id, pageSize: dashboardMembersCount },
    };
    const assetListParams = {
        queryParams: { daoId: dao.id, pageSize: dashboardAssetsCount },
    };

    const membersPageUrl = `${daoUrl}/members?${daoMembersPageFilterParam}=${membersPlugin?.uniqueId ?? ''}`;
    const proposalsPageUrl = `${daoUrl}/proposals?${daoProposalsPageFilterParam}=${proposalsPlugin?.uniqueId ?? ''}`;

    return (
        <>
            {hasSupportedPlugins && (
                <Page.MainSection
                    title={t(
                        'app.dashboard.daoDashboardPage.main.proposals.title',
                    )}
                >
                    <DaoProposalList
                        hidePagination={true}
                        initialParams={proposalListParams}
                        onValueChange={setProposalsPlugin}
                        value={proposalsPlugin}
                    >
                        <Button
                            className="self-start"
                            href={proposalsPageUrl}
                            iconRight={IconType.CHEVRON_RIGHT}
                            size="md"
                            variant="tertiary"
                        >
                            {t('app.dashboard.daoDashboardPage.main.viewAll')}
                        </Button>
                    </DaoProposalList>
                </Page.MainSection>
            )}
            {hasSupportedPlugins && (
                <Page.MainSection
                    title={t(
                        'app.dashboard.daoDashboardPage.main.members.title',
                    )}
                >
                    <DaoMemberList.Container
                        hidePagination={true}
                        initialParams={memberListParams}
                        onValueChange={setMembersPlugin}
                        value={membersPlugin}
                    >
                        <Button
                            className="self-start"
                            href={membersPageUrl}
                            iconRight={IconType.CHEVRON_RIGHT}
                            size="md"
                            variant="tertiary"
                        >
                            {t('app.dashboard.daoDashboardPage.main.viewAll')}
                        </Button>
                    </DaoMemberList.Container>
                </Page.MainSection>
            )}
            <Page.MainSection
                title={t('app.dashboard.daoDashboardPage.main.assets.title')}
            >
                <AssetList.Default
                    hidePagination={true}
                    initialParams={assetListParams}
                >
                    <Button
                        className="self-start"
                        href={`${daoUrl}/assets`}
                        iconRight={IconType.CHEVRON_RIGHT}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.dashboard.daoDashboardPage.main.viewAll')}
                    </Button>
                </AssetList.Default>
            </Page.MainSection>
        </>
    );
};
