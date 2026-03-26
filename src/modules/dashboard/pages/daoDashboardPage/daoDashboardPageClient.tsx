'use client';

import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    Link,
} from '@aragon/gov-ui-kit';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DashboardDefaultHeader } from '../../components/dashboardDefaultHeader';
import { DashboardOnboarded } from '../../components/dashboardOnboarded';
import { DashboardOnboarding } from '../../components/dashboardOnboarding';
import { DashboardDaoSlotId } from '../../constants/moduleDaoSlots';

export interface IDaoDashboardPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const daoDashboardPageMembersFilterParam = 'members';
export const daoDashboardPageProposalsFilterParam = 'proposals';

export const DaoDashboardPageClient: React.FC<IDaoDashboardPageClientProps> = (
    props,
) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { buildEntityUrl, networkDefinition } = useDaoChain({
        network: dao?.network,
    });

    const { adminPlugin } = useAdminStatus({
        daoId,
        network: dao!.network,
    });

    const processPlugins =
        useDaoPlugins({ daoId, type: PluginType.PROCESS }) ?? [];

    if (dao == null) {
        return null;
    }

    const nonAdminProcessPlugins = processPlugins.filter(
        (plugin) => plugin.meta.interfaceType !== PluginInterfaceType.ADMIN,
    );

    const isOnboarding =
        adminPlugin != null && nonAdminProcessPlugins.length === 0;

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao.address);

    const daoLaunchedAt = formatterUtils.formatDate(dao.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    const daoAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: dao.address,
    });
    const daoCreationLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: dao.transactionHash,
    });

    return (
        <>
            {!isOnboarding && (
                <PluginSingleComponent
                    dao={dao}
                    Fallback={DashboardDefaultHeader}
                    pluginId={dao.id}
                    slotId={DashboardDaoSlotId.DASHBOARD_DAO_HEADER}
                />
            )}
            <Page.Content>
                <Page.Main>
                    {isOnboarding ? (
                        <DashboardOnboarding dao={dao} />
                    ) : (
                        <DashboardOnboarded dao={dao} />
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.dashboard.daoDashboardPage.aside.details.title',
                        )}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(
                                    'app.dashboard.daoDashboardPage.aside.details.chain',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {networkDefinition?.name}
                                </p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={dao.address}
                                link={{ href: daoAddressLink }}
                                term={t(
                                    'app.dashboard.daoDashboardPage.aside.details.address',
                                )}
                            >
                                {truncatedAddress}
                            </DefinitionList.Item>
                            {daoEns != null && (
                                <DefinitionList.Item
                                    copyValue={daoEns}
                                    link={{ href: daoAddressLink }}
                                    term={t(
                                        'app.dashboard.daoDashboardPage.aside.details.ens',
                                    )}
                                >
                                    {daoEns}
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item
                                link={{ href: daoCreationLink }}
                                term={t(
                                    'app.dashboard.daoDashboardPage.aside.details.launched',
                                )}
                            >
                                {daoLaunchedAt}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {dao.links.length > 0 && (
                        <Page.AsideCard
                            className="flex flex-col gap-4"
                            title={t(
                                'app.dashboard.daoDashboardPage.aside.links',
                            )}
                        >
                            {dao.links.map(({ url, name }) => (
                                <Link
                                    href={url}
                                    isExternal={true}
                                    key={url}
                                    showUrl={true}
                                >
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
