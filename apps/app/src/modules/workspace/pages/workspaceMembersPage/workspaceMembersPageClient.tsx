'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { useWorkspace } from '@/modules/workspace/api/workspaceService';
import { WorkspaceMemberList } from '@/modules/workspace/components/workspaceMemberList';
import { workspaceBodyFilterParam } from '@/modules/workspace/constants/workspaceFilterParam';
import { useWorkspaceAccountDaos } from '@/modules/workspace/hooks/useWorkspaceAccountDaos';
import { useWorkspaceBodyPlugins } from '@/modules/workspace/hooks/useWorkspaceBodyPlugins';
import {
    type IWorkspaceBodyPlugin,
    workspaceBodyUtils,
} from '@/modules/workspace/utils/workspaceBodyUtils';
import { FeaturedDelegatesList } from '@/plugins/tokenPlugin/components/featuredDelegatesList';
import type { ITokenMemberListPluginSettings } from '@/plugins/tokenPlugin/components/tokenMemberList/tokenMemberListBase';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';

export interface IWorkspaceMembersPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of members to display per page.
     */
    pageSize: number;
    /**
     * Featured delegates config from the CMS.
     */
    featuredDelegates: IFeaturedDelegates[];
}

export const featuredDelegatesTabPrefix = 'featured-delegates';

export const WorkspaceMembersPageClient: React.FC<
    IWorkspaceMembersPageClientProps
> = (props) => {
    const { workspaceId, pageSize, featuredDelegates } = props;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { accountDaos } = useWorkspaceAccountDaos({
        accounts: workspace?.accounts,
    });
    const { bodyPlugins, isLoading } = useWorkspaceBodyPlugins({
        accounts: workspace?.accounts,
    });

    // Featured delegates tabs are synthetic: they render a CMS-driven list rather than a plugin slot component, so
    // they carry `renderContent` while otherwise matching the shape of a body tab.
    const featuredDelegatesTabs = useMemo<IWorkspaceBodyPlugin[]>(() => {
        const entries = workspaceBodyUtils.getFeaturedDelegates({
            accountDaos,
            bodyPlugins,
            featuredDelegates,
        });

        return entries.map((entry) => ({
            id: entry.plugin.interfaceType,
            uniqueId: `${featuredDelegatesTabPrefix}-${entry.accountDaoId}`,
            label: `${entry.daoName} · ${t('app.workspace.workspaceMembersPage.featuredDelegates.tab')}`,
            className: 'max-w-64 [&>div]:min-w-0 [&>div]:truncate',
            meta: entry.plugin,
            props: {},
            daoId: entry.daoId,
            daoName: entry.daoName,
            accountDaoId: entry.accountDaoId,
            renderContent: () => (
                <FeaturedDelegatesList
                    addresses={entry.config.delegates}
                    daoId={entry.accountDaoId}
                    plugin={
                        entry.plugin as IDaoPlugin<ITokenMemberListPluginSettings>
                    }
                />
            ),
        }));
    }, [accountDaos, bodyPlugins, featuredDelegates, t]);

    const tabs = useMemo(
        () => [...featuredDelegatesTabs, ...bodyPlugins],
        [featuredDelegatesTabs, bodyPlugins],
    );

    // The member list container owns the URL parameter, so the aside resolves the active tab by reading it, the same
    // way the DAO members page does.
    const activeTabParam = searchParams.get(workspaceBodyFilterParam);
    const activeTab =
        tabs.find((tab) => tab.uniqueId === activeTabParam) ?? tabs[0];

    if (isLoading) {
        return null;
    }

    return (
        <>
            <Page.Main
                title={t('app.workspace.workspaceMembersPage.main.title')}
            >
                {tabs.length === 0 ? (
                    <p className="text-neutral-500">
                        {t('app.workspace.workspaceMembersPage.empty')}
                    </p>
                ) : (
                    <WorkspaceMemberList.Container
                        bodyPlugins={bodyPlugins}
                        pageSize={pageSize}
                        searchParamName={workspaceBodyFilterParam}
                        syntheticTabs={featuredDelegatesTabs}
                    />
                )}
            </Page.Main>
            <Page.Aside>
                {activeTab != null && (
                    <>
                        <Page.AsideCard title={activeTab.label}>
                            <DaoPluginInfo
                                daoId={activeTab.daoId}
                                plugin={activeTab.meta}
                                type={PluginType.BODY}
                            />
                        </Page.AsideCard>
                        <PluginSingleComponent
                            daoId={activeTab.daoId}
                            plugin={activeTab.meta}
                            pluginId={activeTab.id}
                            slotId={GovernanceSlotId.GOVERNANCE_MEMBER_PANEL}
                        />
                    </>
                )}
            </Page.Aside>
        </>
    );
};
