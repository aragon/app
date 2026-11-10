'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WorkspaceTodoList } from '../../components/workspaceTodoList';
import { WorkspaceTodosAsideCard } from '../../components/workspaceTodosAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';

export interface IWorkspaceTodosPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

const workspaceTodosCount = 12;

/**
 * To-dos of the connected wallet, scoped to the account on the route: every account of the workspace, or just the one
 * named. It is the data list the overview previews, paginated, with its totals on the aside.
 */
export const WorkspaceTodosPageClient: React.FC<
    IWorkspaceTodosPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();

    // Every account of the workspace, or just the one the route names, held by the workspace or not.
    const { activeOption, scopedAccounts, isPending } =
        useWorkspaceAccountOptions();

    return (
        <Page.Content>
            <Page.Main title={t('app.workspace.workspaceTodosPage.main.title')}>
                <WorkspaceTodoList
                    accounts={scopedAccounts}
                    isPending={isPending}
                    pageSize={workspaceTodosCount}
                    workspaceId={workspaceId}
                />
            </Page.Main>
            <Page.Aside>
                {!isPending && (
                    <WorkspaceTodosAsideCard
                        accounts={scopedAccounts}
                        title={
                            activeOption?.account == null
                                ? undefined
                                : activeOption.label
                        }
                    />
                )}
            </Page.Aside>
        </Page.Content>
    );
};
