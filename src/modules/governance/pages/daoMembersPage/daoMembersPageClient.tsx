'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { FeaturedDelegatesList } from '@/plugins/tokenPlugin/components/featuredDelegatesList';
import { useFeaturedDelegatesPlugin } from '@/plugins/tokenPlugin/hooks/useFeaturedDelegatesPlugin';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { IGetMemberListParams } from '../../api/governanceService';
import {
    DaoMemberList,
    featuredDelegatesTabId,
} from '../../components/daoMemberList';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMembersPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO member list.
     */
    initialParams: IGetMemberListParams;
    /**
     * Featured delegates config from CMS.
     */
    featuredDelegates: IFeaturedDelegates[];
}

export const daoMembersPageFilterParam = 'members';

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (
    props,
) => {
    const { initialParams, featuredDelegates } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const featuredDelegatesInfo = useFeaturedDelegatesPlugin({
        daoId,
        featuredDelegates,
    });

    // Read active tab directly from URL — DaoMemberList.Container manages URL internally.
    const activeTabParam = searchParams.get(daoMembersPageFilterParam);
    // The container defaults to the featured tab when no param is present and featured delegates exist.
    const isFeaturedTabActive =
        activeTabParam === featuredDelegatesTabId ||
        (activeTabParam == null && featuredDelegatesInfo.hasFeaturedDelegates);

    // Build synthetic featured delegates tab item for DaoMemberList.Container.
    const featuredDelegatesTab = useMemo(() => {
        if (!featuredDelegatesInfo.hasFeaturedDelegates) {
            return undefined;
        }

        const { featuredDelegatesConfig, featuredDelegatesPlugin } =
            featuredDelegatesInfo;

        return {
            id: featuredDelegatesTabId,
            uniqueId: featuredDelegatesTabId,
            label: t('app.governance.daoMembersPage.featuredDelegates.tab'),
            meta: featuredDelegatesPlugin,
            props: {},
            renderContent: () => (
                <FeaturedDelegatesList
                    addresses={featuredDelegatesConfig.delegates}
                    daoId={daoId}
                    plugin={featuredDelegatesPlugin}
                />
            ),
        };
    }, [featuredDelegatesInfo, daoId, t]);

    // Get all real body plugins to determine the active one for the aside.
    const allBodyPlugins = useDaoPlugins({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    });

    const activeRealPlugin = useMemo(() => {
        if (allBodyPlugins == null || isFeaturedTabActive) {
            return undefined;
        }

        return (
            allBodyPlugins.find((p) => p.uniqueId === activeTabParam) ??
            allBodyPlugins[0]
        );
    }, [allBodyPlugins, activeTabParam, isFeaturedTabActive]);

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList.Container
                    featuredDelegatesTab={featuredDelegatesTab}
                    initialParams={initialParams}
                />
            </Page.Main>
            <Page.Aside>
                {activeRealPlugin != null && (
                    <Page.AsideCard title={activeRealPlugin.label}>
                        <DaoPluginInfo
                            daoId={daoId}
                            plugin={activeRealPlugin.meta}
                            type={PluginType.BODY}
                        />
                    </Page.AsideCard>
                )}
                {activeRealPlugin != null && (
                    <PluginSingleComponent
                        daoId={daoId}
                        plugin={activeRealPlugin.meta}
                        pluginId={activeRealPlugin.id}
                        slotId={GovernanceSlotId.GOVERNANCE_MEMBER_PANEL}
                    />
                )}
            </Page.Aside>
        </>
    );
};
