'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceMemberList } from '../../components/workspaceMemberList';
import { WorkspaceMembersAsideCard } from '../../components/workspaceMembersAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';

export interface IWorkspaceMembersPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of members to read per page.
     */
    pageSize: number;
}

/**
 * Members of every account of a workspace. The members of a single account are an account-scoped page, which — the
 * account being on its path — renders the DAO members page.
 *
 * Unlike proposals, Safe accounts take part: their owners are members of the workspace.
 */
export const WorkspaceMembersPageClient: React.FC<
    IWorkspaceMembersPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const accounts = workspace?.accounts ?? [];

    const { activeOption } = useWorkspaceAccountOptions();

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceMembersPage.main.title')}
            >
                <WorkspaceMemberList
                    accounts={accounts}
                    pageSize={pageSize}
                    workspaceId={workspaceId}
                />
            </Page.Main>
            <Page.Aside>
                <WorkspaceMembersAsideCard
                    accounts={accounts}
                    activeOption={activeOption}
                    pageSize={pageSize}
                />
            </Page.Aside>
        </Page.Content>
    );
};
